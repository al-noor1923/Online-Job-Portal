import React, { useState } from 'react';

const JobForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    company: initialData.company || '',
    location: initialData.location || '',
    salary: initialData.salary || '',
    description: initialData.description || '',
    requirements: initialData.requirements ? initialData.requirements.join(', ') : '',
    type: initialData.type || 'full-time',
    remote: initialData.remote || false,
    experience: initialData.experience || 'entry'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req)
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Job Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label>Company *</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={errors.company ? 'error' : ''}
        />
        {errors.company && <span className="error-text">{errors.company}</span>}
      </div>

      <div className="form-group">
        <label>Location *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={errors.location ? 'error' : ''}
        />
        {errors.location && <span className="error-text">{errors.location}</span>}
      </div>

      <div className="form-group">
        <label>Salary</label>
        <input
          type="text"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="$50,000 - $70,000"
        />
      </div>

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
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Requirements (comma separated)</label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows="3"
          placeholder="React, JavaScript, 2+ years experience"
        />
      </div>

      <button type="submit" className="submit-btn">
        {isEditing ? 'Update Job' : 'Create Job'}
      </button>
    </form>
  );
};

export default JobForm;
