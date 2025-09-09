import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || '';
      if (message.includes('expired') || message.includes('invalid')) {
        // Token expired, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   AUTH
========================================================= */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get current user profile for MyProfile page
export const getMyProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error.response?.data || error.message;
  }
};

/* =========================================================
   JOBS
========================================================= */
export const getAllJobs = async (params = {}) => {
  try {
    console.log('📡 Making API call to: /jobs with params =>', params);
    const response = await api.get('/jobs', { params });
    console.log('📋 API response received:', response);
    return response.data; // { success, data, meta }
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('Error details:', error.response?.data);
    throw error.response?.data || error.message;
  }
};

export const getMyJobs = async () => {
  try {
    console.log('📡 Making API call to: /jobs/my-jobs');
    const response = await api.get('/jobs/my-jobs');
    console.log('📋 API response received:', response);
    return response.data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('Error details:', error.response?.data);
    throw error.response?.data || error.message;
  }
};

export const getJobApplications = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateJob = async (id, jobData) => {
  try {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getJobDetails = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/* =========================================================
   APPLICATIONS
========================================================= */
export const applyForJob = async (jobId, coverLetter) => {
  try {
    const response = await api.post('/applications/apply', { jobId, coverLetter });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/my-applications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    throw error.response?.data || error.message;
  }
};

export const getReceivedApplications = async () => {
  try {
    const response = await api.get('/applications/received-applications');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/* =========================================================
   CV (Resume) API
========================================================= */
export const getMyCVs = async () => {
  try {
    const response = await api.get('/cv/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCV = async (cv) => {
  try {
    const response = await api.post('/cv', cv);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCV = async (id, cv) => {
  try {
    const response = await api.put(`/cv/${id}`, cv);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCV = async (id) => {
  try {
    const response = await api.delete(`/cv/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/* =========================================================
   PROFILE API
========================================================= */
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data; // { success, data: { user } }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProfile = async (payload) => {
  try {
    const response = await api.put('/auth/profile', payload);
    return response.data; // { success, message, data: { user } }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Contact form submission
export const submitContactForm = async (contactData) => {
  try {
    const response = await api.post('/contact', contactData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all contacts (Admin only)
export const getAllContacts = async (params = {}) => {
  try {
    const response = await api.get('/contact', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update contact status (Admin only)
export const updateContactStatus = async (contactId, status) => {
  try {
    const response = await api.put(`/contact/${contactId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



export default api;
