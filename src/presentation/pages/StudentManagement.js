import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { StudentService } from '../../domain/studentService';

const StudentManagement = () => {
  const { userType } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    department: '',
    year: '',
    cgpa: '',
    skills: '',
    certifications: ''
  });
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await StudentService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      studentId: '',
      department: '',
      year: '',
      cgpa: '',
      skills: '',
      certifications: ''
    });
    setMessage('');
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      studentId: student.studentId,
      department: student.department,
      year: student.year.toString(),
      cgpa: student.cgpa.toString(),
      skills: student.skills ? student.skills.join(', ') : '',
      certifications: student.certifications ? student.certifications.join(', ') : ''
    });
    setMessage('');
    setShowModal(true);
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
      const studentData = {
        ...formData,
        year: parseInt(formData.year),
        cgpa: parseFloat(formData.cgpa),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        certifications: formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert)
      };

      if (isEditing) {
        await StudentService.updateStudentProfile(selectedStudent.id, studentData);
        setMessage('Student updated successfully!');
      } else {
        await StudentService.registerStudent(studentData);
        setMessage('Student registered successfully!');
      }

      setTimeout(() => {
        setShowModal(false);
        loadStudents();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const getEligibilityBadge = (isEligible) => {
    return isEligible ? 
      <Badge bg="success">Eligible</Badge> : 
      <Badge bg="warning">Not Eligible</Badge>;
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
        <h2>Student Management</h2>
        {userType === 'admin' && (
          <Button variant="primary" onClick={handleAddStudent}>
            + Add New Student
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{students.filter(s => s.isEligible).length}</h3>
              <p>Eligible Students</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{students.filter(s => s.year === 4).length}</h3>
              <p>Final Year</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{students.filter(s => s.cgpa >= 8.0).length}</h3>
              <p>CGPA ≥ 8.0</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Students Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">All Students</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>CGPA</th>
                  <th>Eligibility</th>
                  <th>Applications</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.studentId}</td>
                    <td>
                      <Link to={`/student/${student.id}`} className="text-decoration-none">
                        {student.name}
                      </Link>
                    </td>
                    <td>{student.department}</td>
                    <td>{student.year}</td>
                    <td>
                      <Badge bg={student.cgpa >= 8.0 ? 'success' : student.cgpa >= 7.0 ? 'warning' : 'danger'}>
                        {student.cgpa}
                      </Badge>
                    </td>
                    <td>{getEligibilityBadge(student.isEligible)}</td>
                    <td>{student.appliedJobs ? student.appliedJobs.length : 0}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          as={Link} 
                          to={`/student/${student.id}`}
                          variant="outline-primary" 
                          size="sm"
                        >
                          View
                        </Button>
                        {userType === 'admin' && (
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            Edit
                          </Button>
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

      {/* Add/Edit Student Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Student' : 'Add New Student'}</Modal.Title>
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
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Student ID *</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentId"
                    value={formData.studentId}
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
                  <Form.Label>Department *</Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Year *</Form.Label>
                  <Form.Select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>CGPA *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Skills</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Python)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Certifications</Form.Label>
              <Form.Control
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                placeholder="Enter certifications separated by commas"
              />
            </Form.Group>

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
                {formLoading ? 'Saving...' : (isEditing ? 'Update Student' : 'Add Student')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StudentManagement;
