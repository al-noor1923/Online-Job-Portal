import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';

const AddJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    type: 'full-time',
    remote: false,
    experience: 'entry',
    applicationDeadline: '',
    ageLimit: {
      min: 18,
      max: 65
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('ageLimit.')) {
      const field = name.split('.')[1];
      setFormData({ 
        ...formData, 
        ageLimit: {
          ...formData.ageLimit,
          [field]: parseInt(value) || 0
        }
      });
    } else {
      setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? checked : value 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Validate deadline
      const deadline = new Date(formData.applicationDeadline);
      if (deadline <= new Date()) {
        setError('Application deadline must be in the future');
        return;
      }
      
      // Validate age limits
      if (formData.ageLimit.min >= formData.ageLimit.max) {
        setError('Minimum age must be less than maximum age');
        return;
      }
      
      const jobData = {
        ...formData,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req)
      };
      
      await createJob(jobData);
      alert('Job posted successfully!');
      navigate('/jobs/my-jobs');
    } catch (error) {
      setError(error.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Post New Job</h1>
        <button onClick={() => navigate('/jobs')} className="back-btn">
          Back to Jobs
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Job Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Location *</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Salary Range</label>
            <input 
              type="text" 
              name="salary" 
              value={formData.salary} 
              onChange={handleChange} 
              placeholder="e.g., $50,000 - $70,000 per year" 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Job Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Experience Level</label>
              <select name="experience" value={formData.experience} onChange={handleChange}>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Manager</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Application Deadline *</label>
            <input 
              type="date" 
              name="applicationDeadline" 
              value={formData.applicationDeadline} 
              onChange={handleChange} 
              min={getMinDate()}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Age Requirements</label>
            <div className="age-limit-container">
              <div className="age-input-group">
                <label>Minimum Age</label>
                <input 
                  type="number" 
                  name="ageLimit.min" 
                  value={formData.ageLimit.min} 
                  onChange={handleChange} 
                  min="16"
                  max="100"
                />
              </div>
              <div className="age-input-group">
                <label>Maximum Age</label>
                <input 
                  type="number" 
                  name="ageLimit.max" 
                  value={formData.ageLimit.max} 
                  onChange={handleChange} 
                  min="16"
                  max="100"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input 
                type="checkbox" 
                name="remote" 
                checked={formData.remote} 
                onChange={handleChange} 
              />
              Remote Work Available
            </label>
          </div>
          
          <div className="form-group">
            <label>Job Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="5" 
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
            />
          </div>
          
          <div className="form-group">
            <label>Requirements (comma separated)</label>
            <textarea 
              name="requirements" 
              value={formData.requirements} 
              onChange={handleChange} 
              rows="3" 
              placeholder="React, JavaScript, 2+ years experience, Bachelor's degree..."
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Posting Job...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
