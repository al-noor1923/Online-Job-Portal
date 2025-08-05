import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobApplications = () => {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ job: null, applications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (user?.role === 'recruiter' && jobId) {
      fetchApplications();
    }
  }, [user, jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getJobApplications(jobId);
      setData(response.data);
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
      setData(prevData => ({
        ...prevData,
        applications: prevData.applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      }));
      
      alert('Application status updated successfully!');
    } catch (error) {
      alert('Failed to update application status: ' + (error.message || 'Unknown error'));
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'recruiter') {
    return <div className="error">Access denied. Recruiters only.</div>;
  }

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  const { job, applications } = data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Applications for: {job?.title}</h1>
          <p className="job-info">
            {job?.company} • {job?.location} • {applications.length} Applications
          </p>
        </div>
        <button onClick={() => navigate('/jobs/my-jobs')} className="back-btn">
          Back to My Jobs
        </button>
      </div>
      
      {job && (
        <div className="job-summary-card">
          <div className="job-summary-content">
            <h3>{job.title}</h3>
            <div className="job-summary-details">
              <p><strong>Type:</strong> {job.type}</p>
              <p><strong>Location:</strong> {job.location}</p>
              {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
              <p><strong>Application Deadline:</strong> {formatDate(job.applicationDeadline)}</p>
              <p><strong>Age Requirement:</strong> {job.ageLimit?.min || 18} - {job.ageLimit?.max || 65} years</p>
            </div>
          </div>
        </div>
      )}
      
      {applications.length === 0 ? (
        <div className="empty-state">
          <p>No applications received for this job yet.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application._id} className="application-detail-card">
              <div className="applicant-header">
                <div className="applicant-info">
                  <h3>{application.jobSeeker.name}</h3>
                  <div className="contact-info">
                    <p><strong>Email:</strong> {application.jobSeeker.email}</p>
                    <p><strong>Phone:</strong> {application.jobSeeker.phone}</p>
                    {application.jobSeeker.age && (
                      <p>
                        <strong>Age:</strong> {application.jobSeeker.age} years
                        {application.ageEligible !== undefined && (
                          <span className={`age-eligibility ${application.ageEligible ? 'eligible' : 'not-eligible'}`}>
                            ({application.ageEligible ? 'Eligible' : 'Not Eligible'})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
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
              
              <div className="applicant-details">
                {application.jobSeeker.address && (
                  <p><strong>Address:</strong> {application.jobSeeker.address}</p>
                )}
                
                {application.jobSeeker.skills && application.jobSeeker.skills.length > 0 && (
                  <div className="skills-section">
                    <strong>Skills:</strong>
                    <div className="skill-tags">
                      {application.jobSeeker.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {application.jobSeeker.experience && (
                  <div className="experience-section">
                    <strong>Experience:</strong>
                    <p>{application.jobSeeker.experience}</p>
                  </div>
                )}
                
                {application.jobSeeker.education && (
                  <div className="education-section">
                    <strong>Education:</strong>
                    <p>{application.jobSeeker.education}</p>
                  </div>
                )}
                
                {application.jobSeeker.resume && (
                  <div className="resume-section">
                    <strong>Resume:</strong>
                    <a 
                      href={application.jobSeeker.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      View Resume
                    </a>
                  </div>
                )}
                
                {application.coverLetter && (
                  <div className="cover-letter-section">
                    <strong>Cover Letter:</strong>
                    <div className="cover-letter-content">
                      {application.coverLetter}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="application-actions">
                <div className="status-management">
                  <strong>Update Status:</strong>
                  <div className="status-buttons">
                    {['reviewed', 'shortlisted', 'rejected', 'accepted'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(application._id, status)}
                        disabled={updatingStatus === application._id || application.status === status}
                        className={`status-btn ${status} ${application.status === status ? 'current' : ''}`}
                      >
                        {updatingStatus === application._id ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="application-footer">
                <p><small>Applied on: {formatDate(application.appliedAt)}</small></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
