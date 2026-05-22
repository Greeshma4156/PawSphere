import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';
import { getDBStatus } from '../config/db.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';

// @desc    Get all donation campaigns
// @route   GET /api/v1/donations/campaigns
// @access  Public
export const getCampaigns = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      return res.status(200).json({
        success: true,
        count: inMemoryDb.donations.length,
        data: inMemoryDb.donations,
      });
    }

    // MongoDB Mode
    const campaigns = await Donation.find().populate('rescueCase');
    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new fundraising campaign
// @route   POST /api/v1/donations/campaign
// @access  Private (Shelter/Admin only)
export const createCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, rescueCase, expenses } = req.body;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const newCampaign = {
        _id: 'donation_' + Date.now(),
        title,
        description,
        targetAmount: Number(targetAmount),
        raisedAmount: 0,
        rescueCase: rescueCase || null,
        expenses: expenses || [],
        backers: [],
        isCompleted: false,
        createdAt: new Date(),
      };
      inMemoryDb.donations.push(newCampaign);

      inMemoryDb.auditLogs.push({
        _id: 'audit_' + Date.now(),
        action: 'DONATION_CAMPAIGN_CREATED',
        details: `Donation campaign '${title}' created (In-Memory)`,
        createdAt: new Date(),
      });

      return res.status(201).json({ success: true, data: newCampaign });
    }

    // MongoDB Mode
    const campaign = await Donation.create({
      title,
      description,
      targetAmount,
      rescueCase: rescueCase || null,
      expenses: expenses || [],
    });

    await AuditLog.create({
      user: req.user ? req.user._id : null,
      username: req.user ? req.user.name : 'System',
      action: 'DONATION_CAMPAIGN_CREATED',
      details: `Donation campaign '${campaign.title}' created (MongoDB)`,
      targetId: campaign._id.toString(),
    });

    // Trigger Socket.io broadcast to all connected clients if available
    const io = req.app.get('io');
    if (io) {
      io.emit('campaign_created', {
        campaignId: campaign._id,
        title: campaign.title,
        targetAmount: campaign.targetAmount,
      });
    }

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
};

// @desc    Process a donation (Stripe mock backend step)
// @route   POST /api/v1/donations/donate
// @access  Public (Optional auth)
export const donateToCampaign = async (req, res, next) => {
  try {
    const { campaignId, amount, donorName } = req.body;
    const donationAmount = Number(amount);
    const useInMemory = !getDBStatus();

    if (!campaignId || !donationAmount || donationAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide campaignId and a valid amount' });
    }

    const backerName = donorName || (req.user ? req.user.name : 'Anonymous PawLover');
    const backerUser = req.user ? req.user._id : null;

    if (useInMemory) {
      const campaign = inMemoryDb.donations.find(d => d._id === campaignId);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      campaign.raisedAmount += donationAmount;
      if (campaign.raisedAmount >= campaign.targetAmount) {
        campaign.isCompleted = true;
      }

      const backerRecord = {
        user: backerUser,
        name: backerName,
        amount: donationAmount,
        timestamp: new Date(),
      };
      campaign.backers.push(backerRecord);

      inMemoryDb.auditLogs.push({
        _id: 'audit_' + Date.now(),
        action: 'DONATION_COMPLETED',
        details: `Donation of $${donationAmount} by ${backerName} to campaign ${campaign.title} (In-Memory)`,
        createdAt: new Date(),
      });

      return res.status(200).json({ success: true, data: campaign });
    }

    // MongoDB Mode
    const campaign = await Donation.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    campaign.raisedAmount += donationAmount;
    if (campaign.raisedAmount >= campaign.targetAmount) {
      campaign.isCompleted = true;
    }

    campaign.backers.push({
      user: backerUser,
      name: backerName,
      amount: donationAmount,
    });

    await campaign.save();

    await AuditLog.create({
      user: backerUser,
      username: backerName,
      action: 'DONATION_COMPLETED',
      details: `Donation of $${donationAmount} by ${backerName} to campaign ${campaign.title} (MongoDB)`,
      targetId: campaign._id.toString(),
    });

    // Notify volunteers/citizens via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('donation_completed', {
        campaignId: campaign._id,
        raisedAmount: campaign.raisedAmount,
        isCompleted: campaign.isCompleted,
        donorName: backerName,
        amount: donationAmount,
      });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
};
