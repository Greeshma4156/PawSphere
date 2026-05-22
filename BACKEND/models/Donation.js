import mongoose from 'mongoose';

const DonationCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add campaign title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add description'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please specify target amount'],
  },
  raisedAmount: {
    type: Number,
    default: 0,
  },
  rescueCase: {
    type: mongoose.Schema.ObjectId,
    ref: 'RescueCase',
    default: null,
  },
  expenses: [
    {
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      billUrl: { type: String, default: '' },
    }
  ],
  backers: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  ],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Donation', DonationCampaignSchema);
