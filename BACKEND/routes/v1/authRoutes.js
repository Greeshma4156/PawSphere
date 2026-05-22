import express from 'express';
import { signup, login, getMe } from '../../controllers/authController.js';
import { validateSignup, validateLogin } from '../../validators/authValidator.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;
