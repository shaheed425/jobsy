// Mock API simulation for frontend data operations
import studentsData from './students.json';
import employersData from './employers.json';
import jobsData from './jobs.json';
import applicationsData from './applications.json';
import notificationsData from './notifications.json';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const STORAGE_KEYS = {
  STUDENTS: 'placement_students',
  EMPLOYERS: 'placement_employers',
  JOBS: 'placement_jobs',
  APPLICATIONS: 'placement_applications',
  NOTIFICATIONS: 'placement_notifications',
  ADMIN_USER: 'placement_admin'
};

// Initialize local storage with mock data if not exists
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(studentsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYERS)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(employersData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applicationsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USER)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    }));
  }
};

// Generic CRUD operations
const getData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Students API
export const studentsAPI = {
  getAll: async () => {
    await delay();
    return getData(STORAGE_KEYS.STUDENTS);
  },
  
  getById: async (id) => {
    await delay();
    const students = getData(STORAGE_KEYS.STUDENTS);
    return students.find(student => student.id === parseInt(id));
  },
  
  create: async (studentData) => {
    await delay();
    const students = getData(STORAGE_KEYS.STUDENTS);
    const newStudent = {
      ...studentData,
      id: Math.max(...students.map(s => s.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    students.push(newStudent);
    setData(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  },
  
  update: async (id, studentData) => {
    await delay();
    const students = getData(STORAGE_KEYS.STUDENTS);
    const index = students.findIndex(student => student.id === parseInt(id));
    if (index !== -1) {
      students[index] = {
        ...students[index],
        ...studentData,
        updatedAt: new Date().toISOString()
      };
      setData(STORAGE_KEYS.STUDENTS, students);
      return students[index];
    }
    throw new Error('Student not found');
  },
  
  delete: async (id) => {
    await delay();
    const students = getData(STORAGE_KEYS.STUDENTS);
    const filteredStudents = students.filter(student => student.id !== parseInt(id));
    setData(STORAGE_KEYS.STUDENTS, filteredStudents);
    return true;
  }
};

// Employers API
export const employersAPI = {
  getAll: async () => {
    await delay();
    return getData(STORAGE_KEYS.EMPLOYERS);
  },
  
  getById: async (id) => {
    await delay();
    const employers = getData(STORAGE_KEYS.EMPLOYERS);
    return employers.find(employer => employer.id === parseInt(id));
  },
  
  create: async (employerData) => {
    await delay();
    const employers = getData(STORAGE_KEYS.EMPLOYERS);
    const newEmployer = {
      ...employerData,
      id: Math.max(...employers.map(e => e.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    employers.push(newEmployer);
    setData(STORAGE_KEYS.EMPLOYERS, employers);
    return newEmployer;
  },
  
  update: async (id, employerData) => {
    await delay();
    const employers = getData(STORAGE_KEYS.EMPLOYERS);
    const index = employers.findIndex(employer => employer.id === parseInt(id));
    if (index !== -1) {
      employers[index] = {
        ...employers[index],
        ...employerData,
        updatedAt: new Date().toISOString()
      };
      setData(STORAGE_KEYS.EMPLOYERS, employers);
      return employers[index];
    }
    throw new Error('Employer not found');
  }
};

// Jobs API
export const jobsAPI = {
  getAll: async () => {
    await delay();
    return getData(STORAGE_KEYS.JOBS);
  },
  
  getById: async (id) => {
    await delay();
    const jobs = getData(STORAGE_KEYS.JOBS);
    return jobs.find(job => job.id === parseInt(id));
  },
  
  create: async (jobData) => {
    await delay();
    const jobs = getData(STORAGE_KEYS.JOBS);
    const newJob = {
      ...jobData,
      id: Math.max(...jobs.map(j => j.id), 0) + 1,
      postedDate: new Date().toISOString(),
      status: 'active',
      applicationsReceived: 0
    };
    jobs.push(newJob);
    setData(STORAGE_KEYS.JOBS, jobs);
    return newJob;
  },
  
  update: async (id, jobData) => {
    await delay();
    const jobs = getData(STORAGE_KEYS.JOBS);
    const index = jobs.findIndex(job => job.id === parseInt(id));
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...jobData };
      setData(STORAGE_KEYS.JOBS, jobs);
      return jobs[index];
    }
    throw new Error('Job not found');
  },
  
  getByFilters: async (filters) => {
    await delay();
    let jobs = getData(STORAGE_KEYS.JOBS);
    
    if (filters.location) {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.jobType) {
      jobs = jobs.filter(job => job.jobType === filters.jobType);
    }
    
    if (filters.company) {
      jobs = jobs.filter(job => 
        job.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    
    return jobs;
  }
};

// Applications API
export const applicationsAPI = {
  getAll: async () => {
    await delay();
    return getData(STORAGE_KEYS.APPLICATIONS);
  },
  
  getByStudentId: async (studentId) => {
    await delay();
    const applications = getData(STORAGE_KEYS.APPLICATIONS);
    return applications.filter(app => app.studentId === parseInt(studentId));
  },
  
  getByJobId: async (jobId) => {
    await delay();
    const applications = getData(STORAGE_KEYS.APPLICATIONS);
    return applications.filter(app => app.jobId === parseInt(jobId));
  },
  
  create: async (applicationData) => {
    await delay();
    const applications = getData(STORAGE_KEYS.APPLICATIONS);
    const newApplication = {
      ...applicationData,
      id: Math.max(...applications.map(a => a.id), 0) + 1,
      applicationDate: new Date().toISOString(),
      status: 'under_review'
    };
    applications.push(newApplication);
    setData(STORAGE_KEYS.APPLICATIONS, applications);
    
    // Update job applications count
    const jobs = getData(STORAGE_KEYS.JOBS);
    const jobIndex = jobs.findIndex(job => job.id === applicationData.jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].applicationsReceived += 1;
      setData(STORAGE_KEYS.JOBS, jobs);
    }
    
    return newApplication;
  },
  
  updateStatus: async (id, status, feedback = null) => {
    await delay();
    const applications = getData(STORAGE_KEYS.APPLICATIONS);
    const index = applications.findIndex(app => app.id === parseInt(id));
    if (index !== -1) {
      applications[index].status = status;
      if (feedback) applications[index].feedback = feedback;
      setData(STORAGE_KEYS.APPLICATIONS, applications);
      return applications[index];
    }
    throw new Error('Application not found');
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    await delay();
    return getData(STORAGE_KEYS.NOTIFICATIONS);
  },
  
  getByRecipient: async (recipient, recipientId = null) => {
    await delay();
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS);
    return notifications.filter(notif => 
      notif.recipient === recipient && 
      (recipientId ? notif.recipientId === parseInt(recipientId) : true)
    );
  },
  
  create: async (notificationData) => {
    await delay();
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS);
    const newNotification = {
      ...notificationData,
      id: Math.max(...notifications.map(n => n.id), 0) + 1,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    notifications.push(newNotification);
    setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },
  
  markAsRead: async (id) => {
    await delay();
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS);
    const index = notifications.findIndex(notif => notif.id === parseInt(id));
    if (index !== -1) {
      notifications[index].isRead = true;
      setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return notifications[index];
    }
    throw new Error('Notification not found');
  }
};

// Admin API
export const adminAPI = {
  login: async (username, password) => {
    await delay();
    const admin = getData(STORAGE_KEYS.ADMIN_USER);
    if (admin.username === username && admin.password === password) {
      return { success: true, user: { username: admin.username, role: admin.role } };
    }
    return { success: false, message: 'Invalid credentials' };
  }
};

// Initialize data on module load
initializeData();
