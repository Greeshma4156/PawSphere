import axiosInstance from '../lib/axios';

const BASE_URL = '/api/v1/donations';

/**
 * Fetch all fundraising campaigns
 */
export const getCampaigns = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/campaigns`);
  return response.data;
};

/**
 * Create a new fundraising campaign (protected, shelter/admin only)
 * @param {Object} data - Campaign details {title, description, targetAmount, rescueCase, expenses}
 */
export const createCampaign = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/campaign`, data);
  return response.data;
};

/**
 * Donate to a campaign (requires optional auth for logged-in user details)
 * @param {Object} data - {campaignId, amount, donorName}
 */
export const donateToCampaign = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/donate`, data);
  return response.data;
};
