import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../services/adminApi';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminDashboard();
        setDashboardData(response.data);
      } catch (err) {
        const message = err?.message || 'Failed to load dashboard';
        setError(message);
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboard();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="page">
        <div className="error-message">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const { totalCounts, recentActivities } = dashboardData || {};

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}! Here's your platform overview.</p>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{totalCounts?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card job-seekers">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <h3>{totalCounts?.totalJobSeekers || 0}</h3>
            <p>Job Seekers</p>
          </div>
        </div>
        <div className="stat-card recruiters">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{totalCounts?.totalRecruiters || 0}</h3>
            <p>Recruiters</p>
          </div>
        </div>
        <div className="stat-card jobs">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{totalCounts?.totalJobs || 0}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card active-jobs">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{totalCounts?.activeJobs || 0}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className="stat-card applications">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{totalCounts?.totalApplications || 0}</h3>
            <p>Applications</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="admin-content-grid">
        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Users</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivities?.recentUsers?.map((user) => (
                <div key={user._id} className="activity-item">
                  <div className="activity-info">
                    <strong>{user.name}</strong>
                    <span className="activity-meta">{user.email}</span>
                  </div>
                  <div className="activity-details">
                    <span className={`role-badge ${user.role}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className="activity-time">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Jobs</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivities?.recentJobs?.map((job) => (
                <div key={job._id} className="activity-item">
                  <div className="activity-info">
                    <strong>{job.title}</strong>
                    <span className="activity-meta">
                      {job.company} • {job.location}
                    </span>
                  </div>
                  <div className="activity-details">
                    <span className={`status-badge ${job.status}`}>
                      {job.status}
                    </span>
                    <span className="activity-time">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Applications</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivities?.recentApplications?.map((app) => (
                <div key={app._id} className="activity-item">
                  <div className="activity-info">
                    <strong>{app.applicant?.name}</strong>
                    <span className="activity-meta">
                      Applied to: {app.job?.title}
                    </span>
                  </div>
                  <div className="activity-details">
                    <span className={`status-badge ${app.status}`}>
                      {app.status}
                    </span>
                    <span className="activity-time">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
