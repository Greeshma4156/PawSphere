import axiosInstance from '../lib/axios';

const BASE_URL = '/api/v1/shelters';

export const getShelterCapacity = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/capacity`);
  return response.data;
};

export const getIncomingRescueQueue = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/queue`);
  return response.data;
};

export const intakeRescue = async (rescueId) => {
  const response = await axiosInstance.post(`${BASE_URL}/${rescueId}/intake`);
  return response.data;
};

export const getAdoptions = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/adoptions`);
  return response.data;
};

export const getMedicalPassports = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/passports`);
  return response.data;
};

export const getFosterRequests = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/fosters`);
  return response.data;
};

