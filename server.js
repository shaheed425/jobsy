const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock database (in a real application, you would use a proper database)
let students = [];
let employers = [];
let jobs = [];
let applications = [];
let notifications = [];

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Placement Management System API is running' });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // In a real application, you would validate against a database
    // For demo purposes, we'll use mock validation
    let user = null;

    if (userType === 'admin' && email === 'admin@placement.com' && password === 'admin123') {
      user = { id: 1, email, name: 'Admin', role: 'admin' };
    } else if (userType === 'student') {
      // Find student by email (mock)
      user = students.find(s => s.email === email);
    } else if (userType === 'employer') {
      // Find employer by email (mock)
      user = employers.find(e => e.email === email);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student routes
app.get('/api/students', authenticateToken, (req, res) => {
  res.json(students);
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

app.post('/api/students', authenticateToken, (req, res) => {
  const newStudent = {
    id: students.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', authenticateToken, (req, res) => {
  const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  students[studentIndex] = {
    ...students[studentIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(students[studentIndex]);
});

// Employer routes
app.get('/api/employers', authenticateToken, (req, res) => {
  res.json(employers);
});

app.get('/api/employers/:id', authenticateToken, (req, res) => {
  const employer = employers.find(e => e.id === parseInt(req.params.id));
  if (!employer) {
    return res.status(404).json({ message: 'Employer not found' });
  }
  res.json(employer);
});

app.post('/api/employers', authenticateToken, (req, res) => {
  const newEmployer = {
    id: employers.length + 1,
    ...req.body,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  employers.push(newEmployer);
  res.status(201).json(newEmployer);
});

app.put('/api/employers/:id', authenticateToken, (req, res) => {
  const employerIndex = employers.findIndex(e => e.id === parseInt(req.params.id));
  if (employerIndex === -1) {
    return res.status(404).json({ message: 'Employer not found' });
  }
  
  employers[employerIndex] = {
    ...employers[employerIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(employers[employerIndex]);
});

// Job routes
app.get('/api/jobs', authenticateToken, (req, res) => {
  res.json(jobs);
});

app.get('/api/jobs/:id', authenticateToken, (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  res.json(job);
});

app.post('/api/jobs', authenticateToken, (req, res) => {
  const newJob = {
    id: jobs.length + 1,
    ...req.body,
    postedDate: new Date().toISOString(),
    status: 'active',
    applicationsReceived: 0
  };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

app.put('/api/jobs/:id', authenticateToken, (req, res) => {
  const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (jobIndex === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  jobs[jobIndex] = {
    ...jobs[jobIndex],
    ...req.body
  };
  
  res.json(jobs[jobIndex]);
});

// Application routes
app.get('/api/applications', authenticateToken, (req, res) => {
  res.json(applications);
});

app.get('/api/applications/student/:studentId', authenticateToken, (req, res) => {
  const studentApplications = applications.filter(a => a.studentId === parseInt(req.params.studentId));
  res.json(studentApplications);
});

app.get('/api/applications/job/:jobId', authenticateToken, (req, res) => {
  const jobApplications = applications.filter(a => a.jobId === parseInt(req.params.jobId));
  res.json(jobApplications);
});

app.post('/api/applications', authenticateToken, (req, res) => {
  const newApplication = {
    id: applications.length + 1,
    ...req.body,
    applicationDate: new Date().toISOString(),
    status: 'under_review'
  };
  applications.push(newApplication);
  
  // Update job applications count
  const jobIndex = jobs.findIndex(j => j.id === newApplication.jobId);
  if (jobIndex !== -1) {
    jobs[jobIndex].applicationsReceived += 1;
  }
  
  res.status(201).json(newApplication);
});

app.put('/api/applications/:id', authenticateToken, (req, res) => {
  const applicationIndex = applications.findIndex(a => a.id === parseInt(req.params.id));
  if (applicationIndex === -1) {
    return res.status(404).json({ message: 'Application not found' });
  }
  
  applications[applicationIndex] = {
    ...applications[applicationIndex],
    ...req.body
  };
  
  res.json(applications[applicationIndex]);
});

// Notification routes
app.get('/api/notifications', authenticateToken, (req, res) => {
  res.json(notifications);
});

app.get('/api/notifications/user/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const { recipient } = req.query;
  
  const userNotifications = notifications.filter(n => 
    (n.recipient === recipient && n.recipientId === parseInt(userId)) ||
    n.recipient === `all_${recipient}s`
  );
  
  res.json(userNotifications);
});

app.post('/api/notifications', authenticateToken, (req, res) => {
  const newNotification = {
    id: notifications.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    isRead: false
  };
  notifications.push(newNotification);
  res.status(201).json(newNotification);
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notificationIndex = notifications.findIndex(n => n.id === parseInt(req.params.id));
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  notifications[notificationIndex].isRead = true;
  res.json(notifications[notificationIndex]);
});

// Statistics routes
app.get('/api/stats/dashboard', authenticateToken, (req, res) => {
  const stats = {
    totalStudents: students.length,
    totalEmployers: employers.length,
    totalJobs: jobs.length,
    totalApplications: applications.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    verifiedEmployers: employers.filter(e => e.isVerified).length,
    eligibleStudents: students.filter(s => s.isEligible).length
  };
  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Placement Management System API server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});
