import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Home from './pages/Home';
import Jobs from './pages/Jobs';
import MyJobs from './pages/MyJobs';
import AddJob from './pages/AddJob';
import UpdateJob from './pages/UpdateJob';
import JobApplications from './pages/JobApplications';
import Applications from './pages/Applications';
import Login from './components/Login';
import Register from './components/Register';

import CVBuilder from './pages/CVBuilder';         // NEW: CV builder page
import UpdateProfile from './pages/UpdateProfile'; // NEW: Update profile page

import './App.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  // Debug: Log user info in navbar
  console.log('🔍 Navbar Debug - User:', user);
  console.log('🔍 Navbar Debug - Is authenticated:', isAuthenticated);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Job Portal</Link>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/jobs">Browse Jobs</Link>

            {/* Job Seeker Only Links */}
            {user?.role === 'job_seeker' && (
              <>
                <Link to="/applications">My Applications</Link>
                <Link to="/profile">Update Profile</Link>   {/* NEW */}
                <Link to="/cv-builder">Create CV</Link>      {/* NEW */}
              </>
            )}

            {/* Recruiter Only Links */}
            {user?.role === 'recruiter' && (
              <>
                <Link to="/jobs/my-jobs">My Jobs</Link>
                <Link to="/jobs/add">Post Job</Link>
              </>
            )}

            {/* Debug info in navbar */}
            <span style={{ fontSize: '0.8rem', color: '#999' }}>
              [Debug: {user?.role || 'no-role'}]
            </span>

            <span className="user-info">
              Welcome, {user?.name} (
              {user?.role === 'job_seeker'
                ? 'Job Seeker'
                : user?.role === 'recruiter'
                ? 'Recruiter'
                : 'Unknown Role'}
              )
            </span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {isAuthenticated ? (
            <>
              {/* Common authenticated routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />

              {/* Job Seeker Only Routes */}
              {user?.role === 'job_seeker' && (
                <>
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/profile" element={<UpdateProfile />} />  {/* NEW */}
                  <Route path="/cv-builder" element={<CVBuilder />} />   {/* NEW */}
                </>
              )}

              {/* Recruiter Only Routes */}
              {user?.role === 'recruiter' && (
                <>
                  <Route path="/jobs/my-jobs" element={<MyJobs />} />
                  <Route path="/jobs/add" element={<AddJob />} />
                  <Route path="/jobs/update/:id" element={<UpdateJob />} />
                  <Route path="/jobs/:jobId/applications" element={<JobApplications />} />
                </>
              )}

              {/* Fallback for authenticated users */}
              <Route path="*" element={<Home />} />
            </>
          ) : (
            // If not authenticated, send all unknown paths to Login
            <Route path="*" element={<Login />} />
          )}
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
