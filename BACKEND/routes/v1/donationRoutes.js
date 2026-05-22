import express from 'express';
import {
  getCampaigns,
  createCampaign,
  donateToCampaign
} from '../../controllers/donationController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// @route   GET /api/v1/donations/campaigns
// @desc    Get all donation campaigns (public)
router.get('/campaigns', getCampaigns);

// @route   POST /api/v1/donations/campaign
// @desc    Create a new fundraising campaign (protected)
router.post('/campaign', protect, createCampaign);

// @route   POST /api/v1/donations/donate
// @desc    Donate to a fundraising campaign (requires optional auth, we run protect middleware)
router.post('/donate', protect, donateToCampaign);

export default router;
