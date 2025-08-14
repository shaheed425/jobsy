import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { AppContext } from '../../App';
import { NotificationService } from '../../domain/notificationService';

const Notifications = () => {
  const { user, userType } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    loadNotifications();
  }, [userType, user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let notificationsData;

      if (userType === 'admin') {
        notificationsData = await NotificationService.getAllNotifications();
      } else {
        notificationsData = await NotificationService.getNotificationsForRecipient(
          userType === 'student' ? 'student' : 'employer',
          user.id
        );
        
        // Also get notifications for "all_students" or "all_employers"
        const generalNotifications = await NotificationService.getNotificationsForRecipient(
          userType === 'student' ? 'all_students' : 'all_employers'
        );
        
        notificationsData = [...notificationsData, ...generalNotifications];
      }

      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.isRead);
      await Promise.all(
        unreadNotifications.map(notif => NotificationService.markAsRead(notif.id))
      );
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notif => !notif.isRead);
      case 'read':
        return notifications.filter(notif => notif.isRead);
      default:
        return notifications;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      'job_posting': '💼',
      'application_status': '📋',
      'interview_schedule': '📅',
      'deadline_reminder': '⏰',
      'profile_update': '👤',
      'company_verification': '✅'
    };
    return typeIcons[type] || '📢';
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

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notifications</h2>
        <div className="d-flex gap-2">
          <Badge bg="danger">{unreadCount} Unread</Badge>
          {unreadCount > 0 && (
            <Button variant="outline-primary" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="notifications-container">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''} ${
                notification.priority === 'high' ? 'high-priority' : ''
              }`}
            >
              <Row className="align-items-center">
                <Col xs={1}>
                  <div className="text-center">
                    <div className="fs-4">{getTypeIcon(notification.type)}</div>
                    <small>{getPriorityIcon(notification.priority)}</small>
                  </div>
                </Col>
                <Col xs={8}>
                  <div>
                    <h6 className="mb-1">
                      {notification.title}
                      {!notification.isRead && (
                        <Badge bg="primary" className="ms-2">New</Badge>
                      )}
                    </h6>
                    <p className="mb-1 text-muted">{notification.message}</p>
                    <small className="text-muted">
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                </Col>
                <Col xs={3} className="text-end">
                  <div className="d-flex flex-column gap-1">
                    <Badge bg="secondary" className="text-capitalize">
                      {notification.type.replace('_', ' ')}
                    </Badge>
                    {!notification.isRead && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <Card.Body>
            <div className="py-4">
              <h5>No notifications found</h5>
              <p className="text-muted">
                {filter === 'unread' 
                  ? 'You have no unread notifications.'
                  : filter === 'read'
                  ? 'You have no read notifications.'
                  : 'You have no notifications yet.'
                }
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Notification Types Legend */}
      <Card className="mt-4">
        <Card.Header>
          <h6 className="mb-0">Notification Types</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">💼</span>
                <span>Job Postings</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">📋</span>
                <span>Application Status Updates</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">📅</span>
                <span>Interview Schedules</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">⏰</span>
                <span>Deadline Reminders</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">👤</span>
                <span>Profile Updates</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">✅</span>
                <span>Company Verification</span>
              </div>
            </Col>
          </Row>
          
          <hr />
          
          <div className="d-flex gap-4">
            <div className="d-flex align-items-center">
              <span className="me-2">Priority:</span>
              <span className="me-2">🔴 High</span>
              <span className="me-2">🟡 Medium</span>
              <span className="me-2">🟢 Low</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
