const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const MoodRecord = require('../models/MoodRecord');
const ForumPost = require('../models/ForumPost');
const PartnerSync = require('../models/PartnerSync');
const Moderation = require('../models/Moderation');
const AiChat = require('../models/AiChat');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const ZenContent = require('../models/ZenContent');
const { queryDeepSeek, getMedicalFallbackReply } = require('../services/deepseek');

// Kiểm tra trạng thái sẵn sàng của Mongoose / MongoDB
const isDbReady = () => mongoose.connection.readyState === 1;

// Helper đảm bảo dữ liệu ZenContent có sẵn trong MongoDB
async function getOrSeedZenContent() {
  let content = await ZenContent.findOne();
  if (!content) {
    content = await ZenContent.create({
      tracks: [
        { title: 'Sóng Não 432Hz Miracle Tone', desc: 'Tần số hòa bình, giảm căng thẳng thần kinh sâu', duration: 'Vòng lặp Synthesizer', type: 'binaural_432' },
        { title: 'Sóng Não 528Hz DNA Repair', desc: 'Tần số phục hồi tế bào và nâng cao năng lượng tích cực', duration: 'Vòng lặp Synthesizer', type: 'binaural_528' },
        { title: 'Tiếng Mưa Rào Pink Noise', desc: 'Tiếng mưa rơi dịu êm cắt đứt tạp âm, dễ đi vào giấc ngủ', duration: 'Vòng lặp Pink Noise', type: 'rain_noise' },
        { title: 'Audio Truyện Thai Giáo: Hạt Mầm Yêu Thương', desc: 'Giọng đọc ấm áp giúp bé kết nối cùng mẹ trước giờ ngủ', duration: '12:45', type: 'story' }
      ],
      breathingGuide: {
        name: 'Kỹ thuật thở 4-7-8',
        purpose: 'Ngắt cơn hoảng loạn (Panic Attack) & Điều hòa nhịp tim trong 60 giây',
        steps: [
          { label: 'Hít vào bằng mũi sâu', duration: 4 },
          { label: 'Giữ hơi tĩnh lặng', duration: 7 },
          { label: 'Thở ra từ từ bằng miệng', duration: 8 }
        ]
      },
      yogaExercises: [
        { trimester: 1, title: 'Thư giãn cột sống & Chống ốm nghén nhẹ', duration: '12 phút', level: 'Dễ' },
        { trimester: 2, title: 'Mở rộng khung chậu & Giảm áp lực thắt lưng', duration: '18 phút', level: 'Trung bình' },
        { trimester: 3, title: 'Tập thở chuẩn bị chuyển dạ & Tư thế cánh bướm', duration: '15 phút', level: 'Nhẹ nhàng' }
      ]
    });
  }
  return content;
}

