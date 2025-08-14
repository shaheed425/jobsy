import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Tabs, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { StudentService } from '../../domain/studentService';
import { EmployerService } from '../../domain/employerService';

const Register = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    rollNumber: '',
    department: '',
    year: '',
    cgpa: ''
  });

  const [employerForm, setEmployerForm] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    website: '',
    industry: '',
    address: '',
    contactPerson: '',
    description: ''
  });

  const handleStudentChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEmployerChange = (e) => {
    setEmployerForm({
      ...employerForm,
      [e.target.name]: e.target.value
    });
  };

  const validateStudentForm = () => {
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (studentForm.password !== studentForm.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (studentForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const validateEmployerForm = () => {
    if (!employerForm.companyName || !employerForm.email || !employerForm.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (employerForm.password !== employerForm.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (employerForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStudentForm()) return;

    try {
      setLoading(true);
      const studentData = {
        ...studentForm,
        userType: 'student',
        isEligible: true,
        skills: [],
        certifications: []
      };
      
      await StudentService.registerStudent(studentData);
      setSuccess('Student registration successful! You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmployerForm()) return;

    try {
      setLoading(true);
      const employerData = {
        ...employerForm,
        userType: 'employer',
        isVerified: false
      };
      
      await EmployerService.registerEmployer(employerData);
      setSuccess('Employer registration successful! Please wait for verification.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-primary text-white text-center py-4">
                <h3 className="mb-0">Create Your Account</h3>
                <p className="mb-0 mt-2">Join PlaceHub and start your journey</p>
              </Card.Header>
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-4"
                  justify
                >
                  <Tab eventKey="student" title="Student Registration">
                    <Form onSubmit={handleStudentSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={studentForm.name}
                              onChange={handleStudentChange}
                              placeholder="Enter your full name"
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
                              value={studentForm.email}
                              onChange={handleStudentChange}
                              placeholder="Enter your email"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={studentForm.password}
                              onChange={handleStudentChange}
                              placeholder="Enter password"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={studentForm.confirmPassword}
                              onChange={handleStudentChange}
                              placeholder="Confirm password"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={studentForm.phone}
                              onChange={handleStudentChange}
                              placeholder="Enter phone number"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Roll Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="rollNumber"
                              value={studentForm.rollNumber}
                              onChange={handleStudentChange}
                              placeholder="Enter roll number"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Select
                              name="department"
                              value={studentForm.department}
                              onChange={handleStudentChange}
                            >
                              <option value="">Select Department</option>
                              <option value="Computer Science">Computer Science</option>
                              <option value="Information Technology">Information Technology</option>
                              <option value="Electronics">Electronics</option>
                              <option value="Mechanical">Mechanical</option>
                              <option value="Civil">Civil</option>
                              <option value="Electrical">Electrical</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Year</Form.Label>
                            <Form.Select
                              name="year"
                              value={studentForm.year}
                              onChange={handleStudentChange}
                            >
                              <option value="">Select Year</option>
                              <option value="1">1st Year</option>
                              <option value="2">2nd Year</option>
                              <option value="3">3rd Year</option>
                              <option value="4">4th Year</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>CGPA</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              name="cgpa"
                              value={studentForm.cgpa}
                              onChange={handleStudentChange}
                              placeholder="Enter CGPA"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Student Account'}
                      </Button>
                    </Form>
                  </Tab>

                  <Tab eventKey="employer" title="Employer Registration">
                    <Form onSubmit={handleEmployerSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Company Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="companyName"
                              value={employerForm.companyName}
                              onChange={handleEmployerChange}
                              placeholder="Enter company name"
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
                              value={employerForm.email}
                              onChange={handleEmployerChange}
                              placeholder="Enter company email"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={employerForm.password}
                              onChange={handleEmployerChange}
                              placeholder="Enter password"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={employerForm.confirmPassword}
                              onChange={handleEmployerChange}
                              placeholder="Confirm password"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={employerForm.phone}
                              onChange={handleEmployerChange}
                              placeholder="Enter phone number"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Website</Form.Label>
                            <Form.Control
                              type="url"
                              name="website"
                              value={employerForm.website}
                              onChange={handleEmployerChange}
                              placeholder="Enter company website"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Industry</Form.Label>
                            <Form.Select
                              name="industry"
                              value={employerForm.industry}
                              onChange={handleEmployerChange}
                            >
                              <option value="">Select Industry</option>
                              <option value="Technology">Technology</option>
                              <option value="Finance">Finance</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Manufacturing">Manufacturing</option>
                              <option value="Consulting">Consulting</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              type="text"
                              name="address"
                              value={employerForm.address}
                              onChange={handleEmployerChange}
                              placeholder="Enter company address"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Contact Person</Form.Label>
                            <Form.Control
                              type="text"
                              name="contactPerson"
                              value={employerForm.contactPerson}
                              onChange={handleEmployerChange}
                              placeholder="Enter contact person name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          {/* Empty column for spacing */}
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Company Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="description"
                          value={employerForm.description}
                          onChange={handleEmployerChange}
                          placeholder="Brief description of your company"
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Employer Account'}
                      </Button>
                    </Form>
                  </Tab>
                </Tabs>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign In
                    </Link>
                  </p>
                  <p className="mt-2">
                    <Link to="/" className="text-muted text-decoration-none">
                      ← Back to Home
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
