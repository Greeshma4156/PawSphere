import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getCapacity,
  getIncomingQueue,
  intakeRescue,
  getAdoptions,
  getMedicalPassports,
  getFosterRequests,
  addMedicalLog,
  addVaccination,
  approveFoster,
  rejectFoster,
} from '../../controllers/shelterController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Shelter API base' });
});

// Shelter console routes — accessible by citizen, volunteer, or admin (combined roles)
router.get('/me/capacity',  protect, authorize('citizen', 'volunteer', 'admin'), getCapacity);
router.get('/me/queue',     protect, authorize('citizen', 'volunteer', 'admin'), getIncomingQueue);
router.post('/:rescueId/intake', protect, authorize('citizen', 'volunteer', 'admin'), intakeRescue);
router.get('/me/adoptions', protect, authorize('citizen', 'volunteer', 'admin'), getAdoptions);
router.get('/me/passports', protect, authorize('citizen', 'volunteer', 'admin'), getMedicalPassports);
router.get('/me/fosters',   protect, authorize('citizen', 'volunteer', 'admin'), getFosterRequests);

// Medical passport update routes
router.post('/me/passports/:petId/log',         protect, authorize('citizen', 'volunteer', 'admin'), addMedicalLog);
router.post('/me/passports/:petId/vaccination', protect, authorize('citizen', 'volunteer', 'admin'), addVaccination);

// Foster management
router.patch('/me/fosters/:fosterId/approve', protect, authorize('citizen', 'volunteer', 'admin'), approveFoster);
router.patch('/me/fosters/:fosterId/reject',  protect, authorize('citizen', 'volunteer', 'admin'), rejectFoster);

// Citizens can apply to foster a pet (public-ish — any logged-in user)
router.post('/adoptions/:petId/foster-apply', protect, async (req, res, next) => {
  try {
    const { Foster } = await import('../../models/Foster.js');
    const { petId } = req.params;
    const { message } = req.body;
    const foster = await Foster.create({ pet: petId, applicant: req.user._id, message: message || '' });
    res.status(201).json({ success: true, data: foster });
  } catch (err) { next(err); }
});

export default router;

