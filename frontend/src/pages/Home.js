import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  // Debug: Log user info
  console.log('🔍 Debug - User object:', user);
  console.log('🔍 Debug - User role:', user?.role);
  console.log('🔍 Debug - Is recruiter?', user?.role === 'recruiter');

  return (
    <div className="home-page">
      <div style={{ 
        background: '#f0f8ff', 
        padding: '1rem', 
        margin: '1rem 0', 
        borderRadius: '5px',
        border: '1px solid #ccc'
      }}>
      </div>

      <header className="hero-section">
        <h1>Job Portal Management</h1>
        <p>
          {user?.role === 'job_seeker' 
            ? 'Find your dream job and advance your career' 
            : user?.role === 'recruiter'
            ? 'Connect with top talent and grow your team'
            : 'Welcome to Job Portal'
          }
        </p>
      </header>
      
      <div className="features-grid">
        {/* Common feature for all users */}
        <div className="feature-card">
          <h3>Browse Jobs</h3>
          <p>Explore available job opportunities from companies</p>
          <Link to="/jobs" className="feature-link">View All Jobs</Link>
        </div>
        
        {/* Job Seeker Only Features */}
        {user?.role === 'job_seeker' && (
          <div className="feature-card">
            <h3>My Applications</h3>
            <p>Track your job applications and their status</p>
            <Link to="/applications" className="feature-link">View Applications</Link>
          </div>
        )}
        
        {/* Recruiter Only Features */}
        {user?.role === 'recruiter' && (
          <>
            <div className="feature-card">
              <h3>Post New Job</h3>
              <p>Create job postings to attract qualified candidates</p>
              <Link to="/jobs/add" className="feature-link">Post Job</Link>
            </div>
            
            <div className="feature-card">
              <h3>My Posted Jobs</h3>
              <p>Manage your job postings and view applications</p>
              <Link to="/jobs/my-jobs" className="feature-link">Manage Jobs</Link>
            </div>
            
            <div className="feature-card">
              <h3>Application Management</h3>
              <p>Review and manage applications from job seekers</p>
              <Link to="/recruiter/applications" className="feature-link">View Applications</Link>
            </div>
          </>
        )}

        {/* Fallback if role is not recognized */}
        {!user?.role && (
          <div className="feature-card">
            <h3>⚠️ Role Not Found</h3>
            <p>Please logout and login again</p>
          </div>
        )}
      </div>

      {/* Quick Actions Section for Recruiters */}
      {user?.role === 'recruiter' && (
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/jobs/add" className="action-btn">
              ➕ Post New Job
            </Link>
            <Link to="/jobs/my-jobs" className="action-btn">
              📋 View My Jobs
            </Link>
            <Link to="/jobs" className="action-btn">
              🔍 Browse All Jobs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
