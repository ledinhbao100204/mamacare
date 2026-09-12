const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  package: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'refunded'],
    default: 'completed'
  },
  date: {
    type: String,
    default: 'Vừa xong'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
