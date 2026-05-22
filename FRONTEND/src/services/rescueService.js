import axiosInstance from '../lib/axios';

// Base endpoint for rescue API
const BASE_URL = '/api/v1/rescues';

/**
 * Report a new stray rescue case.
 * @param {Object} data - Rescue payload (title, animalType, injurySeverity, description, coordinates, address, photos)
 * @returns {Promise}
 */
export const reportRescue = async (data) => {
  const response = await axiosInstance.post(BASE_URL, data);
  return response.data;
};

/**
 * Get all rescue cases, optionally filtered by status or animal type.
 * @param {Object} params - Query params {status, animalType}
 */
export const getRescues = async (params = {}) => {
  const response = await axiosInstance.get(BASE_URL, { params });
  return response.data;
};

/**
 * Get detailed info and timeline for a specific rescue case.
 * @param {string} id - Rescue case ID
 */
export const getRescueDetails = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Upvote or remove upvote on a rescue case (requires auth).
 * @param {string} id - Rescue case ID
 */
export const upvoteRescue = async (id) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}/upvote`);
  return response.data;
};
