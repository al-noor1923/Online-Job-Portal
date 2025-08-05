import React, { useState } from 'react';
import { applyForJob } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobApplication = ({ job, onClose, onApplicationSubmit }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await applyForJob(job._id, coverLetter);
      alert('Application submitted successfully!');
      onApplicationSubmit();
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'job_seeker') {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Apply for {job.title}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="job-summary">
            <h3>{job.title}</h3>
            <p>{job.company} - {job.location}</p>
            {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label>Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="8"
                placeholder="Tell the recruiter why you're interested in this position and what makes you a good fit..."
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplication;
