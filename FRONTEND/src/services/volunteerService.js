import axiosInstance from '../lib/axios';

const BASE_URL = '/api/v1/volunteers';

export const setVolunteerAvailability = async ({ availability }) => {
  const response = await axiosInstance.put(`${BASE_URL}/availability`, { availability });
  return response.data;
};

export const claimRescue = async (rescueId) => {
  const response = await axiosInstance.post(`${BASE_URL}/${rescueId}/claim`);
  return response.data;
};

export const updateRescueStatus = async ({ rescueId, status }) => {
  const response = await axiosInstance.put(`${BASE_URL}/${rescueId}/status`, { status });
  return response.data;
};

export const getNearbyQueue = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/queue`);
  return response.data;
};

export const getAssignedMissions = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/missions`);
  return response.data;
};

export const getVolunteerStats = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/stats`);
  return response.data;
};

