import { applicationsAPI, studentsAPI, jobsAPI, notificationsAPI } from '../data/api';
import { StudentService } from './studentService';

export class ApplicationService {
  // Get all applications
  static async getAllApplications() {
    try {
      return await applicationsAPI.getAll();
    } catch (error) {
      throw new Error('Failed to fetch applications: ' + error.message);
    }
  }

  // Submit job application
  static async submitApplication(applicationData) {
    try {
      // Validate application data
      this.validateApplicationData(applicationData);

      // Check if student exists and is eligible
      const student = await studentsAPI.getById(applicationData.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      if (!student.isEligible) {
        throw new Error('Student is not eligible for placements');
      }

      // Check if job exists and is active
      const job = await jobsAPI.getById(applicationData.jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'active') {
        throw new Error('Job is no longer accepting applications');
      }

      // Check application deadline
      if (new Date() > new Date(job.applicationDeadline)) {
        throw new Error('Application deadline has passed');
      }

      // Check if student meets job eligibility criteria
      const isEligibleForJob = this.checkJobEligibility(student, job.eligibilityCriteria);
      if (!isEligibleForJob) {
        throw new Error('Student does not meet job eligibility criteria');
      }

      // Check if student has already applied for this job
      const existingApplications = await applicationsAPI.getByStudentId(applicationData.studentId);
      const hasApplied = existingApplications.some(app => app.jobId === applicationData.jobId);
      if (hasApplied) {
        throw new Error('You have already applied for this job');
      }

      // Create application
      const newApplication = await applicationsAPI.create({
        ...applicationData,
        studentName: student.name,
        jobTitle: job.title,
        company: job.company,
        status: 'under_review'
      });

      // Update student's applied jobs list
      const updatedAppliedJobs = [...student.appliedJobs, applicationData.jobId];
      await studentsAPI.update(applicationData.studentId, { appliedJobs: updatedAppliedJobs });

      // Create notification for student
      await notificationsAPI.create({
        type: 'application_submitted',
        title: 'Application Submitted Successfully',
        message: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
        recipient: 'student',
        recipientId: applicationData.studentId,
        priority: 'medium',
        relatedApplicationId: newApplication.id
      });

      return newApplication;
    } catch (error) {
      throw new Error('Failed to submit application: ' + error.message);
    }
  }

  // Get applications by student
  static async getApplicationsByStudent(studentId) {
    try {
      return await applicationsAPI.getByStudentId(studentId);
    } catch (error) {
      throw new Error('Failed to fetch student applications: ' + error.message);
    }
  }

  // Get applications by job
  static async getApplicationsByJob(jobId) {
    try {
      return await applicationsAPI.getByJobId(jobId);
    } catch (error) {
      throw new Error('Failed to fetch job applications: ' + error.message);
    }
  }

  // Update application status
  static async updateApplicationStatus(applicationId, status, feedback = null, interviewDate = null) {
    try {
      const application = await applicationsAPI.updateStatus(applicationId, status, feedback);
      
      // Update interview date if provided
      if (interviewDate) {
        // This would typically be a separate API call in a real system
        application.interviewDate = interviewDate;
      }

      // Create appropriate notification
      const statusMessages = {
        under_review: 'Your application is under review.',
        shortlisted: 'Congratulations! You have been shortlisted for the next round.',
        accepted: 'Congratulations! Your application has been accepted.',
        rejected: 'Thank you for your interest. Unfortunately, your application was not selected this time.'
      };

      if (statusMessages[status]) {
        await notificationsAPI.create({
          type: 'application_status',
          title: 'Application Status Update',
          message: `${application.jobTitle} at ${application.company} - ${statusMessages[status]}`,
          recipient: 'student',
          recipientId: application.studentId,
          priority: status === 'accepted' ? 'high' : 'medium',
          relatedApplicationId: applicationId
        });
      }

      // If interview is scheduled, create interview notification
      if (interviewDate) {
        await notificationsAPI.create({
          type: 'interview_schedule',
          title: 'Interview Scheduled',
          message: `Your interview for ${application.jobTitle} at ${application.company} is scheduled for ${new Date(interviewDate).toLocaleDateString()} at ${new Date(interviewDate).toLocaleTimeString()}.`,
          recipient: 'student',
          recipientId: application.studentId,
          priority: 'high',
          relatedApplicationId: applicationId
        });
      }

      return application;
    } catch (error) {
      throw new Error('Failed to update application status: ' + error.message);
    }
  }

  // Check if student is eligible for specific job
  static checkJobEligibility(student, eligibilityCriteria) {
    if (!eligibilityCriteria) return true;

    // Check CGPA requirement
    if (eligibilityCriteria.minCGPA && student.cgpa < eligibilityCriteria.minCGPA) {
      return false;
    }

    // Check department requirement
    if (eligibilityCriteria.departments && !eligibilityCriteria.departments.includes(student.department)) {
      return false;
    }

    // Check year requirement
    if (eligibilityCriteria.year && student.year < eligibilityCriteria.year) {
      return false;
    }

    return true;
  }

  // Validate application data
  static validateApplicationData(applicationData) {
    const requiredFields = ['studentId', 'jobId', 'coverLetter'];
    
    for (const field of requiredFields) {
      if (!applicationData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate cover letter length
    if (applicationData.coverLetter.length < 50) {
      throw new Error('Cover letter must be at least 50 characters long');
    }

    if (applicationData.coverLetter.length > 1000) {
      throw new Error('Cover letter must not exceed 1000 characters');
    }
  }

  // Get application statistics
  static async getApplicationStatistics() {
    try {
      const applications = await applicationsAPI.getAll();
      
      const stats = {
        total: applications.length,
        byStatus: {
          under_review: applications.filter(app => app.status === 'under_review').length,
          shortlisted: applications.filter(app => app.status === 'shortlisted').length,
          accepted: applications.filter(app => app.status === 'accepted').length,
          rejected: applications.filter(app => app.status === 'rejected').length
        },
        byMonth: this.groupApplicationsByMonth(applications),
        recentApplications: applications
          .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
          .slice(0, 10)
      };

      return stats;
    } catch (error) {
      throw new Error('Failed to get application statistics: ' + error.message);
    }
  }

  // Group applications by month for analytics
  static groupApplicationsByMonth(applications) {
    const monthGroups = {};
    
    applications.forEach(app => {
      const date = new Date(app.applicationDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = 0;
      }
      monthGroups[monthKey]++;
    });

    return monthGroups;
  }

  // Get application details with related data
  static async getApplicationDetails(applicationId) {
    try {
      const applications = await applicationsAPI.getAll();
      const application = applications.find(app => app.id === parseInt(applicationId));
      
      if (!application) {
        throw new Error('Application not found');
      }

      const student = await studentsAPI.getById(application.studentId);
      const job = await jobsAPI.getById(application.jobId);

      return {
        application,
        student,
        job
      };
    } catch (error) {
      throw new Error('Failed to get application details: ' + error.message);
    }
  }
}
