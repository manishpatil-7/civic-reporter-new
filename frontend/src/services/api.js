import axios from 'axios';

// Proxy setup will handle the port routing locally in vite.config.js, 
// but we'll use absolute localhost for explicit connection here since they aren't configured yet.
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL, 
});

// Since the user drops a file, we need to upload it to their Cloudinary setup first 
// to get the imageUrl, which we pass to Gemini and the final createComplaint.
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  // Axios automatically detects FormData and applies the correct Content-Type with boundary limits.
  return api.post('/upload', formData);
};

export const analyzeImage = async (file) => {
  // First, upload to cloudinary via our endpoint
  const uploadRes = await uploadImage(file);
  const imageUrl = uploadRes.data.imageUrl;
  
  // Second, hit Gemini AI with the generated imageUrl
  const aiRes = await api.post('/ai/analyze', { imageUrl });
  
  // Attach imageUrl to result so Submit page has it
  return { data: { ...aiRes.data, imageUrl } };
};

// Simulate duplicate checking (as a local check just for WOW effect)
export const checkDuplicate = async (problemType, location) => {
  // We mock the duplicate check delay since we don't have a Vector search endpoint built yet
  await new Promise(resolve => setTimeout(resolve, 800));
  if (problemType.toLowerCase().includes('pothole') || Math.random() > 0.5) {
    return { data: { isDuplicate: true, confidence: 85, similarId: '1' } };
  }
  return { data: { isDuplicate: false } };
};

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

export const upvoteComplaint = async (id) => {
  return await api.patch(`/complaints/${id}/upvote`);
};

export default api;
