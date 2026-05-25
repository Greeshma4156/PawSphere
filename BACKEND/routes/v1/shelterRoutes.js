import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getCapacity,
  getIncomingQueue,
  intakeRescue,
  getAdoptions,
  getMedicalPassports,
  getFosterRequests,
} from '../../controllers/shelterController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Shelter API base' });
});

router.get('/me/capacity', protect, authorize('shelter', 'admin'), getCapacity);

router.get('/me/queue', protect, authorize('shelter', 'admin'), getIncomingQueue);

router.post('/:rescueId/intake', protect, authorize('shelter', 'admin'), intakeRescue);

router.get('/me/adoptions', protect, authorize('shelter', 'admin'), getAdoptions);

router.get('/me/passports', protect, authorize('shelter', 'admin'), getMedicalPassports);

router.get('/me/fosters', protect, authorize('shelter', 'admin'), getFosterRequests);

export default router;

