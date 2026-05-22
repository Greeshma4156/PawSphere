import mongoose from 'mongoose';

const RescueTimelineSchema = new mongoose.Schema({
  rescueCase: {
    type: mongoose.Schema.ObjectId,
    ref: 'RescueCase',
    required: true,
  },
  eventType: {
    type: String,
    enum: ['reported', 'assigned', 'on_the_way', 'rescued', 'treatment', 'sheltered', 'safe', 'story', 'custom'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('RescueTimeline', RescueTimelineSchema);
