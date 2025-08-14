import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Table, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { EmployerService } from '../../domain/employerService';
import { JobService } from '../../domain/jobService';

const EmployerProfile = () => {
  const { id } = useParams();
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [jobFormData, setJobFormData] = useState({
    title: '',
    location: '',
    jobType: 'Full-time',
    experience: '',
    salary: '',
    description: '',
    requirements: '',
    skills: '',
    applicationDeadline: '',
    eligibilityCriteria: {
      minCGPA: 7.0,
      departments: [],
      year: 4
    }
  });
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadEmployerProfile();
  }, [id]);

  const loadEmployerProfile = async () => {
    try {
      setLoading(true);
      const [employerData, jobsData, applicationsData] = await Promise.all([
        EmployerService.getEmployerById(id),
        EmployerService.getEmployerJobs(id),
        EmployerService.getEmployerApplications(id)
      ]);
      
      setEmployer(employerData);
      setJobs(jobsData);
      setApplications(applicationsData);
      setFormData(employerData || {});
    } catch (error) {
      console.error('Failed to load employer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setFormData(employer);
    setMessage('');
    setShowEditModal(true);
  };

  const handleAddJob = () => {
    setJobFormData({
      title: '',
      location: '',
      jobType: 'Full-time',
      experience: '',
      salary: '',
      description: '',
      requirements: '',
      skills: '',
      applicationDeadline: '',
      eligibilityCriteria: {
        minCGPA: 7.0,
        departments: [],
        year: 4
      }
    });
    setMessage('');
    setShowJobModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleJobInputChange = (e) => {
    if (e.target.name.startsWith('eligibility.')) {
      const field = e.target.name.split('.')[1];
      setJobFormData({
        ...jobFormData,
        eligibilityCriteria: {
          ...jobFormData.eligibilityCriteria,
          [field]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
        }
      });
    } else {
      setJobFormData({
        ...jobFormData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    const departments = jobFormData.eligibilityCriteria.departments;
    
    if (e.target.checked) {
      setJobFormData({
        ...jobFormData,
        eligibilityCriteria: {
          ...jobFormData.eligibilityCriteria,
          departments: [...departments, value]
        }
      });
    } else {
      setJobFormData({
        ...jobFormData,
        eligibilityCriteria: {
          ...jobFormData.eligibilityCriteria,
          departments: departments.filter(dept => dept !== value)
        }
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');

    try {
      await EmployerService.updateEmployerProfile(id, formData);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => {
        setShowEditModal(false);
        loadEmployerProfile();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');

    try {
      const jobData = {
        ...jobFormData,
        requirements: jobFormData.requirements.split('\n').filter(req => req.trim()),
        skills: jobFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      await EmployerService.postJob(id, jobData);
      setMessage('Job posted successfully!');
      
      setTimeout(() => {
        setShowJobModal(false);
        loadEmployerProfile();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'under_review': { bg: 'warning', text: 'Under Review' },
      'shortlisted': { bg: 'info', text: 'Shortlisted' },
      'accepted': { bg: 'success', text: 'Accepted' },
      'rejected': { bg: 'danger', text: 'Rejected' },
      'active': { bg: 'success', text: 'Active' },
      'inactive': { bg: 'secondary', text: 'Inactive' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
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

  if (!employer) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Employer not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Company Profile</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleEditProfile}>
            Edit Profile
          </Button>
          {employer.isVerified && (
            <Button variant="primary" onClick={handleAddJob}>
              + Post New Job
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col md={4}>
          {/* Company Card */}
          <Card className="mb-4">
            <Card.Body className="text-center">
              <img
                src={employer.logo || 'https://via.placeholder.com/200x100'}
                alt="Company Logo"
                className="mb-3"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
              <h4>{employer.companyName}</h4>
              <p className="text-muted">{employer.industry}</p>
              <div className="mb-3">
                {employer.isVerified ? (
                  <Badge bg="success" className="fs-6">✅ Verified Company</Badge>
                ) : (
                  <Badge bg="warning" className="fs-6">⏳ Verification Pending</Badge>
                )}
              </div>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Badge bg="info">{employer.companySize}</Badge>
                <Badge bg="primary">{jobs.length} Jobs Posted</Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Contact Information */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Contact Information</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Email:</strong><br />
                <a href={`mailto:${employer.email}`}>{employer.email}</a>
              </div>
              <div className="mb-2">
                <strong>Phone:</strong><br />
                <a href={`tel:${employer.phone}`}>{employer.phone}</a>
              </div>
              <div className="mb-2">
                <strong>Website:</strong><br />
                <a href={employer.website} target="_blank" rel="noopener noreferrer">
                  {employer.website}
                </a>
              </div>
              <div className="mb-2">
                <strong>Address:</strong><br />
                {employer.address}
              </div>
            </Card.Body>
          </Card>

          {/* Contact Person */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Contact Person</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Name:</strong><br />
                {employer.contactPerson}
              </div>
              <div className="mb-2">
                <strong>Designation:</strong><br />
                {employer.contactDesignation}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {/* Company Description */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">About Company</h5>
            </Card.Header>
            <Card.Body>
              <p>{employer.description || 'No description available.'}</p>
            </Card.Body>
          </Card>

          {/* Job Postings */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Job Postings</h5>
              <Badge bg="info">{jobs.length} Jobs</Badge>
            </Card.Header>
            <Card.Body>
              {jobs.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Applications</th>
                        <th>Status</th>
                        <th>Posted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id}>
                          <td>
                            <Link to={`/job/${job.id}`} className="text-decoration-none">
                              {job.title}
                            </Link>
                          </td>
                          <td>{job.location}</td>
                          <td>{job.jobType}</td>
                          <td>{job.applicationsReceived}</td>
                          <td>{getStatusBadge(job.status)}</td>
                          <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No jobs posted yet.</p>
                  {employer.isVerified ? (
                    <Button variant="primary" onClick={handleAddJob}>
                      Post Your First Job
                    </Button>
                  ) : (
                    <p className="text-muted">Complete verification to post jobs.</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Recent Applications */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Applications</h5>
            </Card.Header>
            <Card.Body>
              {applications.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Job</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 10).map(application => (
                        <tr key={application.id}>
                          <td>{application.studentName}</td>
                          <td>{application.jobTitle}</td>
                          <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
                          <td>{getStatusBadge(application.status)}</td>
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
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Company Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleProfileSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry *</Form.Label>
                  <Form.Control
                    type="text"
                    name="industry"
                    value={formData.industry || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Website *</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowEditModal(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Job Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Post New Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleJobSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={jobFormData.title}
                    onChange={handleJobInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={jobFormData.location}
                    onChange={handleJobInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type *</Form.Label>
                  <Form.Select
                    name="jobType"
                    value={jobFormData.jobType}
                    onChange={handleJobInputChange}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience *</Form.Label>
                  <Form.Control
                    type="text"
                    name="experience"
                    value={jobFormData.experience}
                    onChange={handleJobInputChange}
                    placeholder="e.g., 0-2 years"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Salary *</Form.Label>
                  <Form.Control
                    type="text"
                    name="salary"
                    value={jobFormData.salary}
                    onChange={handleJobInputChange}
                    placeholder="e.g., $70,000 - $90,000"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Application Deadline *</Form.Label>
                  <Form.Control
                    type="date"
                    name="applicationDeadline"
                    value={jobFormData.applicationDeadline}
                    onChange={handleJobInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Job Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={jobFormData.description}
                onChange={handleJobInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Requirements (one per line) *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="requirements"
                value={jobFormData.requirements}
                onChange={handleJobInputChange}
                placeholder="Bachelor's degree in Computer Science&#10;Proficiency in JavaScript&#10;Experience with React"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Skills (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={jobFormData.skills}
                onChange={handleJobInputChange}
                placeholder="JavaScript, React, Node.js, Python"
              />
            </Form.Group>

            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Eligibility Criteria</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum CGPA</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        name="eligibility.minCGPA"
                        value={jobFormData.eligibilityCriteria.minCGPA}
                        onChange={handleJobInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Year</Form.Label>
                      <Form.Select
                        name="eligibility.year"
                        value={jobFormData.eligibilityCriteria.year}
                        onChange={handleJobInputChange}
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Eligible Departments</Form.Label>
                  <div>
                    {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'].map(dept => (
                      <Form.Check
                        key={dept}
                        type="checkbox"
                        label={dept}
                        value={dept}
                        checked={jobFormData.eligibilityCriteria.departments.includes(dept)}
                        onChange={handleDepartmentChange}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowJobModal(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployerProfile;
