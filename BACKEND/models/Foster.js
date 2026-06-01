import mongoose from 'mongoose';

/**
 * Foster — tracks citizen applications to temporarily foster a rescued pet.
 * A pet can have multiple foster applications; only one can be approved at a time.
 */
const FosterSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdoptionPet',
    required: [true, 'Foster request must reference a pet'],
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Foster request must have an applicant'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    default: '',
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  reviewNote: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index: one application per pet per applicant
FosterSchema.index({ pet: 1, applicant: 1 }, { unique: true });

export { FosterSchema };
export default mongoose.model('Foster', FosterSchema);
