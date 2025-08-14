import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { StudentService } from '../../domain/studentService';
import { EmployerService } from '../../domain/employerService';
import { JobService } from '../../domain/jobService';
import { ApplicationService } from '../../domain/applicationService';
import { NotificationService } from '../../domain/notificationService';

const Dashboard = () => {
  const { user, userType } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userType, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      let data = {};

      if (userType === 'admin') {
        const [students, employers, jobs, applications, notifications] = await Promise.all([
          StudentService.getAllStudents(),
          EmployerService.getAllEmployers(),
          JobService.getAllJobs(),
          ApplicationService.getAllApplications(),
          NotificationService.getAllNotifications()
        ]);

        data = {
          totalStudents: students.length,
          eligibleStudents: students.filter(s => s.isEligible).length,
          totalEmployers: employers.length,
          verifiedEmployers: employers.filter(e => e.isVerified).length,
          totalJobs: jobs.length,
          activeJobs: jobs.filter(j => j.status === 'active').length,
          totalApplications: applications.length,
          recentApplications: applications.slice(-5),
          recentJobs: jobs.slice(-5),
          recentNotifications: notifications.slice(-10)
        };
      } else if (userType === 'student') {
        const [studentProfile, applications, jobs, notifications] = await Promise.all([
          StudentService.getStudentById(user.id),
          ApplicationService.getApplicationsByStudent(user.id),
          JobService.getJobsForStudent(user.id),
          NotificationService.getNotificationsForRecipient('student', user.id)
        ]);

        data = {
          profile: studentProfile,
          totalApplications: applications.length,
          pendingApplications: applications.filter(a => a.status === 'under_review').length,
          acceptedApplications: applications.filter(a => a.status === 'accepted').length,
          availableJobs: jobs.length,
          recentApplications: applications.slice(-5),
          recommendedJobs: jobs.slice(0, 5),
          recentNotifications: notifications.slice(-5)
        };
      } else if (userType === 'employer') {
        const dashboardInfo = await EmployerService.getEmployerDashboard(user.id);
        data = dashboardInfo;
      }

      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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

  const renderAdminDashboard = () => (
    <>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData?.totalStudents || 0}</h3>
              <p>Total Students</p>
              <small>{dashboardData?.eligibleStudents || 0} Eligible</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData?.totalEmployers || 0}</h3>
              <p>Total Employers</p>
              <small>{dashboardData?.verifiedEmployers || 0} Verified</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData?.totalJobs || 0}</h3>
              <p>Total Jobs</p>
              <small>{dashboardData?.activeJobs || 0} Active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.totalApplications}</h3>
              <p>Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recent Applications</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentApplications.map(app => (
                    <tr key={app.id}>
                      <td>{app.studentName}</td>
                      <td>{app.jobTitle}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recent Job Postings</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recentJobs?.map(job => (
                    <tr key={job.id}>
                      <td>
                        <Link to={`/job/${job.id}`} className="text-decoration-none">
                          {job.title}
                        </Link>
                      </td>
                      <td>{job.company}</td>
                      <td>{getStatusBadge(job.status)}</td>
                      <td>{job.applicationsReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.totalApplications}</h3>
              <p>Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.pendingApplications}</h3>
              <p>Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.acceptedApplications}</h3>
              <p>Accepted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.availableJobs}</h3>
              <p>Available Jobs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">My Recent Applications</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentApplications.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentApplications.map(app => (
                      <tr key={app.id}>
                        <td>{app.jobTitle}</td>
                        <td>{app.company}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No applications yet. <Link to="/jobs">Browse jobs</Link> to get started!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recommended Jobs</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recommendedJobs.length > 0 ? (
                dashboardData.recommendedJobs.map(job => (
                  <div key={job.id} className="border-bottom pb-2 mb-2">
                    <h6>
                      <Link to={`/job/${job.id}`} className="text-decoration-none">
                        {job.title}
                      </Link>
                    </h6>
                    <small className="text-muted">{job.company} • {job.location}</small>
                  </div>
                ))
              ) : (
                <p className="text-muted">Complete your profile to get personalized job recommendations.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderEmployerDashboard = () => (
    <>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.totalJobs}</h3>
              <p>Total Jobs Posted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.activeJobs}</h3>
              <p>Active Jobs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.totalApplications}</h3>
              <p>Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <h3>{dashboardData.applicationsByStatus.shortlisted}</h3>
              <p>Shortlisted</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recent Applications</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentApplications.map(app => (
                    <tr key={app.id}>
                      <td>{app.studentName}</td>
                      <td>{app.jobTitle}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">My Job Postings</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentJobs.map(job => (
                <div key={job.id} className="border-bottom pb-2 mb-2">
                  <h6>
                    <Link to={`/job/${job.id}`} className="text-decoration-none">
                      {job.title}
                    </Link>
                  </h6>
                  <small className="text-muted">
                    {job.applicationsReceived} applications • Posted {new Date(job.postedDate).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <div>
          <span className="text-muted">Welcome back, </span>
          <strong>{user?.name || user?.username || user?.companyName}</strong>
        </div>
      </div>

      {userType === 'admin' && renderAdminDashboard()}
      {userType === 'student' && renderStudentDashboard()}
      {userType === 'employer' && renderEmployerDashboard()}
    </Container>
  );
};

export default Dashboard;
