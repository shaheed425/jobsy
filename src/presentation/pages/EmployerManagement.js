import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { EmployerService } from '../../domain/employerService';

const EmployerManagement = () => {
  const { userType } = useContext(AppContext);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    industry: '',
    companySize: '',
    description: '',
    contactPerson: '',
    contactDesignation: ''
  });
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    try {
      setLoading(true);
      const employersData = await EmployerService.getAllEmployers();
      setEmployers(employersData);
    } catch (error) {
      console.error('Failed to load employers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployer = () => {
    setSelectedEmployer(null);
    setIsEditing(false);
    setFormData({
      companyName: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      industry: '',
      companySize: '',
      description: '',
      contactPerson: '',
      contactDesignation: ''
    });
    setMessage('');
    setShowModal(true);
  };

  const handleEditEmployer = (employer) => {
    setSelectedEmployer(employer);
    setIsEditing(true);
    setFormData({
      companyName: employer.companyName,
      email: employer.email,
      phone: employer.phone,
      website: employer.website,
      address: employer.address,
      industry: employer.industry,
      companySize: employer.companySize,
      description: employer.description,
      contactPerson: employer.contactPerson,
      contactDesignation: employer.contactDesignation
    });
    setMessage('');
    setShowModal(true);
  };

  const handleVerifyEmployer = async (employerId) => {
    try {
      await EmployerService.verifyEmployer(employerId);
      setMessage('Employer verified successfully!');
      loadEmployers();
    } catch (error) {
      setMessage(error.message);
    }
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
      if (isEditing) {
        await EmployerService.updateEmployerProfile(selectedEmployer.id, formData);
        setMessage('Employer updated successfully!');
      } else {
        await EmployerService.registerEmployer(formData);
        setMessage('Employer registered successfully!');
      }

      setTimeout(() => {
        setShowModal(false);
        loadEmployers();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const getVerificationBadge = (isVerified) => {
    return isVerified ? 
      <Badge bg="success">Verified</Badge> : 
      <Badge bg="warning">Pending</Badge>;
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
        <h2>Employer Management</h2>
        {userType === 'admin' && (
          <Button variant="primary" onClick={handleAddEmployer}>
            + Add New Employer
          </Button>
        )}
      </div>

      {message && (
        <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
          {message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{employers.length}</h3>
              <p>Total Employers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{employers.filter(e => e.isVerified).length}</h3>
              <p>Verified Employers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{employers.filter(e => !e.isVerified).length}</h3>
              <p>Pending Verification</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{employers.reduce((total, emp) => total + (emp.jobsPosted ? emp.jobsPosted.length : 0), 0)}</h3>
              <p>Total Jobs Posted</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Employers Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">All Employers</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Industry</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Jobs Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employers.map(employer => (
                  <tr key={employer.id}>
                    <td>
                      <Link to={`/employer/${employer.id}`} className="text-decoration-none">
                        <strong>{employer.companyName}</strong>
                      </Link>
                    </td>
                    <td>{employer.industry}</td>
                    <td>
                      {employer.contactPerson}
                      <br />
                      <small className="text-muted">{employer.contactDesignation}</small>
                    </td>
                    <td>{employer.email}</td>
                    <td>{getVerificationBadge(employer.isVerified)}</td>
                    <td>{employer.jobsPosted ? employer.jobsPosted.length : 0}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          as={Link} 
                          to={`/employer/${employer.id}`}
                          variant="outline-primary" 
                          size="sm"
                        >
                          View
                        </Button>
                        {userType === 'admin' && (
                          <>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleEditEmployer(employer)}
                            >
                              Edit
                            </Button>
                            {!employer.isVerified && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleVerifyEmployer(employer.id)}
                              >
                                Verify
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Employer Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Employer' : 'Add New Employer'}</Modal.Title>
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
                  <Form.Label>Company Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry *</Form.Label>
                  <Form.Select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="Technology Consulting">Technology Consulting</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </Form.Select>
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
                    value={formData.email}
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website *</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    required
                    placeholder="https://www.company.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Size</Form.Label>
                  <Form.Select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-100">51-100 employees</option>
                    <option value="101-500">101-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the company..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person *</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Designation</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactDesignation"
                    value={formData.contactDesignation}
                    onChange={handleInputChange}
                    placeholder="e.g., HR Manager"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : (isEditing ? 'Update Employer' : 'Add Employer')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployerManagement;
