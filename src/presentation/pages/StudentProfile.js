import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Table, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { StudentService } from '../../domain/studentService';
import { ApplicationService } from '../../domain/applicationService';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadStudentProfile();
  }, [id]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const [studentData, applicationsData] = await Promise.all([
        StudentService.getStudentById(id),
        ApplicationService.getApplicationsByStudent(id)
      ]);
      
      setStudent(studentData);
      setApplications(applicationsData);
      setFormData(studentData || {});
    } catch (error) {
      console.error('Failed to load student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setFormData({
      ...student,
      skills: student.skills ? student.skills.join(', ') : '',
      certifications: student.certifications ? student.certifications.join(', ') : ''
    });
    setMessage('');
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');

    try {
      const updateData = {
        ...formData,
        year: parseInt(formData.year),
        cgpa: parseFloat(formData.cgpa),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        certifications: formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert)
      };

      await StudentService.updateStudentProfile(id, updateData);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => {
        setShowEditModal(false);
        loadStudentProfile();
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
      'rejected': { bg: 'danger', text: 'Rejected' }
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

  if (!student) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Student not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Profile</h2>
        <Button variant="primary" onClick={handleEditProfile}>
          Edit Profile
        </Button>
      </div>

      <Row>
        <Col md={4}>
          {/* Profile Card */}
          <Card className="mb-4">
            <Card.Body className="text-center">
              <img
                src={student.profilePicture || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="profile-picture mb-3"
              />
              <h4>{student.name}</h4>
              <p className="text-muted">{student.studentId}</p>
              <div className="mb-3">
                {student.isEligible ? (
                  <Badge bg="success" className="fs-6">✅ Eligible for Placements</Badge>
                ) : (
                  <Badge bg="warning" className="fs-6">⚠️ Not Eligible</Badge>
                )}
              </div>
              <div className="d-flex justify-content-center gap-2">
                <Badge bg="primary">{student.department}</Badge>
                <Badge bg="info">Year {student.year}</Badge>
                <Badge bg={student.cgpa >= 8.0 ? 'success' : student.cgpa >= 7.0 ? 'warning' : 'danger'}>
                  CGPA: {student.cgpa}
                </Badge>
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
                <a href={`mailto:${student.email}`}>{student.email}</a>
              </div>
              <div className="mb-2">
                <strong>Phone:</strong><br />
                <a href={`tel:${student.phone}`}>{student.phone}</a>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {/* Academic Details */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Academic Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Department:</strong><br />
                    {student.department}
                  </div>
                  <div className="mb-3">
                    <strong>Current Year:</strong><br />
                    {student.year}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>CGPA:</strong><br />
                    <Badge bg={student.cgpa >= 8.0 ? 'success' : student.cgpa >= 7.0 ? 'warning' : 'danger'}>
                      {student.cgpa}/10
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <strong>Placement Eligibility:</strong><br />
                    {student.isEligible ? (
                      <Badge bg="success">Eligible</Badge>
                    ) : (
                      <Badge bg="warning">Not Eligible</Badge>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Skills */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Skills</h5>
            </Card.Header>
            <Card.Body>
              {student.skills && student.skills.length > 0 ? (
                <div>
                  {student.skills.map(skill => (
                    <span key={skill} className="skill-tag me-2 mb-2">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No skills listed</p>
              )}
            </Card.Body>
          </Card>

          {/* Certifications */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Certifications</h5>
            </Card.Header>
            <Card.Body>
              {student.certifications && student.certifications.length > 0 ? (
                <ul className="list-unstyled">
                  {student.certifications.map((cert, index) => (
                    <li key={index} className="mb-2">
                      <Badge bg="outline-primary" className="me-2">🏆</Badge>
                      {cert}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No certifications listed</p>
              )}
            </Card.Body>
          </Card>

          {/* Application History */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Application History</h5>
            </Card.Header>
            <Card.Body>
              {applications.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Interview Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(application => (
                        <tr key={application.id}>
                          <td>{application.jobTitle}</td>
                          <td>{application.company}</td>
                          <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
                          <td>{getStatusBadge(application.status)}</td>
                          <td>
                            {application.interviewDate ? 
                              new Date(application.interviewDate).toLocaleDateString() : 
                              '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted">No applications submitted yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
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
            </Row>

            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CGPA *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cgpa"
                    value={formData.cgpa || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Skills</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={formData.skills || ''}
                onChange={handleInputChange}
                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Python)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Certifications</Form.Label>
              <Form.Control
                type="text"
                name="certifications"
                value={formData.certifications || ''}
                onChange={handleInputChange}
                placeholder="Enter certifications separated by commas"
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
    </Container>
  );
};

export default StudentProfile;
