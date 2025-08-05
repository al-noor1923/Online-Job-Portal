import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../services/api';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    skills: '',
    experience: '',
    education: '',
    resume: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Convert skills from comma-separated string to array
      const userData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      await createUser(userData);
      alert('User created successfully!');
      navigate('/users'); // Redirect to users list
    } catch (error) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add New User</h1>
        <button onClick={() => navigate('/users')} className="back-btn">
          Back to Users
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Phone *</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
            />
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
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
