import axiosInstance from '../lib/axios';

const BASE_URL = '/shelters';

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

// Medical passport update endpoints
export const addMedicalLog = async (petId, { notes, treatment }) => {
  const response = await axiosInstance.post(`${BASE_URL}/me/passports/${petId}/log`, { notes, treatment });
  return response.data;
};

export const addVaccination = async (petId, { name, date, status }) => {
  const response = await axiosInstance.post(`${BASE_URL}/me/passports/${petId}/vaccination`, { name, date, status });
  return response.data;
};

// Foster management
export const approveFoster = async (fosterId, reviewNote = '') => {
  const response = await axiosInstance.patch(`${BASE_URL}/me/fosters/${fosterId}/approve`, { reviewNote });
  return response.data;
};

export const rejectFoster = async (fosterId, reviewNote = '') => {
  const response = await axiosInstance.patch(`${BASE_URL}/me/fosters/${fosterId}/reject`, { reviewNote });
  return response.data;
};

// Citizens: apply to foster a pet
export const applyToFoster = async (petId, message = '') => {
  const response = await axiosInstance.post(`${BASE_URL}/adoptions/${petId}/foster-apply`, { message });
  return response.data;
};

