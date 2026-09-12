const mongoose = require('mongoose');

const ModerationSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['post', 'chat', 'comment', 'reported_post', 'sos_chat'],
    default: 'post'
  },
  content: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  flaggedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'urgent_sos'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Moderation', ModerationSchema);
