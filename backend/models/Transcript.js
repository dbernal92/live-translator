import mongoose from 'mongoose';

// Schema for individual words
const wordSchema = new mongoose.Schema({
  text: String,
  start: Number,
  end: Number,
  confidence: Number,
  speaker: String
}, { _id: false });

const transcriptSchema = new mongoose.Schema({
  transcript_id: {
    type: String,
    required: true,
    unique: true
  },
  text: String,
  confidence: Number,
  words: [wordSchema], // Array of word data stored here
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Transcript = mongoose.model('Transcript', transcriptSchema);
