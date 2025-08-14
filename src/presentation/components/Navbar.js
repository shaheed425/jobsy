import React, { useContext, useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { NotificationService } from '../../domain/notificationService';

const Navbar = () => {
  const { user, userType, logout } = useContext(AppContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userType) {
      loadUnreadCount();
    }
  }, [user, userType]);

  const loadUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount(
        userType === 'admin' ? 'all_students' : userType,
        userType !== 'admin' ? user.id : null
      );
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount }
    ];

    if (userType === 'admin') {
      return [
        ...commonItems,
        { path: '/students', label: 'Students', icon: '👥' },
        { path: '/employers', label: 'Employers', icon: '🏢' },
        { path: '/jobs', label: 'Jobs', icon: '💼' },
        { path: '/applications', label: 'Applications', icon: '📋' }
      ];
    } else if (userType === 'student') {
      return [
        ...commonItems,
        { path: '/jobs', label: 'Job Openings', icon: '💼' },
        { path: '/applications', label: 'My Applications', icon: '📋' },
        { path: `/student/${user.id}`, label: 'My Profile', icon: '👤' }
      ];
    } else if (userType === 'employer') {
      return [
        ...commonItems,
        { path: '/jobs', label: 'My Jobs', icon: '💼' },
        { path: '/applications', label: 'Applications', icon: '📋' },
        { path: `/employer/${user.id}`, label: 'Company Profile', icon: '🏢' }
      ];
    }

    return commonItems;
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm" fixed="top">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/dashboard" className="text-primary">
          <strong>🎓 Jobsy</strong>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {getNavItems().map((item) => (
              <Nav.Link 
                key={item.path}
                as={Link} 
                to={item.path}
                className="d-flex align-items-center"
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
                {item.badge > 0 && (
                  <Badge bg="danger" className="ms-2">
                    {item.badge}
                  </Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>
          
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-primary" id="user-dropdown">
                <span className="me-2">👤</span>
                {user?.name || user?.username || user?.companyName}
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Header>
                  <div className="fw-bold">{user?.name || user?.username || user?.companyName}</div>
                  <small className="text-muted text-capitalize">{userType}</small>
                </Dropdown.Header>
                <Dropdown.Divider />
                
                {userType === 'student' && (
                  <Dropdown.Item as={Link} to={`/student/${user.id}`}>
                    <span className="me-2">👤</span>My Profile
                  </Dropdown.Item>
                )}
                
                {userType === 'employer' && (
                  <Dropdown.Item as={Link} to={`/employer/${user.id}`}>
                    <span className="me-2">🏢</span>Company Profile
                  </Dropdown.Item>
                )}
                
                <Dropdown.Item as={Link} to="/notifications">
                  <span className="me-2">🔔</span>
                  Notifications
                  {unreadCount > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Dropdown.Item>
                
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <span className="me-2">🚪</span>Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
