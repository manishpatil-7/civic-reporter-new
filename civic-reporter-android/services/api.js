import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://civic-reporter-android-app.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Interceptor to attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Failed to attach Firebase token:', err);
  }

  // React Native FormData fix: Never let Axios set a static 'multipart/form-data' without boundary
  if (config.data && (config.data instanceof FormData || config.data._parts)) {
    if (config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
    if (config.headers && config.headers.common && config.headers.common['Content-Type']) {
      delete config.headers.common['Content-Type'];
    }
    if (config.headers && config.headers.post && config.headers.post['Content-Type']) {
      delete config.headers.post['Content-Type'];
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper for multipart/form-data images in React Native
const formatImageFormData = (fileOrUri) => {
  const formData = new FormData();
  if (typeof fileOrUri === 'string') {
    const filename = fileOrUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', {
      uri: fileOrUri,
      name: filename,
      type,
    });
  } else if (fileOrUri && fileOrUri.uri) {
    formData.append('image', {
      uri: fileOrUri.uri,
      name: fileOrUri.name || fileOrUri.fileName || 'photo.jpg',
      type: fileOrUri.type || fileOrUri.mimeType || 'image/jpeg',
    });
  } else {
    formData.append('image', fileOrUri);
  }
  return formData;
};

// Upload image to Cloudinary via backend endpoint
export const uploadImage = async (fileOrUri) => {
  const formData = formatImageFormData(fileOrUri);
  return api.post('/upload', formData, {
    transformRequest: (data) => data,
    timeout: 90000,
  });
};

// Analyze image with AI (supports optional category and problemType)
export const analyzeImage = async (
  fileOrUri,
  { userName = '', locationAddress = '', authorityInfo = null, category = '', problemType = '' } = {}
) => {
  const uploadRes = await uploadImage(fileOrUri);
  const imageUrl = uploadRes.data?.imageUrl;

  const payload = {
    imageUrl,
    userName,
    locationAddress,
    authorityInfo,
  };
  if (category) payload.category = category;
  if (problemType) payload.problemType = problemType;

  const aiRes = await api.post('/ai/analyze', payload);
  return {
    data: {
      ...aiRes.data,
      imageUrl,
      // Normalize detections if provided
      detections: aiRes.data?.detections || [],
      canReportManually: aiRes.data?.canReportManually ?? true,
    },
  };
};

// Dedicated road damage detection endpoint
export const detectRoadDamage = async (fileOrUri, confidence = 0.25) => {
  const formData = formatImageFormData(fileOrUri);
  formData.append('confidence', String(confidence));
  try {
    return await api.post('/ai/road-damage/detect', formData, {
      transformRequest: (data) => data,
    });
  } catch (err) {
    return analyzeImage(fileOrUri, { category: 'Road Damage', problemType: 'Pothole' });
  }
};

// Dedicated garbage detection endpoint
export const detectGarbage = async (fileOrUri, confidence = 0.25) => {
  const formData = formatImageFormData(fileOrUri);
  formData.append('confidence', String(confidence));
  try {
    return await api.post('/ai/garbage/detect', formData, {
      transformRequest: (data) => data,
    });
  } catch (err) {
    return analyzeImage(fileOrUri, { category: 'Garbage', problemType: 'Garbage Dump' });
  }
};

// Dedicated streetlight physical damage inspection endpoint (Gemini Primary)
export const detectStreetlight = async (fileOrUri) => {
  const formData = formatImageFormData(fileOrUri);
  try {
    return await api.post('/ai/streetlight/detect', formData, {
      transformRequest: (data) => data,
    });
  } catch (err) {
    return analyzeImage(fileOrUri, { category: 'Street Light', problemType: 'Streetlight Fault' });
  }
};

// Check AI status (YOLO models status, thresholds, and Gemini readiness)
export const getAiStatus = async () => {
  return await api.get('/ai/status');
};

// AI-based duplicate detection
export const checkDuplicate = async (problemType, description, locationData = {}) => {
  return api.post('/duplicates/check', {
    problemType,
    description,
    state: locationData.state || '',
    district: locationData.district || '',
    city: locationData.city || '',
    area: locationData.area || '',
  });
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
  return await api.patch(`/complaints/${id}/upvote`, {});
};

export const sendComplaintEmail = async (id, emailData) => {
  return await api.post(`/complaints/${id}/send-email`, emailData);
};

export const detectAuthority = async (lat, lng, address = null) => {
  return await api.post('/authority/detect', { lat, lng, address });
};

export const reverseGeocodeLocation = async (lat, lng, address = null) => {
  return await api.post('/authority/detect', { lat, lng, address });
};

export const translateLetter = async (text, targetLanguage) => {
  return await api.post('/ai/translate', { text, targetLanguage });
};

// User Management (Admin / RBAC)
export const getUsers = async () => {
  return await api.get('/users');
};

export const promoteUser = async (uid) => {
  return await api.put(`/users/promote/${uid}`);
};

export const demoteUser = async (uid) => {
  return await api.put(`/users/demote/${uid}`);
};

export const requestAdminAccess = async () => {
  return await api.post('/users/request-admin');
};

export const getAdminRequests = async () => {
  return await api.get('/users/admin-requests');
};

export const approveAdminRequest = async (uid) => {
  return await api.put(`/users/admin-requests/${uid}/approve`);
};

export const rejectAdminRequest = async (uid) => {
  return await api.put(`/users/admin-requests/${uid}/reject`);
};

// Notifications
export const getNotifications = async () => {
  return await api.get('/notifications');
};

export const markNotificationAsRead = async (id) => {
  return await api.put(`/notifications/${id}/read`);
};

export const deleteComplaint = async (id) => {
  return await api.delete(`/complaints/${id}`);
};

// AI Category Validation
export const validateCategory = async (imageUrl, selectedCategory) => {
  return await api.post('/ai/validate-category', { imageUrl, selectedCategory });
};

// Reputation System
export const getUserReputation = async (uid) => {
  return await api.get(`/users/reputation/${uid}`);
};

export const updateUserReputation = async (uid, action) => {
  return await api.put(`/users/reputation/${uid}`, { action });
};

export const checkCanSubmit = async (uid) => {
  return await api.get(`/users/can-submit/${uid}`);
};

// OTP Verification
export const sendOTP = async (email, name) => {
  return await api.post('/otp/send', { email, name });
};

export const verifyOTP = async (email, otp) => {
  return await api.post('/otp/verify', { email, otp });
};

export const checkEmailVerified = async (email) => {
  return await api.get(`/otp/check/${encodeURIComponent(email)}`);
};

// Location Extraction from Image EXIF
export const extractLocationFromImage = async (fileOrUri) => {
  const formData = formatImageFormData(fileOrUri);
  return api.post('/location/extract', formData, {
    transformRequest: (data) => data,
    timeout: 30000,
  });
};

// User Profile REST Proxy (Hardened ROM / Adblocker Resilience)
export const getUserProfile = async (uid) => {
  return await api.get(`/users/profile/${uid}`);
};

export const saveUserProfile = async (uid, data) => {
  return await api.post(`/users/profile/${uid}`, data);
};

export default api;
