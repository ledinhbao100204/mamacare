const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'system' // To allow guest/demo users
  },
  name: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  taken: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medication', MedicationSchema);
