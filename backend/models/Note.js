import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 200,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically manages createdAt and updatedAt
});

// Index for faster queries by user
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);