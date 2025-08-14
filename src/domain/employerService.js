import { employersAPI, jobsAPI, applicationsAPI, notificationsAPI } from '../data/api';

export class EmployerService {
  // Get all employers
  static async getAllEmployers() {
    try {
      return await employersAPI.getAll();
    } catch (error) {
      throw new Error('Failed to fetch employers: ' + error.message);
    }
  }

  // Get employer by ID
  static async getEmployerById(id) {
    try {
      return await employersAPI.getById(id);
    } catch (error) {
      throw new Error('Failed to fetch employer: ' + error.message);
    }
  }

  // Register new employer/company
  static async registerEmployer(employerData) {
    try {
      // Validate required fields
      this.validateEmployerData(employerData);
      
      const newEmployer = await employersAPI.create({
        ...employerData,
        isVerified: false,
        jobsPosted: []
      });

      // Create verification notification
      await notificationsAPI.create({
        type: 'company_registration',
        title: 'Company Registration Received',
        message: 'Your company registration is under review. You will be notified once verified.',
        recipient: 'employer',
        recipientId: newEmployer.id,
        priority: 'medium'
      });

      return newEmployer;
    } catch (error) {
      throw new Error('Failed to register employer: ' + error.message);
    }
  }

  // Update employer profile
  static async updateEmployerProfile(id, updateData) {
    try {
      return await employersAPI.update(id, updateData);
    } catch (error) {
      throw new Error('Failed to update employer profile: ' + error.message);
    }
  }

  // Verify employer
  static async verifyEmployer(id) {
    try {
      const updatedEmployer = await employersAPI.update(id, { isVerified: true });
      
      // Create verification success notification
      await notificationsAPI.create({
        type: 'company_verification',
        title: 'Company Profile Verified',
        message: 'Your company profile has been successfully verified. You can now post job openings.',
        recipient: 'employer',
        recipientId: id,
        priority: 'high'
      });

      return updatedEmployer;
    } catch (error) {
      throw new Error('Failed to verify employer: ' + error.message);
    }
  }

  // Get jobs posted by employer
  static async getEmployerJobs(employerId) {
    try {
      const allJobs = await jobsAPI.getAll();
      return allJobs.filter(job => job.companyId === parseInt(employerId));
    } catch (error) {
      throw new Error('Failed to fetch employer jobs: ' + error.message);
    }
  }

  // Post new job
  static async postJob(employerId, jobData) {
    try {
      const employer = await employersAPI.getById(employerId);
      
      if (!employer) {
        throw new Error('Employer not found');
      }

      if (!employer.isVerified) {
        throw new Error('Company must be verified to post jobs');
      }

      // Validate job data
      this.validateJobData(jobData);

      const newJob = await jobsAPI.create({
        ...jobData,
        companyId: employerId,
        company: employer.companyName
      });

      // Update employer's posted jobs
      const updatedJobsList = [...employer.jobsPosted, newJob.id];
      await employersAPI.update(employerId, { jobsPosted: updatedJobsList });

      // Create notification for all students
      await notificationsAPI.create({
        type: 'job_posting',
        title: `New Job Posted: ${jobData.title}`,
        message: `${employer.companyName} has posted a new ${jobData.title} position. Apply now!`,
        recipient: 'all_students',
        priority: 'medium',
        relatedJobId: newJob.id
      });

      return newJob;
    } catch (error) {
      throw new Error('Failed to post job: ' + error.message);
    }
  }

  // Get applications for employer's jobs
  static async getEmployerApplications(employerId) {
    try {
      const employerJobs = await this.getEmployerJobs(employerId);
      const jobIds = employerJobs.map(job => job.id);
      
      const allApplications = await applicationsAPI.getAll();
      return allApplications.filter(app => jobIds.includes(app.jobId));
    } catch (error) {
      throw new Error('Failed to fetch employer applications: ' + error.message);
    }
  }

  // Update application status
  static async updateApplicationStatus(applicationId, status, feedback = null) {
    try {
      const updatedApplication = await applicationsAPI.updateStatus(applicationId, status, feedback);
      
      // Create notification for student
      const statusMessages = {
        shortlisted: 'Congratulations! You have been shortlisted.',
        accepted: 'Congratulations! Your application has been accepted.',
        rejected: 'Thank you for your interest. Unfortunately, your application was not selected this time.'
      };

      if (statusMessages[status]) {
        await notificationsAPI.create({
          type: 'application_status',
          title: 'Application Status Update',
          message: `Your application for ${updatedApplication.jobTitle} at ${updatedApplication.company} - ${statusMessages[status]}`,
          recipient: 'student',
          recipientId: updatedApplication.studentId,
          priority: 'high',
          relatedApplicationId: applicationId
        });
      }

      return updatedApplication;
    } catch (error) {
      throw new Error('Failed to update application status: ' + error.message);
    }
  }

  // Validate employer data
  static validateEmployerData(employerData) {
    const requiredFields = ['companyName', 'email', 'phone', 'website', 'address', 'industry', 'contactPerson'];
    
    for (const field of requiredFields) {
      if (!employerData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employerData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate website URL
    try {
      new URL(employerData.website);
    } catch {
      throw new Error('Invalid website URL');
    }
  }

  // Validate job data
  static validateJobData(jobData) {
    const requiredFields = ['title', 'location', 'jobType', 'experience', 'salary', 'description', 'requirements'];
    
    for (const field of requiredFields) {
      if (!jobData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate eligibility criteria
    if (jobData.eligibilityCriteria) {
      if (!jobData.eligibilityCriteria.minCGPA || jobData.eligibilityCriteria.minCGPA < 0 || jobData.eligibilityCriteria.minCGPA > 10) {
        throw new Error('Valid minimum CGPA is required (0-10)');
      }
      
      if (!jobData.eligibilityCriteria.departments || jobData.eligibilityCriteria.departments.length === 0) {
        throw new Error('At least one department must be specified');
      }
    }
  }

  // Generate employer dashboard data
  static async getEmployerDashboard(employerId) {
    try {
      const employer = await employersAPI.getById(employerId);
      const jobs = await this.getEmployerJobs(employerId);
      const applications = await this.getEmployerApplications(employerId);

      const dashboard = {
        employer,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: applications.length,
        applicationsByStatus: {
          under_review: applications.filter(app => app.status === 'under_review').length,
          shortlisted: applications.filter(app => app.status === 'shortlisted').length,
          accepted: applications.filter(app => app.status === 'accepted').length,
          rejected: applications.filter(app => app.status === 'rejected').length
        },
        recentJobs: jobs.slice(-5),
        recentApplications: applications.slice(-10)
      };

      return dashboard;
    } catch (error) {
      throw new Error('Failed to generate employer dashboard: ' + error.message);
    }
  }
}
