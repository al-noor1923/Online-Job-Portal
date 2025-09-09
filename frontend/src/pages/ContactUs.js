import React, { useState } from 'react';
import { submitContactForm } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ContactUs = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await submitContactForm(formData);
      
      setSuccess(response.message);
      
      // Clear form after successful submission
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        subject: '',
        message: ''
      });

    } catch (err) {
      const message = err?.message || 'Failed to send message. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📞 Contact Us</h1>
        <p>We'd love to hear from you! Get in touch with us for any questions, feedback, or support.</p>
      </div>

      <div className="contact-container">
        {/* Contact Information Section */}
        <div className="contact-info">
          <div className="card">
            <div className="card-header">
              <h3>📍 Get In Touch</h3>
            </div>
            <div className="card-content">
              <div className="contact-method">
                <div className="contact-icon">📞</div>
                <div className="contact-details">
                  <h4>Phone</h4>
                  <p><a href="tel:+8801234567890">+880 123-456-7890</a></p>
                  <small>Monday - Friday: 9 AM - 6 PM</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h4>Email</h4>
                  <p><a href="mailto:support@jobportal.com">support@jobportal.com</a></p>
                  <small>We respond within 24 hours</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🏢</div>
                <div className="contact-details">
                  <h4>Address</h4>
                  <p>123 Business Street<br />Dhaka 1000, Bangladesh</p>
                  <small>Visit us during business hours</small>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="social-section">
                <h4>🌐 Follow Us</h4>
                <div className="social-links">
                  <a 
                    href="https://facebook.com/jobportal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link facebook"
                  >
                    <span className="social-icon">📘</span>
                    Facebook
                  </a>
                  <a 
                    href="https://linkedin.com/company/jobportal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                  >
                    <span className="social-icon">💼</span>
                    LinkedIn
                  </a>
                  <a 
                    href="https://twitter.com/jobportal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link twitter"
                  >
                    <span className="social-icon">🐦</span>
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="card">
            <div className="card-header">
              <h3>❓ Quick Help</h3>
            </div>
            <div className="card-content">
              <div className="faq-item">
                <strong>How do I post a job?</strong>
                <p>Register as a recruiter and navigate to "Post Job" in your dashboard.</p>
              </div>
              <div className="faq-item">
                <strong>How do I apply for jobs?</strong>
                <p>Create a job seeker account, complete your profile, and browse available positions.</p>
              </div>
              <div className="faq-item">
                <strong>Is the service free?</strong>
                <p>Yes! Our basic job portal services are completely free for both job seekers and recruiters.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="contact-form-section">
          <div className="card">
            <div className="card-header">
              <h3>💬 Send Us a Message</h3>
              {isAuthenticated && (
                <p className="user-note">
                  Hello {user?.name}! Your contact information has been pre-filled.
                </p>
              )}
            </div>
            <div className="card-content">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Job Posting Help">Job Posting Help</option>
                      <option value="Account Issues">Account Issues</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                    disabled={loading}
                  />
                  <small className="char-count">
                    {formData.message.length}/1000 characters
                  </small>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
                >
                  {loading ? '📤 Sending...' : '📤 Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
