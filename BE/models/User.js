const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['mom', 'husband', 'admin'],
    default: 'mom'
  },
  roleName: {
    type: String,
    default: 'Mẹ Bầu'
  },
  avatar: {
    type: String,
    default: '🌸'
  },
  pregnancyWeek: {
    type: Number,
    default: 12
  },
  dueDate: {
    type: String,
    default: ''
  },
  partnerCode: {
    type: String,
    default: ''
  },
  partnerName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual method để trả về thông tin an toàn (bỏ mật khẩu)
UserSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
