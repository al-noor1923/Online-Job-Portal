import React, { useState, useEffect } from 'react';
import { getReceivedApplications, updateApplicationStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RecruiterApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getReceivedApplications();
      setApplications(response.data || []);
    } catch (error) {
      setError('Failed to fetch applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      alert('Application status updated successfully!');
    } catch (error) {
      alert('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
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

  if (user?.role !== 'recruiter') {
    return <div className="error">Access denied. Recruiters only.</div>;
  }

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Received Applications ({applications.length})</h1>
      </div>
      
      {applications.length === 0 ? (
        <div className="empty-state">
          <p>No applications received yet.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application._id} className="application-card recruiter-view">
              <div className="application-header">
                <div className="candidate-info">
                  <h3>{application.jobSeeker.name}</h3>
                  <p className="email">{application.jobSeeker.email}</p>
                  <p className="phone">{application.jobSeeker.phone}</p>
                </div>
                <div className="job-info">
                  <h4>{application.job.title}</h4>
                  <p>{application.job.company}</p>
                </div>
              </div>
              
              <div className="application-details">
                <div className="candidate-details">
                  {application.jobSeeker.skills && application.jobSeeker.skills.length > 0 && (
                    <div className="skills">
                      <strong>Skills:</strong>
                      <div className="skill-tags">
                        {application.jobSeeker.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {application.jobSeeker.experience && (
                    <div className="experience">
                      <strong>Experience:</strong>
                      <p>{application.jobSeeker.experience}</p>
                    </div>
                  )}
                  
                  {application.jobSeeker.education && (
                    <div className="education">
                      <strong>Education:</strong>
                      <p>{application.jobSeeker.education}</p>
                    </div>
                  )}
                  
                  {application.jobSeeker.resume && (
                    <div className="resume">
                      <strong>Resume:</strong>
                      <a href={application.jobSeeker.resume} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </div>
                  )}
                </div>
                
                {application.coverLetter && (
                  <div className="cover-letter">
                    <strong>Cover Letter:</strong>
                    <p>{application.coverLetter}</p>
                  </div>
                )}
                
                <div className="application-actions">
                  <div className="current-status">
                    <strong>Status:</strong>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="status-actions">
                    <strong>Update Status:</strong>
                    <div className="status-buttons">
                      {['reviewed', 'shortlisted', 'rejected', 'accepted'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(application._id, status)}
                          disabled={updatingStatus === application._id || application.status === status}
                          className={`status-btn ${status}`}
                        >
                          {updatingStatus === application._id ? 'Updating...' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="application-meta">
                  <p><strong>Applied on:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