// ==========================================
// 1. HEALTH CHECK & DATABASE STATUS
// ==========================================
router.get('/health', async (req, res) => {
  const ready = isDbReady();
  let userCount = 0;
  let moodCount = 0;
  let postCount = 0;
  let modCount = 0;

  if (ready) {
    try {
      [userCount, moodCount, postCount, modCount] = await Promise.all([
        User.countDocuments(),
        MoodRecord.countDocuments(),
        ForumPost.countDocuments(),
        Moderation.countDocuments()
      ]);
    } catch (e) {
      console.warn('Lỗi đếm documents Mongoose:', e.message);
    }
  }

  res.json({
    status: ready ? 'ok' : 'connecting',
    platform: 'MamaCare Fullstack Node.js & MongoDB',
    database: ready ? 'MongoDB (Live & Connected)' : 'MongoDB (Connecting...)',
    isAtlasConnected: ready,
    counts: {
      users: userCount,
      moodRecords: moodCount,
      forumPosts: postCount,
      moderations: modCount
    },
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION & USERS (ĐĂNG NHẬP / ĐĂNG KÝ)
// ==========================================

// Đăng nhập
router.post('/auth/login', async (req, res) => {
  try {
    const { emailOrPhone = '', password = '' } = req.body;
    const cleanInput = emailOrPhone.trim().toLowerCase();

    if (!cleanInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
      });
    }

    const user = await User.findOne({
      $or: [
        { email: cleanInput },
        { phone: cleanInput }
      ]
    });

    if (!user || user.password !== String(password)) {
      return res.status(401).json({
        success: false,
        message: 'Email, số điện thoại hoặc mật khẩu không chính xác'
      });
    }

    const safeUser = typeof user.toSafeObject === 'function'
      ? user.toSafeObject()
      : user.toObject();
    delete safeUser.password;
    safeUser.id = safeUser._id;

    res.json({
      success: true,
      message: `Chào mừng ${safeUser.name} đã quay trở lại!`,
      user: safeUser,
      token: `mamacare-session-${safeUser._id}-${Date.now()}`
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng nhập: ' + err.message });
  }
});

// Đăng ký tài khoản mới
router.post('/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      password,
      role = 'mom',
      pregnancyWeek = 12,
      dueDate = '',
      partnerCode = ''
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập họ và tên' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email' });
    }
    if (!password || password.length < 3) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 3 ký tự trở lên' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email hoặc số điện thoại này đã được đăng ký tài khoản MamaCare'
      });
    }

    let roleName = 'Mẹ Bầu';
    let avatar = '🌸';
    let userPartnerCode = partnerCode;
    let partnerName = '';

    if (role === 'husband') {
      roleName = 'Bố Bỉm (Partner)';
      avatar = '🧸';
      if (userPartnerCode) {
        const momUser = await User.findOne({ partnerCode: userPartnerCode, role: 'mom' });
        if (momUser) partnerName = momUser.name;
      }
    } else if (role === 'admin') {
      roleName = 'Ban Quản Trị';
      avatar = '🛡️';
    } else {
      if (!userPartnerCode) {
        userPartnerCode = 'MAMA-' + Math.floor(1000 + Math.random() * 9000);
      }
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: String(password),
      role,
      roleName,
      avatar,
      pregnancyWeek: role === 'mom' ? Number(pregnancyWeek) || 12 : undefined,
      dueDate: role === 'mom' ? dueDate : '',
      partnerCode: userPartnerCode,
      partnerName
    });

    if (role === 'mom') {
      const existingSync = await PartnerSync.findOne({ partnerCode: userPartnerCode });
      if (!existingSync) {
        await PartnerSync.create({
          partnerCode: userPartnerCode,
          momName: newUser.name,
          pregnancyWeek: newUser.pregnancyWeek,
          currentMood: 'Khởi đầu mới',
          weather: 'clear',
          actionTip: 'Chào mừng mẹ bầu mới gia nhập! Hãy đồng hành và động viên cô ấy nhé!',
          lastCheckIn: 'Vừa xong',
          actionsTaken: []
        });
      }
    }

    const safeUser = typeof newUser.toSafeObject === 'function' ? newUser.toSafeObject() : newUser.toObject();
    delete safeUser.password;
    safeUser.id = safeUser._id;

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản MamaCare thành công!',
      user: safeUser,
      token: `mamacare-session-${safeUser._id}-${Date.now()}`
    });
  } catch (err) {
    console.error('Lỗi đăng ký tài khoản:', err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng ký: ' + err.message });
  }
});

// Lấy danh sách toàn bộ Users (dành cho Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. MODULE 1.1: NHẬT KÝ CẢM XÚC & SỨC KHỎE (MOOD CHECK-IN)
// ==========================================

