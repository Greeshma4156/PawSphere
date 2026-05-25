import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    rescueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueCase',
      required: true,
      index: true,
    },
    senderId: {
      type: String, // String to handle both MongoDB ObjectIds or fallback strings
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['citizen', 'volunteer', 'shelter', 'admin'],
      default: 'citizen',
    },
    senderName: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String, // URLs to uploaded images
      },
    ],
    readBy: [
      {
        type: String, // Array of user IDs who have read this message
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
