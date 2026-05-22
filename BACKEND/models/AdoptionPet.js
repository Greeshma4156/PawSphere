import mongoose from 'mongoose';

const AdoptionPetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  animalType: {
    type: String,
    enum: ['dog', 'cat', 'bird', 'other'],
    required: true,
  },
  breed: {
    type: String,
    default: 'Mixed Breed',
  },
  age: {
    type: String,
    required: true,
  },
  story: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  shelter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Reference to the shelter user profile
    required: true,
  },
  // Medical Passport Fields
  medicalPassportId: {
    type: String,
    required: true,
    unique: true,
  },
  qrCodeUrl: {
    type: String,
    default: '',
  },
  vaccinations: [
    {
      name: { type: String, required: true },
      date: { type: Date, required: true },
      status: { type: String, enum: ['completed', 'pending'], default: 'completed' },
    }
  ],
  healthLog: [
    {
      date: { type: Date, default: Date.now },
      notes: { type: String, required: true },
      treatment: { type: String, default: '' },
    }
  ],
  status: {
    type: String,
    enum: ['rehab', 'available', 'pending_adoption', 'adopted'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AdoptionPet', AdoptionPetSchema);
