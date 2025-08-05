import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data || response);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users ({users.length})</h1>
        <Link to="/users/add" className="add-btn">Add New User</Link>
      </div>
      
      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found. Add some users to get started!</p>
          <Link to="/users/add" className="add-btn">Add First User</Link>
        </div>
      ) : (
        <div className="cards-grid">
          {users.map(user => (
            <div key={user._id} className="card">
              <div className="card-header">
                <h3>{user.name}</h3>
                <div className="card-actions">
                  <Link to={`/users/update/${user._id}`} state={{ user }} className="edit-btn">Edit</Link>
                  <button onClick={() => handleDelete(user._id)} className="delete-btn">Delete</button>
                </div>
              </div>
              <div className="card-content">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
