import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { updateUser, getAllUsers } from '../services/api';

const UpdateUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
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

  useEffect(() => {
    // Get user data from location state (passed from Users page)
    if (location.state?.user) {
      const user = location.state.user;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        skills: user.skills ? user.skills.join(', ') : '',
        experience: user.experience || '',
        education: user.education || '',
        resume: user.resume || ''
      });
    } else {
      // If no user data in state, fetch from API
      fetchUserData();
    }
  }, [id, location.state]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const users = response.data || response;
      const user = users.find(u => u._id === id);
      
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          skills: user.skills ? user.skills.join(', ') : '',
          experience: user.experience || '',
          education: user.education || '',
          resume: user.resume || ''
        });
      } else {
        setError('User not found');
      }
    } catch (error) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
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
      
      await updateUser(id, userData);
      alert('User updated successfully!');
      navigate('/users'); // Redirect to users list
    } catch (error) {
      setError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Update User Profile</h1>
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
          
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating User...' : 'Update User'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/users')} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
