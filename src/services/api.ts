import axios from 'axios';

// 🔁 Replace this with your deployed backend URL when ready
const API_BASE_URL = 'http://192.168.254.203:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const scrapeTopClips = async (config: {
  days_back: number;
  limit: number;
  english_only: boolean;
  game_filter?: string;
}) => {
  const response = await api.post('/scrape/top-clips', config);
  return response.data;
};

export const scrapeChannelHighlights = async (config: {
  channels: string[];
  days_back: number;
  clips_per_channel: number;
}) => {
  const response = await api.post('/scrape/channel-highlights', config);
  return response.data;
};

export const getJobStatus = async (jobId: number) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const getJobClips = async (jobId: number) => {
  const response = await api.get(`/jobs/${jobId}/clips`);
  return response.data;
};

export const deleteJob = async (jobId: number) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const getPresets = async () => {
  const response = await api.get('/presets');
  return response.data;
};

export default api;