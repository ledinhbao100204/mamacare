const mongoose = require('mongoose');

const AiChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'guest'
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isRedFlag: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AiChat', AiChatSchema);
