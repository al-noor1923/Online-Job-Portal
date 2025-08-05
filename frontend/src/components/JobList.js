import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs, deleteJob } from '../services/api';
import JobList from '../components/JobList';  // Import JobList

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs();
      setJobs(response.data || response);
    } catch (error) {
      setError('Failed to fetch jobs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (error) {
      alert('Failed to delete job');
    }
  };

  if (loading) return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Jobs ({jobs.length})</h1>
        <Link to="/jobs/add" className="add-btn">Add New Job</Link>
      </div>
      
      <JobList jobs={jobs} onDelete={handleDelete} />
    </div>
  );
};

export default Job;
