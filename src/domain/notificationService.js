import { notificationsAPI } from '../data/api';

export class NotificationService {
  // Get all notifications
  static async getAllNotifications() {
    try {
      return await notificationsAPI.getAll();
    } catch (error) {
      throw new Error('Failed to fetch notifications: ' + error.message);
    }
  }

  // Get notifications for specific recipient
  static async getNotificationsForRecipient(recipient, recipientId = null) {
    try {
      const notifications = await notificationsAPI.getByRecipient(recipient, recipientId);
      return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      throw new Error('Failed to fetch recipient notifications: ' + error.message);
    }
  }

  // Create new notification
  static async createNotification(notificationData) {
    try {
      this.validateNotificationData(notificationData);
      return await notificationsAPI.create(notificationData);
    } catch (error) {
      throw new Error('Failed to create notification: ' + error.message);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      return await notificationsAPI.markAsRead(notificationId);
    } catch (error) {
      throw new Error('Failed to mark notification as read: ' + error.message);
    }
  }

  // Get unread notifications count
  static async getUnreadCount(recipient, recipientId = null) {
    try {
      const notifications = await this.getNotificationsForRecipient(recipient, recipientId);
      return notifications.filter(notif => !notif.isRead).length;
    } catch (error) {
      throw new Error('Failed to get unread count: ' + error.message);
    }
  }

  // Send job posting notification to all students
  static async notifyJobPosting(jobData) {
    try {
      return await this.createNotification({
        type: 'job_posting',
        title: `New Job Posted: ${jobData.title}`,
        message: `${jobData.company} has posted a new ${jobData.title} position. Apply now!`,
        recipient: 'all_students',
        priority: 'medium',
        relatedJobId: jobData.id
      });
    } catch (error) {
      throw new Error('Failed to send job posting notification: ' + error.message);
    }
  }

  // Send application status notification
  static async notifyApplicationStatus(applicationData, status) {
    try {
      const statusMessages = {
        under_review: 'Your application is under review.',
        shortlisted: 'Congratulations! You have been shortlisted.',
        accepted: 'Congratulations! Your application has been accepted.',
        rejected: 'Thank you for your interest. Unfortunately, your application was not selected this time.'
      };

      return await this.createNotification({
        type: 'application_status',
        title: 'Application Status Update',
        message: `${applicationData.jobTitle} at ${applicationData.company} - ${statusMessages[status]}`,
        recipient: 'student',
        recipientId: applicationData.studentId,
        priority: status === 'accepted' ? 'high' : 'medium',
        relatedApplicationId: applicationData.id
      });
    } catch (error) {
      throw new Error('Failed to send application status notification: ' + error.message);
    }
  }

  // Get notification statistics
  static async getNotificationStatistics() {
    try {
      const notifications = await notificationsAPI.getAll();
      
      const stats = {
        total: notifications.length,
        byType: {
          job_posting: notifications.filter(n => n.type === 'job_posting').length,
          application_status: notifications.filter(n => n.type === 'application_status').length,
          interview_schedule: notifications.filter(n => n.type === 'interview_schedule').length,
          deadline_reminder: notifications.filter(n => n.type === 'deadline_reminder').length,
          profile_update: notifications.filter(n => n.type === 'profile_update').length,
          company_verification: notifications.filter(n => n.type === 'company_verification').length
        },
        byPriority: {
          high: notifications.filter(n => n.priority === 'high').length,
          medium: notifications.filter(n => n.priority === 'medium').length,
          low: notifications.filter(n => n.priority === 'low').length
        },
        unreadCount: notifications.filter(n => !n.isRead).length,
        recentNotifications: notifications
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
      };

      return stats;
    } catch (error) {
      throw new Error('Failed to get notification statistics: ' + error.message);
    }
  }

