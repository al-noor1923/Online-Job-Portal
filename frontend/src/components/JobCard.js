import React from 'react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job, onDelete, onUpdate }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/jobs/update/${job._id}`, { state: { job } });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      onDelete(job._id);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{job.title}</h3>
        <div className="card-actions">
          <button onClick={handleEdit} className="edit-btn">Edit</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      </div>
      
      <div className="card-content">
        <p><strong>Company:</strong> {job.company}</p>
        <p><strong>Location:</strong> {job.location}</p>
        {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Experience:</strong> {job.experience}</p>
        {job.remote && <span className="remote-badge">Remote Available</span>}
        
        {job.description && (
          <p><strong>Description:</strong> {job.description.substring(0, 150)}...</p>
        )}
        
        {job.requirements && job.requirements.length > 0 && (
          <div className="requirements">
            <strong>Requirements:</strong>
            <div className="requirement-tags">
              {job.requirements.slice(0, 3).map((req, index) => (
                <span key={index} className="requirement-tag">{req}</span>
              ))}
              {job.requirements.length > 3 && <span>+{job.requirements.length - 3} more</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
