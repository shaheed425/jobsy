import { studentsAPI, applicationsAPI, notificationsAPI } from '../data/api';

export class StudentService {
  // Get all students
  static async getAllStudents() {
    try {
      return await studentsAPI.getAll();
    } catch (error) {
      throw new Error('Failed to fetch students: ' + error.message);
    }
  }

  // Get student by ID
  static async getStudentById(id) {
    try {
      return await studentsAPI.getById(id);
    } catch (error) {
      throw new Error('Failed to fetch student: ' + error.message);
    }
  }

  // Register new student
  static async registerStudent(studentData) {
    try {
      // Validate required fields
      this.validateStudentData(studentData);
      
      // Check eligibility
      const isEligible = this.checkEligibility(studentData);
      
      const newStudent = await studentsAPI.create({
        ...studentData,
        isEligible,
        appliedJobs: []
      });

      // Create welcome notification
      await notificationsAPI.create({
        type: 'profile_created',
        title: 'Welcome to Placement Portal',
        message: 'Your student profile has been created successfully. Complete your profile to apply for jobs.',
        recipient: 'student',
        recipientId: newStudent.id,
        priority: 'medium'
      });

      return newStudent;
    } catch (error) {
      throw new Error('Failed to register student: ' + error.message);
    }
  }

  // Update student profile
  static async updateStudentProfile(id, updateData) {
    try {
      // Check eligibility after update
      const updatedData = {
        ...updateData,
        isEligible: this.checkEligibility(updateData)
      };

      return await studentsAPI.update(id, updatedData);
    } catch (error) {
      throw new Error('Failed to update student profile: ' + error.message);
    }
  }

  // Get student applications
  static async getStudentApplications(studentId) {
    try {
      return await applicationsAPI.getByStudentId(studentId);
    } catch (error) {
      throw new Error('Failed to fetch student applications: ' + error.message);
    }
  }

  // Check if student is eligible for placements
  static checkEligibility(studentData) {
    const minCGPA = 7.0;
    const requiredYear = 4;
    
    return studentData.cgpa >= minCGPA && studentData.year >= requiredYear;
  }

  // Validate student data
  static validateStudentData(studentData) {
    const requiredFields = ['name', 'email', 'phone', 'department', 'year', 'cgpa'];
    
    for (const field of requiredFields) {
      if (!studentData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate CGPA range
    if (studentData.cgpa < 0 || studentData.cgpa > 10) {
      throw new Error('CGPA must be between 0 and 10');
    }

    // Validate year
    if (studentData.year < 1 || studentData.year > 4) {
      throw new Error('Year must be between 1 and 4');
    }
  }

  // Get eligible students for a job
  static async getEligibleStudentsForJob(jobCriteria) {
    try {
      const allStudents = await studentsAPI.getAll();
      
      return allStudents.filter(student => {
        // Check basic eligibility
        if (!student.isEligible) return false;
        
        // Check CGPA requirement
        if (student.cgpa < jobCriteria.minCGPA) return false;
        
        // Check department requirement
        if (!jobCriteria.departments.includes(student.department)) return false;
        
        // Check year requirement
        if (student.year < jobCriteria.year) return false;
        
        return true;
      });
    } catch (error) {
      throw new Error('Failed to get eligible students: ' + error.message);
    }
  }

  // Generate student report
  static async generateStudentReport(studentId) {
    try {
      const student = await studentsAPI.getById(studentId);
      const applications = await applicationsAPI.getByStudentId(studentId);
      
      const report = {
        student,
        totalApplications: applications.length,
        applicationsByStatus: {
          under_review: applications.filter(app => app.status === 'under_review').length,
          shortlisted: applications.filter(app => app.status === 'shortlisted').length,
          accepted: applications.filter(app => app.status === 'accepted').length,
          rejected: applications.filter(app => app.status === 'rejected').length
        },
        recentApplications: applications.slice(-5),
        eligibilityStatus: student.isEligible ? 'Eligible' : 'Not Eligible'
      };

      return report;
    } catch (error) {
      throw new Error('Failed to generate student report: ' + error.message);
    }
  }
}
