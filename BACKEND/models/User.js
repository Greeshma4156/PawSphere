import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['citizen', 'volunteer', 'admin'],
    default: 'citizen',
  },
  avatar: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: '',
  },
  // Volunteer Onboarding Info
  isVerified: {
    type: Boolean,
    default: function() {
      return this.role !== 'volunteer'; // Citizens auto-verified, volunteers need admin review
    },
  },
  experienceLevel: {
    type: String,
    enum: ['none', 'beginner', 'intermediate', 'expert'],
    default: 'none',
  },
  documentUrl: {
    type: String,
    default: '',
  },
  // Volunteer Coordinates & Settings
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [77.5946, 12.9716], // Default Bengaluru [lng, lat]
    },
  },
  availability: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  },
  radius: {
    type: Number,
    default: 10, // Default 10km radius
  },
  // Gamification
  points: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  badges: {
    type: [String],
    default: [],
  },
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index location for geospatial queries
UserSchema.index({ location: '2dsphere' });

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'supersecretpawkey_123', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
