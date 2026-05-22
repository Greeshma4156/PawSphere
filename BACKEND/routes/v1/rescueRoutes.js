import express from 'express';
import { protect } from '../../middleware/auth.js';
import {
  reportRescue,
  getRescues,
  getRescueDetails,
  upvoteRescue,
} from '../../controllers/rescueController.js';

const router = express.Router();

// @route   POST /api/v1/rescues
// @desc    Report a new stray rescue case (protected)
router.post('/', protect, reportRescue);

// @route   GET /api/v1/rescues
// @desc    Get all rescue cases (public, sorted by priority)
router.get('/', getRescues);

// @route   GET /api/v1/rescues/:id
// @desc    Get a single rescue case with its timeline events
router.get('/:id', getRescueDetails);

// @route   PUT /api/v1/rescues/:id/upvote
// @desc    Upvote or remove upvote on a rescue case (protected)
router.put('/:id/upvote', protect, upvoteRescue);

export default router;
