import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
  transcript_id: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Transcript = mongoose.model('Transcript', transcriptSchema);
