const mongoose = require('mongoose');

const PartnerSyncSchema = new mongoose.Schema({
  partnerCode: {
    type: String,
    required: true,
    unique: true
  },
  momName: {
    type: String,
    default: 'Mẹ Bầu'
  },
  pregnancyWeek: {
    type: Number,
    default: 24
  },
  currentMood: {
    type: String,
    default: 'Nắng Ấm'
  },
  weather: {
    type: String,
    default: 'sunny' // sunny, cloudy, rainy, storm
  },
  actionTip: {
    type: String,
    default: 'Mẹ hôm nay rất vui và tràn đầy năng lượng! Hãy cùng vợ đi dạo công viên và chuẩn bị một bữa tối ấm cúng nhé!'
  },
  lastCheckIn: {
    type: String,
    default: 'Vừa xong'
  },
  actionsTaken: [{
    actionId: String,
    label: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PartnerSync', PartnerSyncSchema);
