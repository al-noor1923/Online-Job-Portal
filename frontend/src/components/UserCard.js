import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, onDelete, onUpdate }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/users/update/${user._id}`, { state: { user } });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      onDelete(user._id);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{user.name}</h3>
        <div className="card-actions">
          <button onClick={handleEdit} className="edit-btn">Edit</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      </div>
      
      <div className="card-content">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        {user.address && <p><strong>Address:</strong> {user.address}</p>}
        
        {user.skills && user.skills.length > 0 && (
          <div className="skills">
            <strong>Skills:</strong>
            <div className="skill-tags">
              {user.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {user.experience && (
          <p><strong>Experience:</strong> {user.experience.substring(0, 100)}...</p>
        )}
        
        {user.resume && (
          <a href={user.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
            View Resume
          </a>
        )}
      </div>
    </div>
  );
};

export default UserCard;
