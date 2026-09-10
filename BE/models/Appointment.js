const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'system' // To allow guest/demo users
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
