import { jobsAPI, studentsAPI, applicationsAPI } from '../data/api';
import { StudentService } from './studentService';

export class JobService {
  // Get all jobs
  static async getAllJobs() {
    try {
      return await jobsAPI.getAll();
    } catch (error) {
      throw new Error('Failed to fetch jobs: ' + error.message);
    }
  }

  // Get job by ID
  static async getJobById(id) {
    try {
      return await jobsAPI.getById(id);
    } catch (error) {
      throw new Error('Failed to fetch job: ' + error.message);
    }
  }

  // Get active jobs only
  static async getActiveJobs() {
    try {
      const allJobs = await jobsAPI.getAll();
      return allJobs.filter(job => 
        job.status === 'active' && 
        new Date(job.applicationDeadline) > new Date()
      );
    } catch (error) {
      throw new Error('Failed to fetch active jobs: ' + error.message);
    }
  }

  // Search and filter jobs
  static async searchJobs(filters = {}) {
    try {
      let jobs = await jobsAPI.getAll();

      // Filter by location
      if (filters.location) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Filter by job type
      if (filters.jobType) {
        jobs = jobs.filter(job => job.jobType === filters.jobType);
      }

      // Filter by company
      if (filters.company) {
        jobs = jobs.filter(job => 
          job.company.toLowerCase().includes(filters.company.toLowerCase())
        );
      }

      // Filter by experience level
      if (filters.experience) {
        jobs = jobs.filter(job => 
          job.experience.toLowerCase().includes(filters.experience.toLowerCase())
        );
      }

      // Filter by salary range (basic implementation)
      if (filters.minSalary) {
        jobs = jobs.filter(job => {
          const salaryMatch = job.salary.match(/\$(\d+,?\d*)/);
          if (salaryMatch) {
            const jobMinSalary = parseInt(salaryMatch[1].replace(',', ''));
            return jobMinSalary >= filters.minSalary;
          }
          return true;
        });
      }

      // Filter by skills
      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter(job => 
          job.skills && job.skills.some(skill => 
            filters.skills.some(filterSkill => 
              skill.toLowerCase().includes(filterSkill.toLowerCase())
            )
          )
        );
      }

      // Filter by department eligibility
      if (filters.department) {
        jobs = jobs.filter(job => 
          job.eligibilityCriteria && 
          job.eligibilityCriteria.departments &&
          job.eligibilityCriteria.departments.includes(filters.department)
        );
      }

      // Sort by posted date (newest first)
      jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

      return jobs;
    } catch (error) {
      throw new Error('Failed to search jobs: ' + error.message);
    }
  }

  // Get jobs suitable for a specific student
  static async getJobsForStudent(studentId) {
    try {
      const student = await studentsAPI.getById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const allJobs = await this.getActiveJobs();
      
      return allJobs.filter(job => {
        // Check basic eligibility
        if (!student.isEligible) return false;

        // Check if already applied
        if (student.appliedJobs && student.appliedJobs.includes(job.id)) return false;

        // Check job eligibility criteria
        if (job.eligibilityCriteria) {
          // Check CGPA
          if (job.eligibilityCriteria.minCGPA && student.cgpa < job.eligibilityCriteria.minCGPA) {
            return false;
          }

          // Check department
          if (job.eligibilityCriteria.departments && 
              !job.eligibilityCriteria.departments.includes(student.department)) {
            return false;
          }

          // Check year
          if (job.eligibilityCriteria.year && student.year < job.eligibilityCriteria.year) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      throw new Error('Failed to get jobs for student: ' + error.message);
    }
  }

  // Get job statistics
  static async getJobStatistics() {
    try {
      const jobs = await jobsAPI.getAll();
      const applications = await applicationsAPI.getAll();

      const stats = {
        total: jobs.length,
        active: jobs.filter(job => job.status === 'active').length,
        expired: jobs.filter(job => new Date(job.applicationDeadline) < new Date()).length,
        byType: {
          'Full-time': jobs.filter(job => job.jobType === 'Full-time').length,
          'Part-time': jobs.filter(job => job.jobType === 'Part-time').length,
          'Internship': jobs.filter(job => job.jobType === 'Internship').length,
          'Contract': jobs.filter(job => job.jobType === 'Contract').length
        },
        byLocation: this.groupJobsByLocation(jobs),
        totalApplications: applications.length,
        averageApplicationsPerJob: jobs.length > 0 ? Math.round(applications.length / jobs.length) : 0,
        mostPopularJobs: this.getMostPopularJobs(jobs, applications)
      };

      return stats;
    } catch (error) {
      throw new Error('Failed to get job statistics: ' + error.message);
    }
  }

  // Group jobs by location for analytics
  static groupJobsByLocation(jobs) {
    const locationGroups = {};
    
    jobs.forEach(job => {
      const location = job.location;
      if (!locationGroups[location]) {
        locationGroups[location] = 0;
      }
      locationGroups[location]++;
    });

    return locationGroups;
  }

  // Get most popular jobs based on applications
  static getMostPopularJobs(jobs, applications) {
    const jobApplicationCounts = {};
    
    applications.forEach(app => {
      if (!jobApplicationCounts[app.jobId]) {
        jobApplicationCounts[app.jobId] = 0;
      }
      jobApplicationCounts[app.jobId]++;
    });

    return jobs
      .map(job => ({
        ...job,
        applicationCount: jobApplicationCounts[job.id] || 0
      }))
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5);
  }

  // Check if application deadline is approaching
  static isDeadlineApproaching(job, daysThreshold = 3) {
    const deadline = new Date(job.applicationDeadline);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= daysThreshold && diffDays > 0;
  }

  // Get recommended jobs based on student profile
  static async getRecommendedJobs(studentId, limit = 5) {
    try {
      const student = await studentsAPI.getById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const suitableJobs = await this.getJobsForStudent(studentId);
      
      // Score jobs based on student profile
      const scoredJobs = suitableJobs.map(job => {
        let score = 0;
        
        // Score based on skill match
        if (job.skills && student.skills) {
          const matchingSkills = job.skills.filter(skill => 
            student.skills.some(studentSkill => 
              studentSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          score += matchingSkills.length * 10;
        }

        // Score based on department match
        if (job.eligibilityCriteria && 
            job.eligibilityCriteria.departments &&
            job.eligibilityCriteria.departments.includes(student.department)) {
          score += 20;
        }

        // Score based on CGPA (higher CGPA gets bonus for competitive jobs)
        if (job.eligibilityCriteria && job.eligibilityCriteria.minCGPA) {
          const cgpaBonus = Math.max(0, student.cgpa - job.eligibilityCriteria.minCGPA) * 5;
          score += cgpaBonus;
        }

        // Bonus for newer jobs
        const daysSincePosted = (new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24);
        if (daysSincePosted < 7) {
          score += 15;
        }

        return { ...job, recommendationScore: score };
      });

      // Sort by score and return top recommendations
      return scoredJobs
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      throw new Error('Failed to get recommended jobs: ' + error.message);
    }
  }

  // Get job details with additional information
  static async getJobDetails(jobId) {
    try {
      const job = await jobsAPI.getById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const applications = await applicationsAPI.getByJobId(jobId);
      const eligibleStudents = await StudentService.getEligibleStudentsForJob(job.eligibilityCriteria);

      return {
        job,
        applicationCount: applications.length,
        eligibleStudentCount: eligibleStudents.length,
        applications: applications.slice(0, 10), // Recent applications
        isDeadlineApproaching: this.isDeadlineApproaching(job),
        daysUntilDeadline: Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24))
      };
    } catch (error) {
      throw new Error('Failed to get job details: ' + error.message);
    }
  }
}
