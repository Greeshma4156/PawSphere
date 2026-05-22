import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewerName: {
    type: String,
    required: true,
  },
  target: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Volunteer or Shelter User ID
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please add a review comment'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate target rating average automatically
ReviewSchema.statics.getAverageRating = async function (targetId) {
  const obj = await this.aggregate([
    { $match: { target: targetId } },
    {
      $group: {
        _id: '$target',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('User').findByIdAndUpdate(targetId, {
        points: Math.min(1000, 100 + Math.round(obj[0].averageRating * 50)) // Example: award gamified points for rating averages
      });
    }
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.target);
});

export default mongoose.model('Review', ReviewSchema);
