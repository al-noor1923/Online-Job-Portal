import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpdateJob = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <h1>Update Job</h1>
        <button onClick={() => navigate('/jobs')} className="back-btn">Back to Jobs</button>
      </div>
      <div className="empty-state">
        <p>Update Job functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default UpdateJob;
