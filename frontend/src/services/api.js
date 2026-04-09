import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://civic-reporter.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL, 
});

// Upload image to Cloudinary
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData);
};

// Analyze image with AI — now accepts userName and locationAddress
export const analyzeImage = async (file, { userName = '', locationAddress = '' } = {}) => {
  // First, upload to cloudinary via our endpoint
  const uploadRes = await uploadImage(file);
  const imageUrl = uploadRes.data.imageUrl;
  
  // Second, hit Gemini AI with the generated imageUrl + user context
  const aiRes = await api.post('/ai/analyze', { imageUrl, userName, locationAddress });
  
  // Attach imageUrl to result so Submit page has it
  return { data: { ...aiRes.data, imageUrl } };
};

// Duplicate check
export const checkDuplicate = async (problemType, location) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  if (problemType.toLowerCase().includes('pothole') || Math.random() > 0.5) {
    return { data: { isDuplicate: true, confidence: 85, similarId: '1' } };
  }
  return { data: { isDuplicate: false } };
};

// Complaints CRUD
export const createComplaint = async (complaintData) => {
  return await api.post('/complaints', complaintData);
};

export const updateComplaint = async (id, updateData) => {
  return await api.patch(`/complaints/${id}`, updateData);
};

export const getComplaints = async () => {
  return await api.get('/complaints');
};

export const getComplaintById = async (id) => {
  return await api.get(`/complaints/${id}`);
};

export const getComplaintsByUser = async (userId) => {
  return await api.get(`/complaints/user/${userId}`);
};

export const upvoteComplaint = async (id) => {
  return await api.patch(`/complaints/${id}/upvote`);
};

export default api;