  // Validate notification data
  static validateNotificationData(notificationData) {
    const requiredFields = ['type', 'title', 'message', 'recipient', 'priority'];
    
    for (const field of requiredFields) {
      if (!notificationData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate type
    const validTypes = ['job_posting', 'application_status', 'interview_schedule', 'deadline_reminder', 'profile_update', 'company_verification'];
    if (!validTypes.includes(notificationData.type)) {
      throw new Error('Invalid notification type');
    }

    // Validate recipient
    const validRecipients = ['student', 'employer', 'all_students', 'all_employers'];
    if (!validRecipients.includes(notificationData.recipient)) {
      throw new Error('Invalid recipient type');
    }

    // Validate priority
    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(notificationData.priority)) {
      throw new Error('Invalid priority level');
    }

    // Validate message length
    if (notificationData.message.length > 500) {
      throw new Error('Message must not exceed 500 characters');
    }
  }
}

//   // Send application status notification
//   static async notifyApplicationStatus(applicationData, status) {
//     try {
//       const statusMessages = {
//         under_review: 'Your application is under review.',
//         shortlisted: 'Congratulations! You have been shortlisted.',
//         accepted: 'Congratulations! Your application has been accepted.',
//         rejected: 'Thank you for your interest. Unfortunately, your application was not selected this time.'
//       };

//       return await this.createNotification({
//         type: 'application_status',
//         title: 'Application Status Update',
//         message: `${applicationData.jobTitle} at ${applicationData.company} - ${statusMessages[status]}`,
//         recipient: 'student',
//         recipientId: applicationData.studentId,
//         priority: status === 'accepted' ? 'high' : 'medium',
//         relatedApplicationId: applicationData.id
//       });
//     } catch (error) {
//       throw new Error('Failed to send application status notification: ' + error.message);
//     }
//   }

//   // Send interview schedule notification
//   static async notifyInterviewSchedule(applicationData, interviewDate) {
//     try {
//       const formattedDate = new Date(interviewDate).toLocaleDateString();
//       const formattedTime = new Date(interviewDate).toLocaleTimeString();

//       return await this.createNotification({
//         type: 'interview_schedule',
//         title: 'Interview Scheduled',
//         message: `Your interview for ${applicationData.jobTitle} at ${applicationData.company} is scheduled for ${formattedDate} at ${formattedTime}.`,
//         recipient: 'student',
//         recipientId: applicationData.studentId,
//         priority: 'high',
//         relatedApplicationId: applicationData.id
//       });
//     } catch (error) {
//       throw new Error('Failed to send interview schedule notification: ' + error.message);
//     }
//   }

//   // Send deadline reminder notifications
//   static async sendDeadlineReminders() {
//     try {
//       // This would typically be called by a scheduled job
//       // For now, we'll implement basic logic to check for upcoming deadlines
//       const jobs = await jobsAPI.getAll();
//       const threeDaysFromNow = new Date();
//       threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

//       const upcomingDeadlines = jobs.filter(job => {
//         const deadline = new Date(job.applicationDeadline);
//         return deadline <= threeDaysFromNow && deadline > new Date() && job.status === 'active';
//       });

//       const notifications = [];
//       for (const job of upcomingDeadlines) {
//         const notification = await this.createNotification({
//           type: 'deadline_reminder',
//           title: 'Application Deadline Reminder',
//           message: `Reminder: Application deadline for ${job.title} at ${job.company} is in 3 days.`,
//           recipient: 'all_students',
//           priority: 'medium',
//           relatedJobId: job.id
//         });
//         notifications.push(notification);
//       }

//       return notifications;
//     } catch (error) {
//       throw new Error('Failed to send deadline reminders: ' + error.message);
//     }
//   }

//   // Get notification statistics
//   static async getNotificationStatistics() {
//     try {
//       const notifications = await notificationsAPI.getAll();
      
//       const stats = {
//         total: notifications.length,
//         byType: {
//           job_posting: notifications.filter(n => n.type === 'job_posting').length,
//           application_status: notifications.filter(n => n.type === 'application_status').length,
//           interview_schedule: notifications.filter(n => n.type === 'interview_schedule').length,
//           deadline_reminder: notifications.filter(n => n.type === 'deadline_reminder').length,
//           profile_update: notifications.filter(n => n.type === 'profile_update').length,
//           company_verification: notifications.filter(n => n.type === 'company_verification').length
//         },
//         byPriority: {
//           high: notifications.filter(n => n.priority === 'high').length,
//           medium: notifications.filter(n => n.priority === 'medium').length,
//           low: notifications.filter(n => n.priority === 'low').length
//         },
//         unreadCount: notifications.filter(n => !n.isRead).length,
//         recentNotifications: notifications
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//           .slice(0, 10)
//       };

//       return stats;
//     } catch (error) {
//       throw new Error('Failed to get notification statistics: ' + error.message);
//     }
//   }

//   // Validate notification data
//   static validateNotificationData(notificationData) {
//     const requiredFields = ['type', 'title', 'message', 'recipient', 'priority'];
    
//     for (const field of requiredFields) {
//       if (!notificationData[field]) {
//         throw new Error(`${field} is required`);
//       }
//     }

//     // Validate type
//     const validTypes = ['job_posting', 'application_status', 'interview_schedule', 'deadline_reminder', 'profile_update', 'company_verification'];
//     if (!validTypes.includes(notificationData.type)) {
//       throw new Error('Invalid notification type');
//     }

//     // Validate recipient
//     const validRecipients = ['student', 'employer', 'all_students', 'all_employers'];
//     if (!validRecipients.includes(notificationData.recipient)) {
//       throw new Error('Invalid recipient type');
//     }

//     // Validate priority
//     const validPriorities = ['high', 'medium', 'low'];
//     if (!validPriorities.includes(notificationData.priority)) {
//       throw new Error('Invalid priority level');
//     }

//     // Validate message length
//     if (notificationData.message.length > 500) {
//       throw new Error('Message must not exceed 500 characters');
//     }
//   }

//   // Simulate email/SMS sending (mock implementation)
//   static async sendEmailNotification(recipientEmail, notification) {
//     try {
//       // In a real implementation, this would integrate with email service
//       console.log(`Email sent to ${recipientEmail}:`, {
//         subject: notification.title,
//         body: notification.message,
//         priority: notification.priority
//       });
      
//       return { success: true, message: 'Email sent successfully' };
//     } catch (error) {
//       throw new Error('Failed to send email notification: ' + error.message);
//     }
//   }

//   static async sendSMSNotification(recipientPhone, notification) {
//     try {
//       // In a real implementation, this would integrate with SMS service
//       console.log(`SMS sent to ${recipientPhone}:`, {
//         message: `${notification.title}: ${notification.message}`,
//         priority: notification.priority
//       });
      
//       return { success: true, message: 'SMS sent successfully' };
//     } catch (error) {
//       throw new Error('Failed to send SMS notification: ' + error.message);
//     }
//   }
// }
