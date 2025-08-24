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

/* =========================================================
   JOBS
========================================================= */
// ⬇️ Modified: accepts optional query params (e.g., { sort, page, limit, minSalary, maxSalary })
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
// ===== CV (Resume) API =====
export const getMyCVs = async () => (await api.get('/cv/my')).data;
export const createCV = async (cv) => (await api.post('/cv', cv)).data;
export const updateCV = async (id, cv) => (await api.put(`/cv/${id}`, cv)).data;
export const deleteCV = async (id) => (await api.delete(`/cv/${id}`)).data;

// ===== Profile (job seeker) =====
export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data; // { success, data: { user } }
};

export const updateProfile = async (payload) => {
  const res = await api.put('/auth/profile', payload);
  return res.data; // { success, message, data: { user } }
};


export default api;
