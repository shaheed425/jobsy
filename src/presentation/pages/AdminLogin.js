import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { adminAPI } from '../../data/api';
import { StudentService } from '../../domain/studentService';
import { EmployerService } from '../../domain/employerService';

const AdminLogin = () => {
  const { login } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('admin');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminAPI.login(formData.username, formData.password);
      if (result.success) {
        login(result.user, 'admin');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For demo purposes, we'll find student by email or student ID
      const students = await StudentService.getAllStudents();
      const student = students.find(s => 
        s.email === formData.email || s.studentId === formData.studentId
      );

      if (student) {
        login(student, 'student');
      } else {
        setError('Student not found. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For demo purposes, we'll find employer by email
      const employers = await EmployerService.getAllEmployers();
      const employer = employers.find(e => e.email === formData.email);

      if (employer) {
        login(employer, 'employer');
      } else {
        setError('Employer not found. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = {
    admin: { username: 'admin', password: 'admin123' },
    student: { email: 'john.doe@university.edu', studentId: 'STU001' },
    employer: { email: 'hr@techcorp.com' }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg">
            <Card.Header className="text-center">
              <h3 className="mb-0">🎓 Placement Portal Login</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k);
                  setFormData({ username: '', password: '', email: '', studentId: '' });
                  setError('');
                }}
                className="mb-4"
              >
                <Tab eventKey="admin" title="Admin Login">
                  <Form onSubmit={handleAdminLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter admin username"
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login as Admin'}
                    </Button>
                    
                    {/* <Alert variant="info" className="small">
                      <strong>Demo Credentials:</strong><br />
                      Username: {demoCredentials.admin.username}<br />
                      Password: {demoCredentials.admin.password}
                    </Alert> */}
                  </Form>
                </Tab>
                
                <Tab eventKey="student" title="Student Login">
                  <Form onSubmit={handleStudentLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email or Student ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email or student ID"
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      variant="success" 
                      type="submit" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login as Student'}
                    </Button>
                    
                    {/* <Alert variant="info" className="small">
                      <strong>Demo Credentials:</strong><br />
                      Email: {demoCredentials.student.email}<br />
                      Student ID: {demoCredentials.student.studentId}
                    </Alert> */}
                  </Form>
                </Tab>
                
                <Tab eventKey="employer" title="Employer Login">
                  <Form onSubmit={handleEmployerLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter company email"
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      variant="warning" 
                      type="submit" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login as Employer'}
                    </Button>
                    
                    {/* <Alert variant="info" className="small">
                      <strong>Demo Credentials:</strong><br />
                      Email: {demoCredentials.employer.email}
                    </Alert> */}
                  </Form>
                </Tab>
              </Tabs>
              
              <div className="text-center mt-4">
                <Link to="/" className="btn btn-outline-secondary mb-3">
                  ← Back to Home
                </Link>
                <div>
                  <small className="text-muted">
                    This is a demo system. Use the provided credentials above to explore different user roles.
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;
