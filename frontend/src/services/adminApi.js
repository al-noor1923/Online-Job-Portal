import api from './api.js';

// Admin Dashboard
export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// User Management
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Job Management
export const getAllJobsAdmin = async (params = {}) => {
  try {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Application Management
export const getAllApplicationsAdmin = async (params = {}) => {
  try {
    const response = await api.get('/admin/applications', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
