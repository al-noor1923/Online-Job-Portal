import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../services/adminApi';
import { useAuth } from '../contexts/AuthContext';

const AdminUsers = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers(filters);
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user, filters]);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      alert('User role updated successfully!');
    } catch (err) {
      alert('Failed to update user role: ' + err.message);
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted successfully!');
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="error-message">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>User Management</h1>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select 
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value, page: 1})}
        >
          <option value="all">All Roles</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
        />
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-content">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                          className="role-select"
                        >
                          <option value="job_seeker">Job Seeker</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleUserDelete(user._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setFilters({...filters, page: i + 1})}
            className={filters.page === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
