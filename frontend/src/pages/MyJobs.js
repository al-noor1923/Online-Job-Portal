import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyJobs, deleteJob } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'recruiter') {
      fetchMyJobs();
    }
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await getMyJobs();
      setJobs(response.data || []);
    } catch (error) {
      setError('Failed to fetch your jobs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This will also delete all applications.')) {
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
        alert('Job deleted successfully!');
      } catch (error) {
        alert('Failed to delete job: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleViewApplications = (jobId) => {
    navigate(`/jobs/${jobId}/applications`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (user?.role !== 'recruiter') {
    return <div className="error">Access denied. Recruiters only.</div>;
  }

  if (loading) return <div className="loading">Loading your jobs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Posted Jobs ({jobs.length})</h1>
        <Link to="/jobs/add" className="add-btn">Post New Job</Link>
      </div>
      
      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>You haven't posted any jobs yet.</p>
          <Link to="/jobs/add" className="add-btn">Post Your First Job</Link>
        </div>
      ) : (
        <div className="cards-grid">
          {jobs.map(job => (
            <div key={job._id} className={`card job-management-card ${isExpired(job.applicationDeadline) ? 'expired' : ''}`}>
              <div className="job-status-indicator">
                {isExpired(job.applicationDeadline) ? (
                  <span className="status-badge expired">Expired</span>
                ) : (
                  <span className="status-badge active">Active</span>
                )}
              </div>
              
              <div className="job-header">
                <h3>{job.title}</h3>
                <p className="company-name">{job.company}</p>
                <p className="location">{job.location}</p>
              </div>
              
              <div className="job-details">
                <p><strong>Type:</strong> {job.type}</p>
                <p><strong>Experience:</strong> {job.experience}</p>
                {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
                
                <div className="deadline-info">
                  <p><strong>Application Deadline:</strong></p>
                  <p className={isExpired(job.applicationDeadline) ? 'expired-date' : 'active-date'}>
                    {formatDate(job.applicationDeadline)}
                  </p>
                </div>
                
                <div className="applications-info">
                  <p><strong>Applications:</strong> {job.applicationsCount || 0}</p>
                </div>
                
                {job.remote && <span className="remote-badge">Remote Available</span>}
              </div>
              
              <div className="job-actions">
                <button 
                  onClick={() => handleViewApplications(job._id)}
                  className="view-applications-btn"
                  disabled={job.applicationsCount === 0}
                >
                  View Applications ({job.applicationsCount || 0})
                </button>
                
                <div className="management-actions">
                  <Link 
                    to={`/jobs/update/${job._id}`} 
                    state={{ job }} 
                    className="edit-btn"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(job._id)} 
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="job-timestamps">
                <p><small>Posted: {formatDate(job.createdAt)}</small></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