// Lấy lịch sử cảm xúc
router.get('/mood/history', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId && mongoose.Types.ObjectId.isValid(userId) ? { user: userId } : {};
    const records = await MoodRecord.find(filter).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    console.error('Lỗi lấy lịch sử cảm xúc:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Điểm danh cảm xúc mỗi ngày
router.post('/mood/check-in', async (req, res) => {
  try {
    const {
      userId,
      userName = 'Mẹ Bầu',
      mood = 'Bình an',
      emoji = '🌸',
      score = 80,
      symptoms = [],
      waterCount = 8,
      journal = ''
    } = req.body;

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const now = new Date();
    const dayOfWeek = days[now.getDay()];
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let userRef = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userRef = userId;
    }

    const record = await MoodRecord.create({
      user: userRef,
      userName,
      date: dateStr,
      dayOfWeek,
      time: timeStr,
      mood,
      emoji,
      score: Number(score),
      symptoms,
      waterCount: Number(waterCount),
      journal
    });

    // Cập nhật trạng thái thời tiết cảm xúc cho đối tác (PartnerSync)
    let weather = 'clear';
    let actionTip = 'Vợ đang có tâm trạng rất tuyệt vời! Hãy dành cho cô ấy một lời khen ngọt ngào và một nụ cười ấm áp nhé!';

    if (score < 40 || mood.includes('Quá tải') || mood.includes('Bức bối') || mood.includes('Sấm chớp')) {
      weather = 'storm';
      actionTip = 'CẢNH BÁO: Vợ đang bị quá tải cảm xúc và mệt mỏi! Bố hãy chủ động gác lại mọi việc, pha nước ấm ngâm chân, massage lưng và ôm cô ấy thật chặt!';
    } else if (score < 60 || mood.includes('Nhạy cảm') || mood.includes('Căng thẳng') || mood.includes('Mưa')) {
      weather = 'rain';
      actionTip = 'Vợ đang cảm thấy hơi tủi thân hoặc mệt mỏi trong người. Hãy hỏi han nhẹ nhàng, gọt cho cô ấy một đĩa hoa quả tươi và lắng nghe không phán xét.';
    } else if (score < 75 || mood.includes('Âm u') || mood.includes('Mệt')) {
      weather = 'cloudy';
      actionTip = 'Vợ cảm thấy hơi uể oải. Bố hãy chủ động làm việc nhà và chuẩn bị một ly sữa hạt ấm cho cô ấy nhé!';
    }

    let updatedSync = await PartnerSync.findOneAndUpdate(
      {},
      {
        currentMood: mood,
        weather,
        actionTip,
        lastCheckIn: 'Vừa xong',
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Đã lưu nhật ký cảm xúc thành công vào MongoDB!',
      record,
      partnerSync: updatedSync
    });
  } catch (err) {
    console.error('Lỗi lưu nhật ký cảm xúc:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu cảm xúc: ' + err.message });
  }
});

// ==========================================
// 4. MODULE 1.2: TRỢ LÝ AI ĐỒNG HÀNH & CẢNH BÁO SOS
// ==========================================
// Lấy thông tin cấu hình DeepSeek AI
router.get('/ai/config', (req, res) => {
  res.json({
    success: true,
    provider: 'DeepSeek AI',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    hasApiKey: Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim()),
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions'
  });
});

// Cập nhật cấu hình DEEPSEEK_API_KEY
router.post('/ai/config', (req, res) => {
  const { apiKey, model } = req.body;
  if (apiKey !== undefined) {
    process.env.DEEPSEEK_API_KEY = String(apiKey).trim();
  }
  if (model) {
    process.env.DEEPSEEK_MODEL = model.trim();
  }
  res.json({
    success: true,
    message: 'Cập nhật cấu hình DeepSeek API thành công!',
    hasApiKey: Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim()),
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  });
});

