import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  setAvailability,
  claimRescue,
  updateRescueStatus,
  getNearbyQueue,
  getAssignedMissions,
  getVolunteerStats,
  intakeRescue,
} from '../../controllers/volunteerController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Volunteer API base' });
});

// Availability
router.put('/availability', protect, authorize('volunteer', 'admin'), setAvailability);

// Claim rescue
router.post('/:rescueId/claim', protect, authorize('volunteer', 'admin'), claimRescue);

// Update rescue status (volunteers now own full lifecycle incl. sheltered/treatment/safe)
router.put('/:rescueId/status', protect, authorize('volunteer', 'admin'), updateRescueStatus);

// Complete intake: mark rescued → sheltered + create adoption passport
router.post('/:rescueId/intake', protect, authorize('volunteer', 'admin'), intakeRescue);

// Nearby queue
router.get('/me/queue', protect, authorize('volunteer', 'admin'), getNearbyQueue);

// Assigned missions
router.get('/me/missions', protect, authorize('volunteer', 'admin'), getAssignedMissions);

// Volunteer stats
router.get('/me/stats', protect, authorize('volunteer', 'admin'), getVolunteerStats);

export default router;

