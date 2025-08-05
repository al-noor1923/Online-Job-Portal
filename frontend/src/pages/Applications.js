import React, { useState, useEffect } from 'react';
import { getMyApplications } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'job_seeker') {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      setApplications(response.data || []);
    } catch (error) {
      setError('Failed to fetch applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      reviewed: '#17a2b8',
      shortlisted: '#28a745',
      rejected: '#dc3545',
      accepted: '#007bff'
    };
    return colors[status] || '#6c757d';
  };

  if (user?.role !== 'job_seeker') {
    return <div className="error">Access denied. Job seekers only.</div>;
  }

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Applications ({applications.length})</h1>
      </div>
      
      {applications.length === 0 ? (
        <div className="empty-state">
          <p>You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application._id} className="application-card">
              <div className="application-header">
                <div>
                  <h3>{application.job.title}</h3>
                  <p className="company-name">{application.job.company}</p>
                  <p className="location">{application.job.location}</p>
                </div>
                <div className="application-status">
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(application.status) }}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="application-details">
                <p><strong>Applied on:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
                <p><strong>Job Type:</strong> {application.job.type}</p>
                {application.job.salary && (
                  <p><strong>Salary:</strong> {application.job.salary}</p>
                )}
                {application.coverLetter && (
                  <div className="cover-letter">
                    <strong>Cover Letter:</strong>
                    <p>{application.coverLetter}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
