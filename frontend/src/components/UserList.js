import React from 'react';
import UserCard from './UserCard';

const UserList = ({ users = [], onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <p>No users found. Add some users to get started!</p>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {users.map(user => (
        <UserCard
          key={user._id}
          user={user}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default UserList;
