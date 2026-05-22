import mongoose from 'mongoose';

const RescueCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  animalType: {
    type: String,
    enum: ['dog', 'cat', 'bird', 'other'],
    required: [true, 'Please specify animal type'],
  },
  injurySeverity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  description: {
    type: String,
    required: [true, 'Please add injury details'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: [true, 'Please specify coordinates'],
    },
  },
  address: {
    type: String,
    default: '',
  },
  photos: {
    type: [String],
    default: [],
  },
  reporter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedVolunteer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null,
  },
  priorityScore: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'on_the_way', 'rescued', 'treatment', 'sheltered', 'safe'],
    default: 'pending',
  },
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

RescueCaseSchema.index({ location: '2dsphere' });

export default mongoose.model('RescueCase', RescueCaseSchema);
