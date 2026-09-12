const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Nạp thông tin cấu hình từ atlas-credentials.env và .env
const atlasEnvPath = path.join(__dirname, '../atlas-credentials.env');
if (fs.existsSync(atlasEnvPath)) {
  dotenv.config({ path: atlasEnvPath, override: true });
}
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

async function seedInitialData() {
  try {
    const User = require('../models/User');
    const MoodRecord = require('../models/MoodRecord');
    const ForumPost = require('../models/ForumPost');
    const PartnerSync = require('../models/PartnerSync');
    const Moderation = require('../models/Moderation');
    const ZenContent = require('../models/ZenContent');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Khởi tạo dữ liệu mẫu ban đầu vào MongoDB Atlas...');

      // Seed Users
      const mom = await User.create({
        name: 'Nguyễn Thùy Trang',
        email: 'mebau@mamacare.vn',
        phone: '0988112233',
        password: 'password123',
        role: 'mom',
        roleName: 'Mẹ Bầu',
        avatar: '🌸',
        pregnancyWeek: 24,
        dueDate: '2026-12-25',
        partnerCode: 'MAMA-8899'
      });

      await User.create({
        name: 'Trần Minh Đức',
        email: 'bobim@mamacare.vn',
        phone: '0977223344',
        password: 'password123',
        role: 'husband',
        roleName: 'Bố Bỉm (Partner)',
        avatar: '🧸',
        pregnancyWeek: 12,
        partnerCode: 'MAMA-8899',
        partnerName: 'Nguyễn Thùy Trang'
      });

      await User.create({
        name: 'Ban Quản Trị MamaCare',
        email: 'admin@mamacare.vn',
        phone: '0911000999',
        password: 'adminpassword123',
        role: 'admin',
        roleName: 'Ban Quản Trị',
        avatar: '🛡️'
      });

      // Seed Mood Records
      await MoodRecord.create([
        { user: mom._id, userName: mom.name, date: '2026-09-04', dayOfWeek: 'T6', time: '14:30', mood: 'Thư thái', emoji: '🌿', score: 85, symptoms: ['Hơi khát nước'], waterCount: 1750, weight: 58.5, temperature: 36.6, journal: 'Đi dạo buổi chiều ở công viên cùng chồng.' },
        { user: mom._id, userName: mom.name, date: '2026-09-05', dayOfWeek: 'T7', time: '20:15', mood: 'Bình an', emoji: '🌸', score: 80, symptoms: ['Mỏi chân nhẹ'], waterCount: 1500, weight: 58.6, temperature: 36.5, journal: 'Nghe nhạc sóng não thiền trước khi ngủ.' },
        { user: mom._id, userName: mom.name, date: '2026-09-06', dayOfWeek: 'CN', time: '11:00', mood: 'Nhạy cảm', emoji: '🥺', score: 65, symptoms: ['Mỏi thắt lưng', 'Buồn ngủ'], waterCount: 1250, weight: 58.7, temperature: 36.8, journal: 'Thời tiết mưa âm u khiến mẹ hơi tủi thân một chút.' },
        { user: mom._id, userName: mom.name, date: '2026-09-07', dayOfWeek: 'T2', time: '08:45', mood: 'Căng thẳng', emoji: '🌩️', score: 55, symptoms: ['Khó ngủ', 'Mỏi lưng'], waterCount: 1500, weight: 58.8, temperature: 36.7, journal: 'Công việc đầu tuần hơi dồn dập, phải hít thở sâu.' },
        { user: mom._id, userName: mom.name, date: '2026-09-08', dayOfWeek: 'T3', time: '15:20', mood: 'Hồi phục', emoji: '🌤️', score: 75, symptoms: ['Đã khỏe hơn'], waterCount: 1750, weight: 59.0, temperature: 36.5, journal: 'Chồng pha cho cốc nước ấm ngâm chân, thấy dễ chịu hẳn.' },
        { user: mom._id, userName: mom.name, date: '2026-09-09', dayOfWeek: 'T4', time: '10:00', mood: 'Yêu đời', emoji: '🥰', score: 88, symptoms: ['Khỏe khoắn'], waterCount: 1750, weight: 59.2, temperature: 36.6, journal: 'Bé con tuần 24 đã bắt đầu phản ứng với giọng nói của ba!' }
      ]);

      // Seed Partner Sync
      await PartnerSync.create({
        partnerCode: 'MAMA-8899',
        momName: 'Nguyễn Thùy Trang',
        pregnancyWeek: 24,
        currentMood: 'Sấm Chớp',
        weather: 'storm',
        actionTip: 'Vợ đang bị quá tải và mỏi thắt lưng. Hãy chủ động pha nước ấm ngâm chân và ôm cô ấy thật chặt nhé!',
        lastCheckIn: 'Vừa xong',
        actionsTaken: [
          { actionId: 'foot_massage', label: 'Massage chân cho vợ', timestamp: new Date(Date.now() - 3600000) }
        ]
      });

      // Seed Forum Posts
      await ForumPost.create([
        {
          author: 'Nguyễn Thùy Trang',
          authorRole: 'Mẹ Bầu Tuần 24',
          avatar: '🌸',
          room: '6months',
          title: 'Tam cá nguyệt thứ 2 mẹ bầu nên bổ sung vi chất gì tốt nhất?',
          content: 'Chào các mẹ, mình đang ở tuần 24, dạo này hay bị chuột rút bắp chân vào ban đêm. Mình đang uống canxi và sắt, không biết có mẹ nào có kinh nghiệm bổ sung thêm magie hay ngâm chân nước ấm không ạ?',
          tag: 'Hỏi Bác Sĩ',
          likes: 24,
          isExpertVerified: true,
          comments: [
            { author: 'BS. Bích Liên (CK Sản)', avatar: '👩‍⚕️', content: 'Chào em, chuột rút tuần 24 rất phổ biến do nhu cầu canxi và magie tăng. Em nên ngâm chân nước muối ấm 15 phút trước khi ngủ và uống canxi sau bữa ăn sáng 1 tiếng nhé.' }
          ]
        },
        {
          author: 'Mẹ Bầu Ẩn Danh #412',
          authorRole: 'Mẹ Bầu 3 Tháng Đầu',
          avatar: '🤰',
          room: '3months',
          title: 'Nghén không ăn uống được gì, có ảnh hưởng đến sự phát triển của thai nhi không?',
          content: 'Em mới mang thai 8 tuần, ngửi mùi thức ăn là nôn nao. Cả tuần nay em chỉ uống được nước cam và bánh mì khô. Em rất lo lắng con không đủ dinh dưỡng...',
          tag: 'Tâm Sự',
          likes: 42,
          isExpertVerified: true,
          comments: [
            { author: 'Mẹ Su Su', avatar: '🌸', content: 'Đừng lo em ơi, 3 tháng đầu con sống bằng hoàng thể, em ráng uống nhiều nước lọc và chia nhỏ bữa ăn ra nhé!' }
          ]
        },
        {
          author: 'BS. Bích Liên (Chuyên Khoa Sản Nhi)',
          authorRole: 'Chuyên Gia Y Khoa',
          avatar: '👩‍⚕️',
          room: 'doctor',
          title: 'Hướng dẫn nhận biết dấu hiệu trầm cảm thai kỳ và cách phòng ngừa',
          content: 'Trầm cảm thai kỳ do thay đổi hormone estrogen và progesterone là hoàn toàn có thật và không phải do mẹ yếu đuối. Hãy mở lòng chia sẻ cùng bạn đời và bác sĩ tâm lý ngay khi cảm thấy mệt mỏi kéo dài trên 2 tuần.',
          tag: 'Kiến Thức Y Khoa',
          likes: 128,
          isExpertVerified: true,
          comments: []
        }
      ]);

      // Seed Moderations
      await Moderation.create([
        {
          author: 'User#8821',
          type: 'post',
          content: 'Có ai uống thuốc giảm cân thảo dược trong lúc mang thai không cho mình xin review với?',
          reason: 'Nghi vấn quảng cáo dược phẩm / thuốc không rõ nguồn gốc cho phụ nữ mang thai',
          status: 'pending'
        },
        {
          author: 'User#3012',
          type: 'chat',
          content: 'Tôi cảm thấy vô cùng tuyệt vọng và không muốn tiếp tục nữa...',
          reason: 'Cảnh báo đỏ (Red-flag): Từ khóa nguy hiểm về sức khỏe tinh thần',
          status: 'pending'
        }
      ]);

      console.log('✅ Đã nạp dữ liệu khởi tạo chuẩn y khoa vào MongoDB Atlas thành công!');
    }
  } catch (err) {
    console.error('Lỗi khi nạp dữ liệu mẫu vào MongoDB Atlas:', err);
  }
}

