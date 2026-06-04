import mongoose from 'mongoose';

const ShelterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  registrationNumber: {
    type: String,
    default: '',
  },
  capacity: {
    total: { type: Number, required: true, default: 20 },
    occupied: { type: Number, required: true, default: 0 },
  },
  facilities: {
    type: [String],
    default: ['medical_ward', 'rehabilitation_yard', 'quarantine_zone'],
  },
  emergencyHotline: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Shelter', ShelterSchema);
