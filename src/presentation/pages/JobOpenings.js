import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { JobService } from '../../domain/jobService';
import { ApplicationService } from '../../domain/applicationService';

const JobOpenings = () => {
  const { user, userType } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    company: '',
    experience: ''
  });
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    documents: []
  });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  useEffect(() => {
    loadJobs();
  }, [userType, user]);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      let jobsData;
      
      if (userType === 'student') {
        jobsData = await JobService.getJobsForStudent(user.id);
      } else if (userType === 'employer') {
        jobsData = await JobService.getAllJobs();
        jobsData = jobsData.filter(job => job.companyId === user.id);
      } else {
        jobsData = await JobService.getAllJobs();
      }
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = jobs;

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => job.jobType === filters.jobType);
    }

    if (filters.company) {
      filtered = filtered.filter(job => 
        job.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.experience) {
      filtered = filtered.filter(job => 
        job.experience.toLowerCase().includes(filters.experience.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      company: '',
      experience: ''
    });
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setApplicationData({ coverLetter: '', documents: [] });
    setApplicationMessage('');
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setApplicationLoading(true);
    setApplicationMessage('');

    try {
      await ApplicationService.submitApplication({
        studentId: user.id,
        jobId: selectedJob.id,
        coverLetter: applicationData.coverLetter,
        documents: applicationData.documents
      });

      setApplicationMessage('Application submitted successfully!');
      setTimeout(() => {
        setShowApplicationModal(false);
        loadJobs(); // Refresh jobs to update available jobs for student
      }, 2000);
    } catch (error) {
      setApplicationMessage(error.message);
    } finally {
      setApplicationLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { bg: 'success', text: 'Active' },
      'inactive': { bg: 'secondary', text: 'Inactive' },
      'expired': { bg: 'danger', text: 'Expired' }
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

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {userType === 'student' ? 'Available Jobs' : 
           userType === 'employer' ? 'My Job Postings' : 'All Job Openings'}
        </h2>
        <Badge bg="info">{filteredJobs.length} Jobs</Badge>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">🔍 Search & Filter Jobs</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Job Type</Form.Label>
                <Form.Select
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Company</Form.Label>
                <Form.Control
                  type="text"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  placeholder="Enter company name"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Experience</Form.Label>
                <Form.Control
                  type="text"
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  placeholder="e.g., 0-2 years"
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="outline-secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Card.Body>
      </Card>

      {/* Job Listings */}
      <Row>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <Col md={6} lg={4} key={job.id} className="mb-4">
              <Card className="job-card h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{job.company}</h6>
                  {getStatusBadge(job.status)}
                </Card.Header>
                <Card.Body>
                  <h5 className="card-title">
                    <Link to={`/job/${job.id}`} className="text-decoration-none">
                      {job.title}
                    </Link>
                  </h5>
                  <p className="text-muted mb-2">
                    📍 {job.location} • 💼 {job.jobType}
                  </p>
                  <p className="text-muted mb-2">
                    💰 {job.salary} • 🎯 {job.experience}
                  </p>
                  
                  <p className="card-text">
                    {job.description.length > 100 
                      ? `${job.description.substring(0, 100)}...` 
                      : job.description
                    }
                  </p>
                  
                  {job.skills && (
                    <div className="mb-3">
                      {job.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="skill-tag me-1">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-muted">+{job.skills.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </small>
                    <small className="text-muted">
                      {job.applicationsReceived} applications
                    </small>
                  </div>

                  {isDeadlineApproaching(job.applicationDeadline) && (
                    <Alert variant="warning" className="mt-2 py-2">
                      <small>⚠️ Deadline approaching: {new Date(job.applicationDeadline).toLocaleDateString()}</small>
                    </Alert>
                  )}
                </Card.Body>
                <Card.Footer className="bg-transparent">
                  <div className="d-flex gap-2">
                    <Button 
                      as={Link} 
                      to={`/job/${job.id}`} 
                      variant="outline-primary" 
                      size="sm"
                      className="flex-grow-1"
                    >
                      View Details
                    </Button>
                    {userType === 'student' && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleApplyClick(job)}
                        disabled={new Date() > new Date(job.applicationDeadline)}
                      >
                        {new Date() > new Date(job.applicationDeadline) ? 'Expired' : 'Apply Now'}
                      </Button>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Card className="text-center">
              <Card.Body>
                <h5>No jobs found</h5>
                <p className="text-muted">
                  {userType === 'student' 
                    ? 'No jobs match your criteria or eligibility. Try adjusting your filters or complete your profile.'
                    : 'No jobs found matching your search criteria.'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Application Modal */}
      <Modal show={showApplicationModal} onHide={() => setShowApplicationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Apply for {selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applicationMessage && (
            <Alert variant={applicationMessage.includes('successfully') ? 'success' : 'danger'}>
              {applicationMessage}
            </Alert>
          )}
          
          {selectedJob && (
            <div className="mb-3">
              <h6>{selectedJob.company}</h6>
              <p className="text-muted">{selectedJob.location} • {selectedJob.jobType}</p>
            </div>
          )}

          <Form onSubmit={handleApplicationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  coverLetter: e.target.value
                })}
                placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role..."
                required
                minLength={50}
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {applicationData.coverLetter.length}/1000 characters (minimum 50)
              </Form.Text>
            </Form.Group>

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

export default JobOpenings;
