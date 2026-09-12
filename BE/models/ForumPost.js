const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: '🌸'
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ForumPostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    default: 'Mẹ Bầu'
  },
  avatar: {
    type: String,
    default: '🌸'
  },
  room: {
    type: String,
    enum: ['all', '3months', '6months', '9months', 'postpartum', 'doctor', 'rage', 'advice', 'joy'],
    default: 'all'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'Tâm Sự'
  },
  likes: {
    type: Number,
    default: 0
  },
  isExpertVerified: {
    type: Boolean,
    default: false
  },
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
