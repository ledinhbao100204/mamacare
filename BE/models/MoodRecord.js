const mongoose = require('mongoose');

const MoodRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    default: 'Mẹ Bầu'
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: '12:00'
  },
  dayOfWeek: {
    type: String,
    default: 'T4'
  },
  mood: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '😊'
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  symptoms: [{
    type: String
  }],
  waterCount: {
    type: Number,
    default: 6
  },
  journal: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MoodRecord', MoodRecordSchema);
