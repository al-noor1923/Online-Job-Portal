import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs, getMyJobs, deleteJob, applyForJob } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [applying, setApplying] = useState(null);

  // --- NEW: sorting state ---
  // '', 'salary_asc', 'salary_desc'
  const [sort, setSort] = useState('');

  // If you decide to add pagination later, you can wire these too:
  // const [page, setPage] = useState(1);
  // const limit = 20;

  useEffect(() => {
    console.log('🔄 Jobs component mounted/updated, fetching jobs...');
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, user, sort]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📡 Making API call to fetch jobs...');
      console.log('View mode:', viewMode);
      console.log('User role:', user?.role);
      console.log('Sort:', sort || '(default newest)');

      let response;

      if (viewMode === 'my-jobs' && user?.role === 'recruiter') {
        console.log('📡 Calling getMyJobs()');
        response = await getMyJobs(); // unchanged
      } else {
        console.log('📡 Calling getAllJobs()', { sort });
        // IMPORTANT: getAllJobs should forward these as query params to /api/jobs
        response = await getAllJobs({
          sort, 
          // page, 
          // limit,
          // When you switch salary to numeric fields, you can add:
          // minSalary, maxSalary
        });
      }
      
      console.log('📋 Raw API response:', response);
      
      if (response && response.success) {
        // Your /api/jobs returns { success, data: items, meta: {...} }
        // Other endpoints may return { success, data: [...] }
        const jobsData = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Jobs data received:', jobsData);
        console.log('📊 Number of jobs:', jobsData.length);
        
        if (jobsData.length > 0) {
          console.log('📄 First job sample:', jobsData[0]);
        }
        
        setJobs(jobsData);
      } else {
        console.error('❌ API response not successful:', response);
        setError('Failed to fetch jobs: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error in fetchJobs:', error);
      setError('Failed to fetch jobs: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
      console.log('✅ fetchJobs completed');
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
        alert('Job deleted successfully!');
      } catch (error) {
        alert('Failed to delete job: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(jobId);
      await applyForJob(jobId, '');
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to apply: ' + (error.message || 'Unknown error'));
    } finally {
      setApplying(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  console.log('🖥️ Rendering Jobs component...');
  console.log('Current state - Loading:', loading, 'Jobs count:', jobs.length, 'Error:', error, 'Sort:', sort);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          {viewMode === 'my-jobs' ? 'My Posted Jobs' : 'Browse All Jobs'} ({jobs.length})
        </h1>

        <div className="header-actions">
          {/* --- NEW: Salary sort dropdown (only visible on "All Jobs" view) --- */}
          {viewMode !== 'my-jobs' && (
            <div className="sort-control" style={{ marginRight: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    const v = e.target.value;
                    console.log('↕️ Sort changed:', v);
                    setSort(v);
                    // If you add pagination later, also reset page to 1 here
                    // setPage(1);
                  }}
                >
                  <option value="">Default (Newest)</option>
                  <option value="salary_asc">Salary: Low → High</option>
                  <option value="salary_desc">Salary: High → Low</option>
                </select>
              </label>
            </div>
          )}

          {user?.role === 'recruiter' && (
            <>
              <div className="view-toggle">
                <button 
                  onClick={() => {
                    console.log('🔄 Switching to all jobs view');
                    setViewMode('all');
                  }}
                  className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
                >
                  All Jobs
                </button>
                <button 
                  onClick={() => {
                    console.log('🔄 Switching to my jobs view');
                    setViewMode('my-jobs');
                  }}
                  className={`toggle-btn ${viewMode === 'my-jobs' ? 'active' : ''}`}
                >
                  My Jobs
                </button>
              </div>
              <Link to="/jobs/add" className="add-btn">Post New Job</Link>
            </>
          )}
        </div>
      </div>

      {/* Debug Information - Remove this in production */}
      <div style={{ 
        background: '#f0f8ff', 
        padding: '1rem', 
        margin: '1rem 0', 
        borderRadius: '5px',
        border: '1px solid #ccc'
      }}>
        <strong>Debug Info:</strong>
        <p>✅ Component rendered successfully</p>
        <p>👤 User role: {user?.role || 'Not logged in'}</p>
        <p>👁️ View mode: {viewMode}</p>
        <p>↕️ Sort: {sort || 'Default (Newest)'}</p>
        <p>📊 Jobs loaded: {jobs.length}</p>
        <p>⚠️ Error: {error || 'None'}</p>
        <p>🔄 Loading: {loading ? 'Yes' : 'No'}</p>
      </div>

      {error && (
        <div className="error">
          <p>❌ Error: {error}</p>
          <button onClick={fetchJobs} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}
      
      {jobs.length === 0 && !loading && !error ? (
        <div className="empty-state">
          {viewMode === 'my-jobs' ? (
            <>
              <p>You haven't posted any jobs yet.</p>
              <Link to="/jobs/add" className="add-btn">Post Your First Job</Link>
            </>
          ) : (
            <>
              <p>No jobs available at the moment.</p>
              <button onClick={fetchJobs} className="retry-btn">
                🔄 Refresh Jobs
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {jobs.map((job, index) => {
            console.log(`🏷️ Rendering job ${index + 1}:`, job.title);
            
            return (
              <div key={job._id || index} className="card job-card">
                <div className="card-header">
                  <div className="job-title-section">
                    <h3>{job.title || 'No Title'}</h3>
                    <p className="company-name">{job.company || 'No Company'}</p>
                    <p className="location">{job.location || 'No Location'}</p>
                  </div>
                  <div className="card-actions">
                    {/* Show edit/delete only for job owner (recruiter) */}
                    {user?.role === 'recruiter' && 
                     job.recruiter && 
                     (job.recruiter._id === user.id || job.recruiter === user.id) && (
                      <>
                        <Link 
                          to={`/jobs/update/${job._id}`} 
                          state={{ job }} 
                          className="edit-btn"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(job._id)} 
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    
                    {/* Show apply button only for job seekers */}
                    {user?.role === 'job_seeker' && (
                      <button 
                        onClick={() => handleApply(job._id)}
                        disabled={applying === job._id}
                        className="apply-btn"
                      >
                        {applying === job._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Type:</strong> {job.type || 'Not specified'}</p>
                  <p><strong>Experience:</strong> {job.experience || 'Not specified'}</p>
                  
                  {job.salary && (
                    <p><strong>Salary:</strong> {job.salary}</p>
                  )}
                  
                  {job.description && (
                    <p><strong>Description:</strong> {job.description.substring(0, 150)}...</p>
                  )}
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="requirements">
                      <strong>Requirements:</strong>
                      <div className="skill-tags">
                        {job.requirements.slice(0, 3).map((req, reqIndex) => (
                          <span key={reqIndex} className="skill-tag">{req}</span>
                        ))}
                        {job.requirements.length > 3 && (
                          <span className="skill-tag">+{job.requirements.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {job.remote && <span className="remote-badge">Remote Available</span>}
                  
                  <div className="job-meta">
                    <p><strong>Posted by:</strong> {job.recruiter?.name || job.recruiter?.company || job.company}</p>
                    <p><strong>Posted on:</strong> {formatDate(job.createdAt)}</p>
                    {job.applicationDeadline && (
                      <p><strong>Apply by:</strong> {formatDate(job.applicationDeadline)}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;
