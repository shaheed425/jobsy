import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { JobService } from '../../domain/jobService';
import { ApplicationService } from '../../domain/applicationService';
import { EmployerService } from '../../domain/employerService';

const JobDetails = () => {
  const { id } = useParams();
  const { user, userType } = useContext(AppContext);
  const [jobDetails, setJobDetails] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: ''
  });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const details = await JobService.getJobDetails(id);
      setJobDetails(details);
      
      if (userType === 'employer' || userType === 'admin') {
        const jobApplications = await ApplicationService.getApplicationsByJob(id);
        setApplications(jobApplications);
      }
    } catch (error) {
      console.error('Failed to load job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    setApplicationData({ coverLetter: '' });
    setMessage('');
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setApplicationLoading(true);
    setMessage('');

    try {
      await ApplicationService.submitApplication({
        studentId: user.id,
        jobId: parseInt(id),
        coverLetter: applicationData.coverLetter
      });

      setMessage('Application submitted successfully!');
      setTimeout(() => {
        setShowApplicationModal(false);
        loadJobDetails();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setApplicationLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { bg: 'success', text: 'Active' },
      'inactive': { bg: 'secondary', text: 'Inactive' },
      'expired': { bg: 'danger', text: 'Expired' },
      'under_review': { bg: 'warning', text: 'Under Review' },
      'shortlisted': { bg: 'info', text: 'Shortlisted' },
      'accepted': { bg: 'success', text: 'Accepted' },
      'rejected': { bg: 'danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const isDeadlineApproaching = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const isDeadlinePassed = (deadline) => {
    return new Date() > new Date(deadline);
  };

  const canApply = () => {
    if (userType !== 'student') return false;
    if (isDeadlinePassed(jobDetails.job.applicationDeadline)) return false;
    
    // Check if student has already applied
    if (user.appliedJobs && user.appliedJobs.includes(parseInt(id))) return false;
    
    return true;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!jobDetails) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Job not found.</Alert>
      </Container>
    );
  }

  const { job } = jobDetails;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          {/* Job Header */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-2">{job.title}</h2>
                  <h5 className="text-primary mb-2">{job.company}</h5>
                  <div className="d-flex gap-3 text-muted">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.jobType}</span>
                    <span>🎯 {job.experience}</span>
                    <span>💰 {job.salary}</span>
                  </div>
                </div>
                <div className="text-end">
                  {getStatusBadge(job.status)}
                  {isDeadlineApproaching(job.applicationDeadline) && (
                    <div className="mt-2">
                      <Badge bg="warning">⚠️ Deadline Soon</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Posted: {new Date(job.postedDate).toLocaleDateString()} • 
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </small>
                </div>
                <div>
                  <Badge bg="info">{jobDetails.applicationCount} Applications</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Job Description */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Job Description</h5>
            </Card.Header>
            <Card.Body>
              <p>{job.description}</p>
            </Card.Body>
          </Card>

          {/* Requirements */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Requirements</h5>
            </Card.Header>
            <Card.Body>
              <ul>
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="mb-2">{requirement}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Required Skills</h5>
              </Card.Header>
              <Card.Body>
                <div>
                  {job.skills.map(skill => (
                    <span key={skill} className="skill-tag me-2 mb-2">
                      {skill}
                    </span>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Applications (for employers/admin) */}
          {(userType === 'employer' || userType === 'admin') && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Applications ({applications.length})</h5>
              </Card.Header>
              <Card.Body>
                {applications.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(application => (
                          <tr key={application.id}>
                            <td>
                              <Link to={`/student/${application.studentId}`} className="text-decoration-none">
                                {application.studentName}
                              </Link>
                            </td>
                            <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
                            <td>{getStatusBadge(application.status)}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => {
                                  alert(`Cover Letter: ${application.coverLetter}`);
                                }}
                              >
                                View Application
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted">No applications received yet.</p>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          {/* Apply Card */}
          {userType === 'student' && (
            <Card className="mb-4">
              <Card.Body className="text-center">
                {canApply() ? (
                  <>
                    <h5 className="text-success mb-3">Ready to Apply?</h5>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-100"
                      onClick={handleApplyClick}
                    >
                      Apply Now
                    </Button>
                    <small className="text-muted d-block mt-2">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </small>
                  </>
                ) : (
                  <>
                    {isDeadlinePassed(job.applicationDeadline) ? (
                      <div>
                        <h5 className="text-danger mb-3">Application Closed</h5>
                        <p className="text-muted">The application deadline has passed.</p>
                      </div>
                    ) : user.appliedJobs && user.appliedJobs.includes(parseInt(id)) ? (
                      <div>
                        <h5 className="text-info mb-3">Already Applied</h5>
                        <p className="text-muted">You have already applied for this position.</p>
                        <Button 
                          as={Link}
                          to="/applications"
                          variant="outline-primary"
                          size="sm"
                        >
                          View My Applications
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h5 className="text-warning mb-3">Cannot Apply</h5>
                        <p className="text-muted">You may not meet the eligibility criteria.</p>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Eligibility Criteria */}
          {job.eligibilityCriteria && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Eligibility Criteria</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Minimum CGPA:</strong><br />
                  <Badge bg="info">{job.eligibilityCriteria.minCGPA}</Badge>
                </div>
                <div className="mb-2">
                  <strong>Minimum Year:</strong><br />
                  <Badge bg="info">Year {job.eligibilityCriteria.year}</Badge>
                </div>
                <div className="mb-2">
                  <strong>Eligible Departments:</strong><br />
                  {job.eligibilityCriteria.departments.map(dept => (
                    <Badge key={dept} bg="outline-primary" className="me-1 mb-1">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Company Info */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">About Company</h6>
            </Card.Header>
            <Card.Body>
              <h6>{job.company}</h6>
              <p className="text-muted small">
                View full company profile and other job openings.
              </p>
              <Button 
                as={Link}
                to={`/employer/${job.companyId}`}
                variant="outline-primary" 
                size="sm"
              >
                View Company Profile
              </Button>
            </Card.Body>
          </Card>

          {/* Job Stats */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Job Statistics</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Applications:</span>
                <Badge bg="info">{jobDetails.applicationCount}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Eligible Students:</span>
                <Badge bg="success">{jobDetails.eligibleStudentCount}</Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Days Until Deadline:</span>
                <Badge bg={jobDetails.daysUntilDeadline <= 3 ? 'danger' : 'warning'}>
                  {jobDetails.daysUntilDeadline > 0 ? jobDetails.daysUntilDeadline : 'Expired'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Application Modal */}
      <Modal show={showApplicationModal} onHide={() => setShowApplicationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Apply for {job.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}
          
          <div className="mb-3">
            <h6>{job.company}</h6>
            <p className="text-muted">{job.location} • {job.jobType}</p>
          </div>

          <Form onSubmit={handleApplicationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter *</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  coverLetter: e.target.value
                })}
                placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role. Highlight your relevant skills, experience, and enthusiasm for the position..."
                required
                minLength={50}
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {applicationData.coverLetter.length}/1000 characters (minimum 50)
              </Form.Text>
            </Form.Group>

            <Alert variant="info">
              <small>
                <strong>Tips for a great cover letter:</strong>
                <ul className="mb-0 mt-2">
                  <li>Address the specific job requirements</li>
                  <li>Highlight relevant skills and projects</li>
                  <li>Show enthusiasm for the company and role</li>
                  <li>Keep it concise and professional</li>
                </ul>
              </small>
            </Alert>

            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowApplicationModal(false)}
                disabled={applicationLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={applicationLoading || applicationData.coverLetter.length < 50}
              >
                {applicationLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default JobDetails;
