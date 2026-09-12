const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  duration: { type: String, required: true },
  type: { type: String, required: true }
});

const breathingGuideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  purpose: { type: String, required: true },
  steps: [{
    label: { type: String, required: true },
    duration: { type: Number, required: true }
  }]
});

const yogaExerciseSchema = new mongoose.Schema({
  trimester: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true }
});

const zenContentSchema = new mongoose.Schema({
  tracks: [trackSchema],
  breathingGuide: breathingGuideSchema,
  yogaExercises: [yogaExerciseSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ZenContent', zenContentSchema);
