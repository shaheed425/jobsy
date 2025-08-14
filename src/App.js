import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './presentation/components/Navbar';
import Dashboard from './presentation/pages/Dashboard';
import StudentManagement from './presentation/pages/StudentManagement';
import EmployerManagement from './presentation/pages/EmployerManagement';
import JobOpenings from './presentation/pages/JobOpenings';
import Applications from './presentation/pages/Applications';
import Notifications from './presentation/pages/Notifications';
import AdminLogin from './presentation/pages/AdminLogin';
import StudentProfile from './presentation/pages/StudentProfile';
import EmployerProfile from './presentation/pages/EmployerProfile';
import JobDetails from './presentation/pages/JobDetails';

// Context for global state management
export const AppContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin', 'student', 'employer'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('placement_user');
    const savedUserType = localStorage.getItem('placement_user_type');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('placement_user', JSON.stringify(userData));
    localStorage.setItem('placement_user_type', type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('placement_user');
    localStorage.removeItem('placement_user_type');
  };

  const contextValue = {
    user,
    userType,
    notifications,
    setNotifications,
    login,
    logout
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="App">
          {user && <Navbar />}
          <main className={user ? 'main-content' : ''}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={!user ? <AdminLogin /> : <Navigate to="/dashboard" />} 
              />
              
              {/* Protected Routes */}
              {user ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<StudentManagement />} />
                  <Route path="/employers" element={<EmployerManagement />} />
                  <Route path="/jobs" element={<JobOpenings />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/student/:id" element={<StudentProfile />} />
                  <Route path="/employer/:id" element={<EmployerProfile />} />
                  <Route path="/job/:id" element={<JobDetails />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
            </Routes>
          </main>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