let isDbConnected = false;
let cachedPromise = null;
let hasSeeded = false;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    return true;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mamacare';
  const isAtlas = uri.includes('mongodb.net') || uri.startsWith('mongodb+srv');

  cachedPromise = (async () => {
    try {
      const maskedUri = uri.replace(/:[^:@]+@/, ':****@');
      console.log(`📡 Đang kết nối tới MongoDB ${isAtlas ? 'Atlas Cloud' : 'Local'}: ${maskedUri}...`);

      await mongoose.connect(uri, {
        dbName: 'mamacare',
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });
      isDbConnected = true;
      console.log(`🍃 Kết nối MongoDB Atlas Cloud thành công (database: mamacare)!`);
      if (!hasSeeded) {
        hasSeeded = true;
        seedInitialData().catch(e => console.warn('Seed data non-critical error:', e.message));
      }
      return true;
    } catch (err) {
      console.warn(`⚠️ Không thể kết nối tới MongoDB tại ${uri}: ${err.message}`);
      cachedPromise = null;

      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        throw err;
      }

      console.log('🔄 Đang khởi tạo MongoDB Server cục bộ dự phòng (MongoMemoryServer)...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'mamacare'
          }
        });
        const memoryUri = mongod.getUri();
        console.log(`🌱 Đã kích hoạt Embedded MongoDB Instance: ${memoryUri}`);

        await mongoose.connect(memoryUri, { dbName: 'mamacare' });
        isDbConnected = true;
        console.log('🍃 Kết nối MongoDB Engine thành công!');
        if (!hasSeeded) {
          hasSeeded = true;
          await seedInitialData();
        }
        return true;
      } catch (innerErr) {
        console.error('❌ Lỗi kết nối MongoDB:', innerErr);
        return false;
      }
    }
  })();

  return cachedPromise;
}

module.exports = {
  connectDB,
  isConnected: () => isDbConnected
};