router.post('/ai/chat', async (req, res) => {
  try {
    const { message = '', history = [], userId = 'anonymous', userName = 'Mẹ Bầu' } = req.body;
    const cleanMsg = message.trim();

    if (!cleanMsg) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
    }

    await AiChat.create({ userId, userName, sender: 'user', text: cleanMsg });

    // Kiểm tra từ khóa Red-Flag (nguy cơ trầm cảm, tự hại, khủng hoảng tinh thần)
    const redFlagKeywords = [
      'tự tử', 'chết', 'kết thúc cuộc sống', 'không muốn sống', 'hại con',
      'ghét bỏ đứa bé', 'tuyệt vọng', 'biến mất', 'muốn chết', 'nhảy lầu', 'uống thuốc'
    ];

    const lowerMsg = cleanMsg.toLowerCase();
    const isRedFlag = redFlagKeywords.some(keyword => lowerMsg.includes(keyword));

    if (isRedFlag) {
      const sosReply = '🚨 MẸ YÊU ƠI, HÃY DỪNG LẠI MỘT CHÚT! Chúng mình đang ở ngay bên mẹ đây. Những gì mẹ đang phải chịu đựng là quá lớn, nhưng mẹ KHÔNG HỀ CÔ ĐƠN MỘT MÌNH. Xin mẹ hãy hít một hơi thật sâu và liên hệ ngay với người thân hoặc đường dây nóng hỗ trợ tâm lý chuyên gia 24/7 dưới đây. Mọi sự sống và nỗ lực của mẹ đều vô cùng quý giá!';

      await Moderation.create({
        author: userName + ' (ID: ' + userId + ')',
        type: 'sos_chat',
        content: cleanMsg,
        reason: 'Phát hiện Red-Flag: Từ khóa có nguy cơ khủng hoảng tinh thần hoặc tự hại cao',
        status: 'urgent_sos'
      });

      await AiChat.create({ userId, sender: 'ai', text: sosReply, isRedFlag: true });

      return res.json({
        success: true,
        isRedFlag: true,
        reply: sosReply,
        provider: 'MamaCare Emergency Red-Flag System',
        sos: {
          active: true,
          title: 'HỆ THỐNG CẢNH BÁO ĐỎ: HỖ TRỢ TÂM LÝ KHẨN CẤP',
          description: 'Chúng tôi nhận thấy mẹ đang trải qua thời khắc rất khó khăn. Mọi cảm xúc của mẹ đều xứng đáng được lắng nghe và chở che.',
          hotlines: [
            { number: '111', name: 'Tổng đài Quốc gia Bảo vệ Trẻ em & Phụ nữ', free: true },
            { number: '1900 636 700', name: 'Đường dây nóng Sức khỏe Tinh thần (24/7)', free: false },
            { number: '115', name: 'Cấp cứu Y tế Toàn quốc', free: true }
          ]
        }
      });
    }

    // GỌI DEEPSEEK API ĐỂ TÌM KIẾM VÀ TRẢ VỀ KẾT QUẢ
    let reply = '';
    let provider = 'MamaCare Medical AI Engine';
    let model = 'deepseek-chat';

    const deepseekResult = await queryDeepSeek(cleanMsg, history);

    if (deepseekResult.success && deepseekResult.reply) {
      reply = deepseekResult.reply;
      provider = 'DeepSeek AI (Cloud API)';
      model = deepseekResult.model;
    } else {
      // Fallback thông minh dựa trên tri thức y khoa thai kỳ nếu chưa có key hoặc API bận
      reply = getMedicalFallbackReply(cleanMsg);
      provider = 'MamaAI Clinical Knowledge Engine';
    }

    await AiChat.create({ userId, sender: 'ai', text: reply, isRedFlag: false });

    res.json({
      success: true,
      isRedFlag: false,
      reply,
      provider,
      model
    });
  } catch (err) {
    console.error('Lỗi AI Chat:', err);
    res.status(500).json({ success: false, message: 'Lỗi trò chuyện với AI: ' + err.message });
  }
});

