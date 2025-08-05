import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'job_seeker',
    dateOfBirth: '', // Add date of birth field
    // Recruiter fields
    company: '',
    companyDescription: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (formData.role === 'recruiter' && !formData.company) {
    setError('Company name is required for recruiters');
    return;
  }

  if (formData.role === 'job_seeker' && !formData.dateOfBirth) {
    setError('Date of birth is required for job seekers');
    return;
  }

  // Validate age for job seekers (must be at least 16 years old)
  if (formData.role === 'job_seeker' && formData.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 16) {
      setError('You must be at least 16 years old to register as a job seeker');
      return;
    }
    
    if (age > 100) {
      setError('Please enter a valid date of birth');
      return;
    }
  }

  try {
    setLoading(true);
    setError('');
    
    const { confirmPassword, ...userData } = formData;
    
    // Debug: Log the data being sent
    console.log('🔍 Form data before sending:', formData);
    console.log('🔍 User data being sent to API:', userData);
    console.log('🔍 Date of birth value:', userData.dateOfBirth);
    
    const response = await registerAPI(userData);
    
    login(response.data.user, response.data.token);
    navigate('/');
  } catch (error) {
    console.error('❌ Registration error:', error);
    setError(error.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};


  // Get maximum date (today - 16 years) for date of birth
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  // Get minimum date (today - 100 years) for date of birth
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register for Job Portal</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
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
            <label>I am a *</label>
            <div className="role-selection">
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="job_seeker"
                  checked={formData.role === 'job_seeker'}
                  onChange={handleChange}
                />
                <span>Job Seeker</span>
                <small>Looking for job opportunities</small>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={formData.role === 'recruiter'}
                  onChange={handleChange}
                />
                <span>Recruiter</span>
                <small>Hiring candidates for my company</small>
              </label>
            </div>
          </div>

          {/* Date of Birth field - Only for job seekers */}
          {formData.role === 'job_seeker' && (
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
              />
              <small className="field-help">
                Required for age verification when applying for jobs (minimum age: 16 years)
              </small>
            </div>
          )}

          {/* Recruiter-specific fields */}
          {formData.role === 'recruiter' && (
            <>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description of your company..."
                />
              </div>
              
              <div className="form-group">
                <label>Company Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
