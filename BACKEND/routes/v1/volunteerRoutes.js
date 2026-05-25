import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  setAvailability,
  claimRescue,
  updateRescueStatus,
  getNearbyQueue,
  getAssignedMissions,
  getVolunteerStats,
} from '../../controllers/volunteerController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Volunteer API base' });
});

// Availability
router.put('/availability', protect, authorize('volunteer', 'admin'), setAvailability);

// Claim rescue
router.post('/:rescueId/claim', protect, authorize('volunteer', 'admin'), claimRescue);

// Update rescue status
router.put('/:rescueId/status', protect, authorize('volunteer', 'admin'), updateRescueStatus);

// Nearby queue
router.get('/me/queue', protect, authorize('volunteer', 'admin'), getNearbyQueue);

// Assigned missions
router.get('/me/missions', protect, authorize('volunteer', 'admin'), getAssignedMissions);

// Volunteer stats
router.get('/me/stats', protect, authorize('volunteer', 'admin'), getVolunteerStats);

export default router;

