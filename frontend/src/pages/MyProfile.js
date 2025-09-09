import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ChangePassword from '../components/ChangePassword';

const MyProfile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false); // Add this state

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Fetching profile data...');
        const response = await getMyProfile();
        console.log('📋 Profile data received:', response);
        setUser(response.data.user);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load profile';
        setError(message);
        console.error('❌ Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Add these handler functions
  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    alert('Password changed successfully! Please use your new password for future logins.');
  };

  const handlePasswordChangeClose = () => {
    setShowChangePassword(false);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to render array items
  const renderArrayItems = (items, itemName = 'item') => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <p className="no-data">No {itemName}s added yet.</p>;
    }
    return (
      <div className="skill-tags">
        {items.map((item, index) => (
          <span key={index} className="skill-tag">{item}</span>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="page">
        <h1>My Profile</h1>
        <div className="error-message">Please log in to view your profile.</div>
        <Link to="/login" className="auth-btn">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <h1>My Profile</h1>
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <h1>My Profile</h1>
        <div className="error-message">No profile data found.</div>
      </div>
    );
  }

  return (
    <>
      <div className="page">
        <div className="page-header">
          <h1>My Profile</h1>
          <div className="header-actions">
            <Link to="/profile" className="edit-btn">Update Profile</Link>
            <Link to="/cv-builder" className="feature-link">Create CV</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{user?.name || 'Unnamed User'}</h3>
            <div className="card-actions">
              <span className={`role-badge ${user?.role === 'recruiter' ? 'recruiter' : 'job-seeker'}`}>
                {user?.role === 'job_seeker' ? 'Job Seeker' : 
                 user?.role === 'recruiter' ? 'Recruiter' : 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="card-content">
            {/* Basic Information */}
            <div className="profile-section">
              <h4>Basic Information</h4>
              <div className="profile-grid">
                <div className="profile-field">
                  <strong>Full Name:</strong>
                  <span>{user?.name || '-'}</span>
                </div>
                <div className="profile-field">
                  <strong>Email:</strong>
                  <span>{user?.email || '-'}</span>
                </div>
                <div className="profile-field">
                  <strong>Phone:</strong>
                  <span>{user?.phone || '-'}</span>
                </div>
                <div className="profile-field">
                  <strong>Role:</strong>
                  <span>{user?.role === 'job_seeker' ? 'Job Seeker' : user?.role === 'recruiter' ? 'Recruiter' : user?.role || '-'}</span>
                </div>
                {user?.address && (
                  <div className="profile-field">
                    <strong>Address:</strong>
                    <span>{user.address}</span>
                  </div>
                )}
                {user?.dateOfBirth && (
                  <div className="profile-field">
                    <strong>Date of Birth:</strong>
                    <span>{formatDate(user.dateOfBirth)}</span>
                  </div>
                )}
                <div className="profile-field">
                  <strong>Member Since:</strong>
                  <span>{formatDate(user?.createdAt)}</span>
                </div>
                <div className="profile-field">
                  <strong>Last Updated:</strong>
                  <span>{formatDate(user?.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Job Seeker Specific Information */}
            {user?.role === 'job_seeker' && (
              <>
                {/* Skills Section */}
                <div className="profile-section">
                  <h4>Skills</h4>
                  {renderArrayItems(user?.skills, 'skill')}
                </div>

                {/* Expertise Section */}
                <div className="profile-section">
                  <h4>Areas of Expertise</h4>
                  {renderArrayItems(user?.expertise, 'expertise')}
                </div>

                {/* Hobbies Section */}
                <div className="profile-section">
                  <h4>Hobbies & Interests</h4>
                  {renderArrayItems(user?.hobbies, 'hobby')}
                </div>

                {/* Experience Summary */}
                {user?.experience && (
                  <div className="profile-section">
                    <h4>Experience Summary</h4>
                    <div className="text-content">
                      <p>{user.experience}</p>
                    </div>
                  </div>
                )}

                {/* Education Summary */}
                {user?.education && (
                  <div className="profile-section">
                    <h4>Education Summary</h4>
                    <div className="text-content">
                      <p>{user.education}</p>
                    </div>
                  </div>
                )}

                {/* Detailed Work Experience */}
                {user?.experienceEntries && user.experienceEntries.length > 0 && (
                  <div className="profile-section">
                    <h4>Work Experience Details</h4>
                    <div className="experience-list">
                      {user.experienceEntries.map((exp, index) => (
                        <div key={index} className="cv-item">
                          <div className="cv-item-head">
                            <strong>{exp.jobTitle || 'Position'}</strong>
                            <span>{exp.company || 'Company'}</span>
                            <span className="cv-dates">{exp.duration || 'Duration not specified'}</span>
                          </div>
                          {exp.description && (
                            <div className="cv-description">
                              <p>{exp.description}</p>
                            </div>
                          )}
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <div className="cv-responsibilities">
                              <strong>Key Responsibilities:</strong>
                              <ul>
                                {exp.responsibilities.map((resp, i) => (
                                  <li key={i}>{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Education History */}
                {user?.educationEntries && user.educationEntries.length > 0 && (
                  <div className="profile-section">
                    <h4>Education History Details</h4>
                    <div className="education-list">
                      {user.educationEntries.map((edu, index) => (
                        <div key={index} className="cv-item">
                          <div className="cv-item-head">
                            <strong>{edu.degree || 'Degree'}</strong>
                            <span>{edu.institution || 'Institution'}</span>
                            <span className="cv-dates">{edu.duration || 'Duration not specified'}</span>
                          </div>
                          {edu.description && (
                            <div className="cv-description">
                              <p>{edu.description}</p>
                            </div>
                          )}
                          {edu.grade && (
                            <div className="cv-grade">
                              <strong>Grade/GPA:</strong> {edu.grade}
                            </div>
                          )}
                          {edu.achievements && edu.achievements.length > 0 && (
                            <div className="cv-achievements">
                              <strong>Achievements:</strong>
                              <ul>
                                {edu.achievements.map((achievement, i) => (
                                  <li key={i}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume/CV Section */}
                {user?.resume && (
                  <div className="profile-section">
                    <h4>Resume/CV Document</h4>
                    <div className="resume-section">
                      <a 
                        href={user.resume} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="feature-link"
                      >
                        📄 View Resume Document
                      </a>
                      <p className="resume-note">Click the link above to view or download your uploaded resume.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Recruiter Specific Information */}
            {user?.role === 'recruiter' && (
              <>
                <div className="profile-section">
                  <h4>Company Information</h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <strong>Company Name:</strong>
                      <span>{user?.company || '-'}</span>
                    </div>
                    {user?.companyDescription && (
                      <div className="profile-field full-width">
                        <strong>Company Description:</strong>
                        <div className="text-content">
                          <p>{user.companyDescription}</p>
                        </div>
                      </div>
                    )}
                    {user?.website && (
                      <div className="profile-field">
                        <strong>Company Website:</strong>
                        <a 
                          href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="feature-link"
                        >
                          🌐 {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recruiter Statistics (if available) */}
                <div className="profile-section">
                  <h4>Recruitment Statistics</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <strong>Jobs Posted:</strong>
                      <span>{user?.jobsPosted || 0}</span>
                    </div>
                    <div className="stat-item">
                      <strong>Active Jobs:</strong>
                      <span>{user?.activeJobs || 0}</span>
                    </div>
                    <div className="stat-item">
                      <strong>Total Applications:</strong>
                      <span>{user?.totalApplications || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account Information */}
            <div className="profile-section">
              <h4>Account Information</h4>
              <div className="profile-grid">
                <div className="profile-field">
                  <strong>User ID:</strong>
                  <span>{user?._id || user?.id || '-'}</span>
                </div>
                <div className="profile-field">
                  <strong>Account Status:</strong>
                  <span className="status-active">Active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions - Updated with Change Password Button */}
            <div className="profile-section">
              <h4>Quick Actions</h4>
              <div className="quick-actions">
                <Link to="/profile" className="action-btn">
                  ✏️ Edit Profile Information
                </Link>
                
                {/* Add Change Password Button */}
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="action-btn password-btn"
                >
                  🔒 Change Password
                </button>

                {user?.role === 'job_seeker' && (
                  <>
                    <Link to="/cv-builder" className="action-btn">
                      📄 Build/Update Resume
                    </Link>
                    <Link to="/applications" className="action-btn">
                      📋 View My Applications
                    </Link>
                    <Link to="/jobs" className="action-btn">
                      🔍 Browse Jobs
                    </Link>
                  </>
                )}
                {user?.role === 'recruiter' && (
                  <>
                    <Link to="/jobs/add" className="action-btn">
                      ➕ Post New Job
                    </Link>
                    <Link to="/jobs/my-jobs" className="action-btn">
                      💼 Manage My Jobs
                    </Link>
                    <Link to="/jobs" className="action-btn">
                      📊 View All Job Applications
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          onClose={handlePasswordChangeClose}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </>
  );
};

export default MyProfile;
