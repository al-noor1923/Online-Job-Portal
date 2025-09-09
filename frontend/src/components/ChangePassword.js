import React, { useState } from 'react';
import { changePassword } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ChangePassword = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await changePassword(formData);
      
      setSuccess(response.message || 'Password changed successfully!');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }

    } catch (err) {
      const message = err?.message || 'Failed to change password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        <div className="modal-header">
          <h3>🔒 Change Password</h3>
          {onClose && (
            <button className="close-btn" onClick={onClose} type="button">
              ✕
            </button>
          )}
        </div>

        <div className="modal-content">
          <div className="user-info">
            <p>Changing password for: <strong>{user?.name}</strong></p>
            <p className="email-info">{user?.email}</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="change-password-form">
            {/* Current Password */}
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password *</label>
              <div className="password-input-group">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <div className="password-input-group">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <small className="password-hint">
                Password must be at least 6 characters long
              </small>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password *</label>
              <div className="password-input-group">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.newPassword && formData.confirmPassword && (
                <small className={
                  formData.newPassword === formData.confirmPassword 
                    ? 'password-match' 
                    : 'password-mismatch'
                }>
                  {formData.newPassword === formData.confirmPassword 
                    ? '✅ Passwords match' 
                    : '❌ Passwords do not match'}
                </small>
              )}
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              {onClose && (
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              >
                {loading ? '🔄 Changing...' : '🔒 Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