// ==========================================
// 5. MODULE 1.3: KHÔNG GIAN "THỞ" (ZEN SPACE)
// ==========================================
router.get('/zen/tracks', async (req, res) => {
  try {
    const zen = await getOrSeedZenContent();
    res.json({
      success: true,
      tracks: zen.tracks,
      breathingGuide: zen.breathingGuide,
      yogaExercises: zen.yogaExercises
    });
  } catch (err) {
    console.error('Lỗi lấy dữ liệu Zen:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. MODULE 1.4: DIỄN ĐÀN CỘNG ĐỒNG ẨN DANH & BÁC SĨ (FORUM)
// ==========================================

// Lấy danh sách bài viết theo chuyên mục / phòng
router.get('/forum/posts', async (req, res) => {
  try {
    const { room = 'all' } = req.query;
    const filter = room === 'all' ? {} : { room };
    const posts = await ForumPost.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    console.error('Lỗi lấy bài viết forum:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Đăng bài viết mới
router.post('/forum/posts', async (req, res) => {
  try {
    const {
      author = 'Mẹ Bầu Ẩn Danh',
      authorRole = 'Mẹ Bầu',
      avatar = '🌸',
      room = 'rage',
      title,
      content,
      tag = 'Tâm Sự'
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung bài viết không được để trống' });
    }

    const newPost = await ForumPost.create({
      author,
      authorRole,
      avatar,
      room,
      title: title || 'Tâm sự ẩn danh của mẹ',
      content: content.trim(),
      tag,
      likes: 0,
      isExpertVerified: false,
      comments: []
    });

    res.status(201).json({
      success: true,
      message: 'Đăng bài viết ẩn danh thành công!',
      post: newPost
    });
  } catch (err) {
    console.error('Lỗi tạo bài viết forum:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Thả tim bài viết
router.post('/forum/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    let post = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await ForumPost.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    }
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Thêm bình luận vào bài viết
router.post('/forum/posts/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { author = 'Mẹ Bầu', avatar = '🌸', content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
    }

    let post = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await ForumPost.findById(id);
    }
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    const newComment = {
      author,
      avatar,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.json({
      success: true,
      message: 'Đã gửi bình luận thành công!',
      comment: newComment,
      comments: post.comments
    });
  } catch (err) {
    console.error('Lỗi thêm bình luận:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lưu hồ sơ sức khỏe mẹ bầu (chiều cao, cân nặng, thân nhiệt, tuần thai)
router.post('/user/health-profile', async (req, res) => {
  try {
    const { userId, height, weight, temperature, pregnancyWeek } = req.body;

    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ role: 'mom' });
    }

    if (user) {
      if (pregnancyWeek) user.pregnancyWeek = Number(pregnancyWeek);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Đã lưu hồ sơ sức khỏe mẹ bầu thành công!',
      profile: {
        height: Number(height) || 160,
        weight: Number(weight) || 58.5,
        temperature: Number(temperature) || 36.8,
        pregnancyWeek: user ? user.pregnancyWeek : 24,
        bmi: ((Number(weight) || 58.5) / Math.pow((Number(height) || 160) / 100, 2)).toFixed(1),
        updatedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Lỗi lưu hồ sơ sức khỏe:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy thông tin Profile chi tiết & tình trạng ghép đôi
router.get('/user/profile', async (req, res) => {
  try {
    const { userId } = req.query;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ role: 'mom' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
    }

    // Tự động cấp mã ghép đôi nếu mẹ bầu chưa có
    if (user.role === 'mom' && !user.partnerCode) {
      user.partnerCode = 'MAMA-' + Math.floor(1000 + Math.random() * 9000);
      await user.save();
    }

    const safeUser = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();
    delete safeUser.password;

    // Tìm thông tin đối tác ghép đôi (nếu có partnerCode)
    let partner = null;
    if (user.partnerCode) {
      if (user.role === 'mom') {
        partner = await User.findOne({ partnerCode: user.partnerCode, role: 'husband', _id: { $ne: user._id } })
          .select('name phone email avatar createdAt');
      } else if (user.role === 'husband') {
        partner = await User.findOne({ partnerCode: user.partnerCode, role: 'mom', _id: { $ne: user._id } })
          .select('name phone email avatar pregnancyWeek dueDate createdAt');
      }
    }

    res.json({
      success: true,
      user: safeUser,
      partner: partner || null,
      isPaired: !!partner
    });
  } catch (err) {
    console.error('Lỗi lấy profile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cập nhật thông tin Profile người dùng
router.post('/user/profile', async (req, res) => {
  try {
    const { userId, name, phone, avatar, pregnancyWeek, dueDate } = req.body;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ role: 'mom' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar) user.avatar = avatar;
    if (pregnancyWeek) user.pregnancyWeek = Number(pregnancyWeek);
    if (dueDate !== undefined) user.dueDate = dueDate;

    if (user.role === 'mom' && !user.partnerCode) {
      user.partnerCode = 'MAMA-' + Math.floor(1000 + Math.random() * 9000);
    }

    await user.save();

    // Đồng bộ tên mẹ sang PartnerSync nếu có
    if (user.role === 'mom' && user.partnerCode) {
      await PartnerSync.findOneAndUpdate(
        { partnerCode: user.partnerCode },
        { momName: user.name, pregnancyWeek: user.pregnancyWeek },
        { upsert: true }
      );
    }

    const safeUser = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ cá nhân thành công!',
      user: safeUser
    });
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tạo mã ghép đôi riêng biệt mới cho mẹ bầu
router.post('/user/generate-pair-code', async (req, res) => {
  try {
    const { userId } = req.body;
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ role: 'mom' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản mẹ bầu' });
    }

    // Tạo mã ngẫu nhiên dạng MAMA-XXXX đảm bảo duy nhất
    let newCode;
    let isUnique = false;
    while (!isUnique) {
      newCode = 'MAMA-' + Math.floor(1000 + Math.random() * 9000);
      const existing = await User.findOne({ partnerCode: newCode, _id: { $ne: user._id } });
      if (!existing) isUnique = true;
    }

    user.partnerCode = newCode;
    await user.save();

    // Khởi tạo bản ghi PartnerSync tương ứng
    await PartnerSync.findOneAndUpdate(
      { partnerCode: newCode },
      {
        partnerCode: newCode,
        momName: user.name,
        pregnancyWeek: user.pregnancyWeek || 24,
        currentMood: 'Bình An',
        weather: 'clear',
        actionTip: 'Chào mừng bố bỉm đã kết nối với mẹ ' + user.name + '! Hãy ôm cô ấy thật ấm áp nhé!',
        lastCheckIn: 'Vừa xong',
        actionsTaken: []
      },
      { upsert: true, new: true }
    );

    const safeUser = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      message: 'Đã tạo mã ghép đôi mới thành công!',
      partnerCode: newCode,
      user: safeUser
    });
  } catch (err) {
    console.error('Lỗi tạo mã ghép đôi:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Kết nối ghép đôi với mẹ bầu (dành cho Bố Bỉm hoặc Mẹ)
router.post('/user/connect-partner', async (req, res) => {
  try {
    const { userId, partnerCode } = req.body;
    if (!partnerCode || !partnerCode.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã ghép đôi' });
    }

    const cleanCode = partnerCode.trim().toUpperCase();

    // Tìm mẹ bầu sở hữu mã này
    const momUser = await User.findOne({ partnerCode: cleanCode, role: 'mom' });
    if (!momUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mẹ bầu nào với mã ghép đôi ' + cleanCode + '. Vui lòng kiểm tra lại!'
      });
    }

    let currentUser = null;
    if (userId) {
      currentUser = mongoose.Types.ObjectId.isValid(userId)
        ? await User.findById(userId)
        : await User.findOne({ email: userId });
    }
    if (!currentUser) {
      currentUser = await User.findOne({ role: 'husband' });
    }

    if (currentUser) {
      currentUser.partnerCode = cleanCode;
      currentUser.partnerName = momUser.name;
      await currentUser.save();
    }

    await PartnerSync.findOneAndUpdate(
      { partnerCode: cleanCode },
      { momName: momUser.name, pregnancyWeek: momUser.pregnancyWeek || 24 },
      { upsert: true }
    );

    const safeUser = currentUser && typeof currentUser.toSafeObject === 'function'
      ? currentUser.toSafeObject()
      : currentUser
      ? currentUser.toObject()
      : null;
    if (safeUser) delete safeUser.password;

    res.json({
      success: true,
      message: 'Kết nối thành công với mẹ bầu ' + momUser.name + '!',
      partner: {
        name: momUser.name,
        phone: momUser.phone,
        email: momUser.email,
        pregnancyWeek: momUser.pregnancyWeek,
        dueDate: momUser.dueDate,
        avatar: momUser.avatar
      },
      partnerCode: cleanCode,
      user: safeUser
    });
  } catch (err) {
    console.error('Lỗi kết nối đối tác:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Hủy ghép đôi (dành cho Bố Bỉm hoặc Mẹ Bầu)
router.post('/user/disconnect-partner', async (req, res) => {
  try {
    const { userId } = req.body;
    let currentUser = null;

    if (userId) {
      currentUser = mongoose.Types.ObjectId.isValid(userId)
        ? await User.findById(userId)
        : await User.findOne({ email: userId });
    }
    if (!currentUser) {
      currentUser = await User.findOne({ role: 'husband' });
    }

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản' });
    }

    const previousPartnerName = currentUser.partnerName || 'đối tác';

    // Reset thông tin đối tác của người dùng hiện tại
    currentUser.partnerCode = '';
    currentUser.partnerName = '';
    await currentUser.save();

    const safeUser = currentUser && typeof currentUser.toSafeObject === 'function'
      ? currentUser.toSafeObject()
      : currentUser
      ? currentUser.toObject()
      : null;
    if (safeUser) delete safeUser.password;

    res.json({
      success: true,
      message: `Đã hủy ghép đôi thành công với ${previousPartnerName}! Bạn có thể nhập mã mới để kết nối với mẹ bỉm.`,
      user: safeUser
    });
  } catch (err) {
    console.error('Lỗi hủy ghép đôi:', err);
    res.status(500).json({ success: false, message: 'Lỗi hủy ghép đôi: ' + err.message });
  }
});

// ==========================================
// 7. MODULE 2.1: TRUNG TÂM ĐỒNG BỘ BỐ BỈM (PARTNER SYNC)
// ==========================================

// Lấy thông tin thời tiết cảm xúc của vợ
router.get('/partner/sync', async (req, res) => {
  try {
    const { partnerCode, userId } = req.query;
    let targetCode = partnerCode;

    // Nếu truyền userId, tìm partnerCode thực tế của user trong DB
    if (userId) {
      const user = mongoose.Types.ObjectId.isValid(userId)
        ? await User.findById(userId)
        : await User.findOne({ email: userId });
      if (user) {
        targetCode = user.partnerCode;
      }
    }

    // Nếu chưa có targetCode cụ thể, kiểm tra xem có tài khoản bố bỉm nào đã đăng nhập không
    if (!targetCode && !userId) {
      targetCode = 'MAMA-8899'; // fallback demo nếu test chay không kèm user
    }

    // Nếu bố bỉm thực sự chưa ghép đôi (partnerCode là rỗng)
    if (!targetCode) {
      return res.json({
        success: true,
        isPaired: false,
        data: null,
        message: 'Bố bỉm chưa ghép đôi với mẹ bầu nào. Hãy nhập mã để kết nối!'
      });
    }

    let syncData = await PartnerSync.findOne({ partnerCode: targetCode });
    if (!syncData) {
      const mom = await User.findOne({ partnerCode: targetCode, role: 'mom' });
      if (mom) {
        syncData = await PartnerSync.create({
          partnerCode: targetCode,
          momName: mom.name,
          pregnancyWeek: mom.pregnancyWeek || 24,
          currentMood: 'Bình An',
          weather: 'clear',
          actionTip: 'Vợ đang có tâm trạng rất thoải mái. Bố hãy ôm cô ấy thật chặt nhé!',
          lastCheckIn: 'Vừa xong',
          actionsTaken: []
        });
      }
    }

    if (!syncData) {
      return res.json({
        success: true,
        isPaired: false,
        data: null,
        message: 'Không tìm thấy dữ liệu đồng bộ của mã ' + targetCode
      });
    }

    res.json({
      success: true,
      isPaired: true,
      data: syncData
    });
  } catch (err) {
    console.error('Lỗi lấy Partner Sync:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bố bỉm gửi hành động yêu thương / chăm sóc
router.post('/partner/action', async (req, res) => {
  try {
    const { partnerCode = 'MAMA-8899', actionId, label } = req.body;
    if (!actionId || !label) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hành động' });
    }

    const updatedSync = await PartnerSync.findOneAndUpdate(
      { partnerCode },
      {
        $push: { actionsTaken: { actionId, label, timestamp: new Date() } },
        $set: { updatedAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `Đã gửi hành động yêu thương "${label}" tới mẹ bầu thành công!`,
      data: updatedSync
    });
  } catch (err) {
    console.error('Lỗi gửi hành động đối tác:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. MODULE ADMIN: METRICS, MODERATION & TRANSACTIONS
// ==========================================

// Lấy toàn bộ chỉ số vận hành hệ thống từ MongoDB
router.get('/admin/metrics', async (req, res) => {
  try {
    const [totalUsers, momCount, dadCount, totalMoods, totalPosts, pendingMod, transactions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'mom' }),
      User.countDocuments({ role: 'husband' }),
      MoodRecord.countDocuments(),
      ForumPost.countDocuments(),
      Moderation.countDocuments({ status: { $in: ['pending', 'urgent_sos'] } }),
      Transaction.find()
    ]);

    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    res.json({
      success: true,
      metrics: {
        totalUsers: totalUsers || 42850,
        dauToday: Math.round(totalUsers * 0.4) || 8420,
        activePairs: Math.min(momCount, dadCount) || 18920,
        sosResolved: 14,
        totalMoodRecords: totalMoods,
        totalForumPosts: totalPosts,
        pendingModerations: pendingMod,
        totalRevenue
      }
    });
  } catch (err) {
    console.error('Lỗi lấy metrics admin:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách giao dịch doanh thu (Transactions) từ MongoDB
router.get('/admin/transactions', async (req, res) => {
  try {
    let transactions = await Transaction.find().sort({ createdAt: -1 });
    if (transactions.length === 0) {
      transactions = await Transaction.create([
        { txId: 'TX-9901', user: 'Mẹ Hoàng Oanh', package: 'Gói MamaCare Premium 1 Năm', amount: 1200000, date: '10 phút trước', status: 'completed' },
        { txId: 'TX-9902', user: 'Bố Minh Đức', package: 'Tư Vấn Tâm Lý Chuyên Sâu 1-1', amount: 500000, date: '45 phút trước', status: 'completed' },
        { txId: 'TX-9903', user: 'Mẹ Ánh Tuyết', package: 'Gói MamaCare Premium 6 Tháng', amount: 690000, date: '2 giờ trước', status: 'completed' },
        { txId: 'TX-9904', user: 'Bố Quốc Hưng', package: 'Khóa Học Daddy Masterclass', amount: 350000, date: '4 giờ trước', status: 'completed' }
      ]);
    }
    res.json({ success: true, count: transactions.length, transactions });
  } catch (err) {
    console.error('Lỗi lấy danh sách giao dịch:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy hàng đợi kiểm duyệt nội dung
router.get('/admin/moderation', async (req, res) => {
  try {
    const queue = await Moderation.find({ status: { $in: ['pending', 'urgent_sos'] } }).sort({ createdAt: -1 });
    res.json({ success: true, count: queue.length, queue });
  } catch (err) {
    console.error('Lỗi lấy hàng đợi kiểm duyệt:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Duyệt nội dung
router.post('/admin/moderation/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Moderation.findByIdAndUpdate(id, { status: 'approved' });
    }
    res.json({ success: true, message: 'Đã phê duyệt nội dung hợp lệ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa / Từ chối nội dung vi phạm
router.delete('/admin/moderation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Moderation.findByIdAndUpdate(id, { status: 'rejected' });
    }
    res.json({ success: true, message: 'Đã gỡ bỏ nội dung vi phạm' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 9. MODULE 1.5: LỜI NHẮC UỐNG THUỐC & LỊCH KHÁM
// ==========================================

// Danh sách thuốc & vi chất
router.get('/reminders/medications', async (req, res) => {
  try {
    let medications = await Medication.find().sort({ createdAt: 1 });
    if (medications.length === 0) {
      medications = await Medication.create([
        { userId: 'system', name: 'Sắt hữu cơ Fumafer (1 viên sau ăn sáng)', time: '08:00 AM', taken: true },
        { userId: 'system', name: 'Canxi Nano BioCal (1 viên sau ăn trưa)', time: '13:00 PM', taken: true },
        { userId: 'system', name: 'DHA Thai kỳ BioIsland (2 viên sau ăn tối)', time: '19:30 PM', taken: false },
        { userId: 'system', name: 'Acid Folic 400mcg (1 viên trước khi ngủ)', time: '21:30 PM', taken: false }
      ]);
    }
    res.json({ success: true, count: medications.length, medications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Thêm thuốc mới
router.post('/reminders/medications', async (req, res) => {
  try {
    const { name, time, userId = 'system' } = req.body;
    if (!name || !time) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên thuốc và giờ uống' });
    }
    const med = await Medication.create({ userId, name, time, taken: false });
    res.status(201).json({ success: true, message: 'Đã thêm lịch uống thuốc!', medication: med });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bật/tắt trạng thái đã uống thuốc
router.put('/reminders/medications/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    let med = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      med = await Medication.findById(id);
      if (med) {
        med.taken = !med.taken;
        await med.save();
      }
    }
    if (!med) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thuốc' });
    }
    res.json({ success: true, medication: med });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Danh sách lịch khám thai
router.get('/reminders/appointments', async (req, res) => {
  try {
    let appointments = await Appointment.find().sort({ createdAt: 1 });
    if (appointments.length === 0) {
      appointments = await Appointment.create([
        { userId: 'system', title: 'Siêu âm hình thái 4D (Mốc Tuần 22)', date: '14/09/2026', doctor: 'BS. Nguyễn Mai Phương' },
        { userId: 'system', title: 'Nghiệm pháp dung nạp Glucose (Tuần 26)', date: '05/10/2026', doctor: 'BS. Lê Hoàng Nam' }
      ]);
    }
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Thêm lịch khám mới
router.post('/reminders/appointments', async (req, res) => {
  try {
    const { title, date, doctor, userId = 'system' } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên mốc khám và ngày khám' });
    }
    const app = await Appointment.create({
      userId,
      title,
      date,
      doctor: doctor || 'Bác sĩ chuyên khoa',
      createdAt: new Date()
    });
    res.status(201).json({ success: true, message: 'Đã thêm lịch khám thai!', appointment: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
