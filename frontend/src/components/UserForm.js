import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    skills: initialData.skills ? initialData.skills.join(', ') : '',
    experience: initialData.experience || '',
    education: initialData.education || '',
    resume: initialData.resume || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label>Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? 'error' : ''}
        />
        {errors.phone && <span className="error-text">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Skills (comma separated)</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="JavaScript, React, Node.js"
        />
      </div>

      <div className="form-group">
        <label>Experience</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Education</label>
        <textarea
          name="education"
          value={formData.education}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Resume URL</label>
        <input
          type="url"
          name="resume"
          value={formData.resume}
          onChange={handleChange}
          placeholder="https://example.com/resume.pdf"
        />
      </div>

      <button type="submit" className="submit-btn">
        {isEditing ? 'Update User' : 'Create User'}
      </button>
    </form>
  );
};

export default UserForm;
