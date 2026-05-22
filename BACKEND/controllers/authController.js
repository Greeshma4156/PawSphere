import User from '../models/User.js';
import Shelter from '../models/Shelter.js';
import AuditLog from '../models/AuditLog.js';
import { getDBStatus } from '../config/db.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to sign JWT in-memory mode
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretpawkey_123', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, experienceLevel, documentUrl, registrationNumber, coordinates } = req.body;

    const useInMemory = !getDBStatus();

    if (useInMemory) {
      // InMemory Auth signup
      const exists = inMemoryDb.users.find(u => u.email === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const userId = 'user_id_' + Date.now();
      const newUser = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        password: hashPassword,
        role: role || 'citizen',
        phone: phone || '',
        isVerified: role !== 'volunteer', // Volunteers need verification
        experienceLevel: experienceLevel || 'none',
        documentUrl: documentUrl || '',
        location: {
          type: 'Point',
          coordinates: coordinates || [77.5946, 12.9716],
        },
        availability: 'offline',
        radius: 10,
        points: 0,
        streak: 0,
        badges: [],
        createdAt: new Date(),
      };

      inMemoryDb.users.push(newUser);

      if (role === 'shelter') {
        inMemoryDb.shelters.push({
          _id: 'shelter_info_' + Date.now(),
          user: userId,
          registrationNumber: registrationNumber || 'REG-PENDING',
          capacity: { total: 20, occupied: 0 },
          facilities: ['medical_ward', 'rehabilitation_yard', 'quarantine_zone'],
          emergencyHotline: phone || '',
          createdAt: new Date(),
        });
      }

      inMemoryDb.auditLogs.push({
        _id: 'audit_' + Date.now(),
        action: 'USER_SIGNUP',
        details: `User ${name} signed up as ${role} (In-Memory)`,
        targetId: userId,
        createdAt: new Date(),
      });

      const token = signToken(userId, newUser.role);
      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({ success: true, token, user: userResponse });
    }

    // MONGODB Mode
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const isVerified = role !== 'volunteer';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen',
      phone: phone || '',
      isVerified,
      experienceLevel: experienceLevel || 'none',
      documentUrl: documentUrl || '',
      location: coordinates ? { type: 'Point', coordinates } : undefined,
    });

    if (role === 'shelter') {
      await Shelter.create({
        user: user._id,
        registrationNumber: registrationNumber || 'REG-PENDING',
        capacity: { total: 20, occupied: 0 },
      });
    }

    await AuditLog.create({
      user: user._id,
      username: user.name,
      action: 'USER_SIGNUP',
      details: `User ${user.name} signed up as ${user.role} (MongoDB)`,
      targetId: user._id.toString(),
    });

    const token = user.getSignedJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, token, user: userResponse });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const user = inMemoryDb.users.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = signToken(user._id, user.role);
      const userResponse = { ...user };
      delete userResponse.password;

      return res.status(200).json({ success: true, token, user: userResponse });
    }

    // MONGODB Mode
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, token, user: userResponse });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const user = inMemoryDb.users.find(u => u._id === req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      const userResponse = { ...user };
      delete userResponse.password;
      return res.status(200).json({ success: true, user: userResponse });
    }

    // MONGODB Mode
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
