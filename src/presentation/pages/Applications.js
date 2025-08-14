import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { ApplicationService } from '../../domain/applicationService';
import { EmployerService } from '../../domain/employerService';

const Applications = () => {
  const { user, userType } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    feedback: '',
    interviewDate: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadApplications();
  }, [userType, user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      let applicationsData;

      if (userType === 'student') {
        applicationsData = await ApplicationService.getApplicationsByStudent(user.id);
      } else if (userType === 'employer') {
        applicationsData = await EmployerService.getEmployerApplications(user.id);
      } else {
        applicationsData = await ApplicationService.getAllApplications();
      }

      setApplications(applicationsData);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (application) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status: application.status,
      feedback: application.feedback || '',
      interviewDate: application.interviewDate || ''
    });
    setMessage('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage('');

    try {
      await ApplicationService.updateApplicationStatus(
        selectedApplication.id,
        statusUpdate.status,
        statusUpdate.feedback,
        statusUpdate.interviewDate || null
      );

      setMessage('Application status updated successfully!');
      setTimeout(() => {
        setShowStatusModal(false);
        loadApplications();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'under_review': { bg: 'warning', text: 'Under Review' },
      'shortlisted': { bg: 'info', text: 'Shortlisted' },
      'accepted': { bg: 'success', text: 'Accepted' },
      'rejected': { bg: 'danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      under_review: applications.filter(app => app.status === 'under_review').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    return stats;
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

  const stats = getApplicationStats();

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {userType === 'student' ? 'My Applications' : 
           userType === 'employer' ? 'Job Applications' : 'All Applications'}
        </h2>
        <Badge bg="info">{applications.length} Applications</Badge>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{stats.total}</h3>
              <p>Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{stats.under_review}</h3>
              <p>Under Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{stats.shortlisted}</h3>
              <p>Shortlisted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{stats.accepted}</h3>
              <p>Accepted</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applications Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Applications List</h5>
        </Card.Header>
        <Card.Body>
          {applications.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    {userType !== 'student' && <th>Student</th>}
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    {userType !== 'student' && <th>Interview Date</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(application => (
                    <tr key={application.id}>
                      {userType !== 'student' && (
                        <td>
                          <Link to={`/student/${application.studentId}`} className="text-decoration-none">
                            {application.studentName}
                          </Link>
                        </td>
                      )}
                      <td>
                        <Link to={`/job/${application.jobId}`} className="text-decoration-none">
                          {application.jobTitle}
                        </Link>
                      </td>
                      <td>{application.company}</td>
                      <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
                      <td>{getStatusBadge(application.status)}</td>
                      {userType !== 'student' && (
                        <td>
                          {application.interviewDate ? 
                            new Date(application.interviewDate).toLocaleDateString() : 
                            '-'
                          }
                        </td>
                      )}
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              // Show application details modal
                              alert(`Cover Letter: ${application.coverLetter}`);
                            }}
                          >
                            View
                          </Button>
                          {(userType === 'employer' || userType === 'admin') && (
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleStatusUpdate(application)}
                            >
                              Update Status
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <h5>No applications found</h5>
              <p className="text-muted">
                {userType === 'student' 
                  ? 'You haven\'t applied to any jobs yet. Browse available jobs to get started!'
                  : 'No applications received yet.'
                }
              </p>
              {userType === 'student' && (
                <Button as={Link} to="/jobs" variant="primary">
                  Browse Jobs
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Application Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          {selectedApplication && (
            <div className="mb-3">
              <h6>{selectedApplication.studentName}</h6>
              <p className="text-muted">
                {selectedApplication.jobTitle} at {selectedApplication.company}
              </p>
            </div>
          )}

          <Form onSubmit={handleStatusSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Status *</Form.Label>
              <Form.Select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({
                  ...statusUpdate,
                  status: e.target.value
                })}
                required
              >
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusUpdate.feedback}
                onChange={(e) => setStatusUpdate({
                  ...statusUpdate,
                  feedback: e.target.value
                })}
                placeholder="Provide feedback to the student..."
              />
            </Form.Group>

            {statusUpdate.status === 'shortlisted' && (
              <Form.Group className="mb-3">
                <Form.Label>Interview Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={statusUpdate.interviewDate}
                  onChange={(e) => setStatusUpdate({
                    ...statusUpdate,
                    interviewDate: e.target.value
                  })}
                />
              </Form.Group>
            )}

            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowStatusModal(false)}
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Applications;
