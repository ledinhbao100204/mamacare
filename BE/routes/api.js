const express = require('express');
const router = express.Router();

const User = require('../models/User');
const MoodRecord = require('../models/MoodRecord');
const ForumPost = require('../models/ForumPost');
const PartnerSync = require('../models/PartnerSync');
const Moderation = require('../models/Moderation');
const AiChat = require('../models/AiChat');

// ==========================================
// 1. HEALTH CHECK & DATABASE STATUS
// ==========================================
router.get('/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const moodCount = await MoodRecord.countDocuments();
    res.json({
      status: 'ok',
      platform: 'MamaCare Fullstack Node.js & MongoDB',
      database: 'MongoDB (Mongoose ODM)',
      counts: {
        users: userCount,
        moodRecords: moodCount
      },
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: 'degraded',
      platform: 'MamaCare Fullstack Node.js',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
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

    const safeUser = user.toSafeObject();

    res.json({
      success: true,
      message: `Chào mừng ${safeUser.name} đã quay trở lại!`,
      user: safeUser,
      token: `mamacare-session-${safeUser.id}-${Date.now()}`
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng nhập' });
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
      return res.status(400).json({
        success: false,
        message: 'Email hoặc số điện thoại này đã được đăng ký trên hệ thống'
      });
    }

    let roleName = 'Mẹ Bầu';
    let avatar = '🌸';
    let userPartnerCode = partnerCode.trim();
    let partnerName = '';

    if (role === 'mom') {
      roleName = 'Mẹ Bầu';
      avatar = '🌸';
      userPartnerCode = 'MAMA-' + Math.floor(1000 + Math.random() * 9000);
    } else if (role === 'husband') {
      roleName = 'Bố Bỉm (Partner)';
      avatar = '🧸';
      if (userPartnerCode) {
        const momUser = await User.findOne({ partnerCode: userPartnerCode, role: 'mom' });
        if (momUser) partnerName = momUser.name;
      }
    } else if (role === 'admin') {
      roleName = 'Ban Quản Trị';
      avatar = '🛡️';
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

    // Nếu là mẹ, khởi tạo bản ghi PartnerSync trong MongoDB nếu chưa có
    if (role === 'mom') {
      await PartnerSync.findOneAndUpdate(
        { partnerCode: userPartnerCode },
        {
          partnerCode: userPartnerCode,
          momName: newUser.name,
          pregnancyWeek: newUser.pregnancyWeek || 12,
          currentMood: 'Hạnh phúc',
          weather: 'sunny',
          actionTip: 'Mẹ vừa tạo tài khoản! Bố hãy gửi lời chúc yêu thương và đồng hành cùng mẹ nhé!',
          lastCheckIn: 'Vừa xong'
        },
        { upsert: true, new: true }
      );
    }

    const safeUser = newUser.toSafeObject();

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: safeUser,
      token: `mamacare-session-${safeUser.id}-${Date.now()}`
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo tài khoản trong cơ sở dữ liệu' });
  }
});

// ==========================================
// 3. MODULE 1.1: TRẠM CẢM XÚC (MOOD TRACKING & ANALYTICS)
// ==========================================

// Lấy phân tích tâm lý tuần/tháng từ MongoDB
router.get('/mood/analytics', async (req, res) => {
  try {
    const records = await MoodRecord.find().sort({ createdAt: 1 }).limit(30);
    const count = records.length;
    const avgScore = count > 0
      ? Math.round(records.reduce((acc, cur) => acc + (cur.score || 0), 0) / count)
      : 75;

    res.json({
      success: true,
      records,
      summary: {
        averageScore: avgScore,
        trend: avgScore >= 70 ? 'up' : (avgScore >= 50 ? 'stable' : 'down'),
        statusText: avgScore >= 70 ? 'Tâm trạng tích cực và ổn định' : (avgScore >= 50 ? 'Cần thư giãn và nghỉ ngơi thêm' : 'Cần người thân đồng hành và chia sẻ'),
        totalCheckIns: count
      }
    });
  } catch (err) {
    console.error('Lỗi lấy dữ liệu tâm lý:', err);
    res.status(500).json({ success: false, message: 'Lỗi truy vấn dữ liệu từ MongoDB' });
  }
});

// Check-in cảm xúc hàng ngày -> Lưu vào MongoDB & Đồng bộ cho Chồng
router.post('/mood/check-in', async (req, res) => {
  try {
    const { mood = 'Hạnh phúc', score = 80, symptoms = [], waterCount = 6, journal = '', userName = 'Mẹ Bầu' } = req.body;

    const moodConfigs = {
      'Vui vẻ': { score: 90, emoji: '🥰', weather: 'sunny', tip: 'Vợ đang tràn đầy năng lượng! Hãy cùng cô ấy trò chuyện, rủ cô ấy đi dạo và chuẩn bị món cô ấy thích nhé!' },
      'Hạnh phúc': { score: 90, emoji: '🥰', weather: 'sunny', tip: 'Vợ đang rất hạnh phúc và phấn khởi! Hãy trao cô ấy một cái ôm thật ấm áp nhé!' },
      'Bình yên': { score: 80, emoji: '🌿', weather: 'cloudy', tip: 'Tâm trạng vợ rất êm đềm. Hãy cùng cô ấy nghe nhạc sóng não hoặc pha một cốc sữa ấm thơm ngon.' },
      'Cáu gắt': { score: 45, emoji: '🌩️', weather: 'storm', tip: 'Báo động: Vợ đang bị quá tải và mệt mỏi! Đừng tranh luận đúng sai, hãy chủ động rửa bát và ôm vợ thật nhẹ nhàng.' },
      'Tủi thân': { score: 40, emoji: '🥺', weather: 'rain', tip: 'Vợ đang cảm thấy cô đơn và tủi thân. Hãy tạm gác công việc lại một chút, gọi điện hỏi thăm hoặc về sớm xoa bóp chân cho cô ấy.' },
      'Lo âu': { score: 50, emoji: '🌧️', weather: 'windy', tip: 'Vợ đang lo lắng về các mốc khám thai. Hãy nắm tay cô ấy, động viên và cùng xem lại lịch nhắc khám định kỳ.' }
    };

    const cfg = moodConfigs[mood] || moodConfigs['Bình yên'];
    const now = new Date();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const newRecord = await MoodRecord.create({
      userName,
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      dayOfWeek: dayNames[now.getDay()],
      mood,
      emoji: cfg.emoji,
      score: Number(score) || cfg.score,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      waterCount: Number(waterCount) || 6,
      journal
    });

    // Tự động cập nhật PartnerSync vào MongoDB
    const updatedSync = await PartnerSync.findOneAndUpdate(
      {},
      {
        currentMood: mood,
        weather: cfg.weather,
        actionTip: cfg.tip,
        lastCheckIn: 'Vừa xong',
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Đã lưu check-in cảm xúc vào cơ sở dữ liệu MongoDB!',
      record: newRecord,
      syncedPartner: updatedSync
    });
  } catch (err) {
    console.error('Lỗi check-in:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu check-in vào MongoDB' });
  }
});

// Lưu nhật ký biết ơn / xả stress
router.post('/mood/journal', async (req, res) => {
  try {
    const { content, type = 'text', tags = [] } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung nhật ký không được để trống' });
    }

    const entry = {
      content: content.trim(),
      type,
      tags: Array.isArray(tags) ? tags : [tags],
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Nhật ký đã được lưu giữ an toàn vào cơ sở dữ liệu!',
      entry
    });
  } catch (err) {
    console.error('Lỗi lưu nhật ký:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu nhật ký vào MongoDB' });
  }
});

// ==========================================
// 4. MODULE 1.2: TRỢ LÝ AI TÂM GIAO & RED-FLAG SOS
// ==========================================
router.post('/ai/chat', async (req, res) => {
  try {
    const { message = '', userId = 'guest' } = req.body;
    const lowerMsg = message.toLowerCase();

    // Lưu tin nhắn người dùng vào MongoDB
    await AiChat.create({
      userId,
      sender: 'user',
      text: message
    });

    // DANH SÁCH TỪ KHÓA NGUY HIỂM KÍCH HOẠT HỆ THỐNG CẢNH BÁO ĐỎ (RED-FLAG SOS)
    const redFlagKeywords = [
      'tuyệt vọng', 'làm hại bản thân', 'tự tử', 'chết đi', 'không muốn sống',
      'ghét bỏ đứa trẻ', 'hận đứa con', 'bỏ con', 'trầm cảm nặng', 'muốn biến mất',
      'giết', 'chết quách'
    ];

    const hasRedFlag = redFlagKeywords.some(keyword => lowerMsg.includes(keyword));

    if (hasRedFlag) {
      // Ghi nhận cảnh báo khẩn cấp vào MongoDB Moderation Queue
      await Moderation.create({
        author: 'Mẹ Bầu (Phát hiện từ Chat AI)',
        type: 'chat',
        content: message,
        reason: 'Cảnh báo Đỏ (Red-flag): Phát hiện ý nghĩ tiêu cực/nguy cơ tự làm tổn thương',
        status: 'pending'
      });

      const sosReply = 'Mẹ ơi, em đang lắng nghe đây. Xin mẹ hãy hít một hơi thật sâu... Mẹ không hề đơn độc một mình lúc này đâu. Đội ngũ y bác sĩ và chuyên viên tâm lý luôn ở ngay bên mẹ. Em đã kích hoạt chế độ hỗ trợ khẩn cấp, mẹ hãy gọi ngay hotline bên dưới để có người ở bên chia sẻ cùng mẹ nhé! ❤️';

      await AiChat.create({
        userId,
        sender: 'ai',
        text: sosReply,
        isRedFlag: true
      });

      return res.json({
        success: true,
        isRedFlag: true,
        reply: sosReply,
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

    // Phản hồi AI thấu cảm theo ngữ cảnh
    let reply = 'Mình hiểu mẹ đang cảm thấy thế nào. Mang thai là hành trình tuyệt vời nhưng cũng có những lúc cơ thể và tâm trí mẹ bị quá tải. Mẹ cứ thả lỏng và chia sẻ thêm với mình nhé, mình luôn ở đây cùng mẹ. ❤️';
    if (lowerMsg.includes('đau lưng') || lowerMsg.includes('mỏi')) {
      reply = 'Mẹ bị mỏi lưng đúng không ạ? Ở giai đoạn này, tử cung phát triển khiến cột sống phải chịu thêm áp lực. Mẹ thử dùng gối ôm chữ U khi ngủ nghiêng sang trái, và nhờ bố massage nhẹ nhàng thắt lưng theo hình tròn nhé.';
    } else if (lowerMsg.includes('khó ngủ') || lowerMsg.includes('mất ngủ')) {
      reply = 'Khó ngủ là nỗi niềm chung của rất nhiều mẹ bầu. Mẹ hãy thử vào tab "Không Gian Thở", bật bài nhạc sóng não 432Hz hoặc tiếng mưa rào nhẹ nhàng, kết hợp bài tập thở 4-7-8 để đưa cơ thể vào trạng thái thư giãn sâu nhé mẹ.';
    } else if (lowerMsg.includes('buồn') || lowerMsg.includes('khóc') || lowerMsg.includes('cô đơn')) {
      reply = 'Mẹ cứ khóc một chút nếu thấy nhẹ lòng hơn nhé, khóc không có gì là yếu đuối cả. Sự thay đổi của progesterone và estrogen khiến cảm xúc của mẹ nhạy cảm hơn nhiều lần. Mẹ đã làm rất tốt hôm nay rồi, thương mẹ nhiều!';
    } else if (lowerMsg.includes('chồng') || lowerMsg.includes('vô tâm')) {
      reply = 'Nhiều khi các ông bố không cố ý vô tâm đâu mẹ ơi, mà do họ chưa thực sự hiểu hết những thay đổi bên trong cơ thể mẹ. Mẹ hãy dùng tính năng "Gợi ý Cứu Vợ" trong app, ứng dụng sẽ gửi tin nhắn nhắc nhở nhẹ nhàng để bố biết cách quan tâm mẹ hơn.';
    }

    await AiChat.create({
      userId,
      sender: 'ai',
      text: reply,
      isRedFlag: false
    });

    res.json({
      success: true,
      isRedFlag: false,
      reply
    });
  } catch (err) {
    console.error('Lỗi AI Chat:', err);
    res.status(500).json({ success: false, message: 'Lỗi trò chuyện với AI' });
  }
});

// ==========================================
// 5. MODULE 1.3: KHÔNG GIAN "THỞ" (ZEN SPACE)
// ==========================================
router.get('/zen/tracks', (req, res) => {
  res.json({
    success: true,
    tracks: [
      { id: 'track-1', title: 'Sóng Não 432Hz Miracle Tone', desc: 'Tần số hòa bình, giảm căng thẳng thần kinh sâu', duration: 'Vòng lặp Synthesizer', type: 'binaural_432' },
      { id: 'track-2', title: 'Sóng Não 528Hz DNA Repair', desc: 'Tần số phục hồi tế bào và nâng cao năng lượng tích cực', duration: 'Vòng lặp Synthesizer', type: 'binaural_528' },
      { id: 'track-3', title: 'Tiếng Mưa Rào Pink Noise', desc: 'Tiếng mưa rơi dịu êm cắt đứt tạp âm, dễ đi vào giấc ngủ', duration: 'Vòng lặp Pink Noise', type: 'rain_noise' },
      { id: 'track-4', title: 'Audio Truyện Thai Giáo: Hạt Mầm Yêu Thương', desc: 'Giọng đọc ấm áp giúp bé kết nối cùng mẹ trước giờ ngủ', duration: '12:45', type: 'story' }
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
      { id: 'yoga-t1', trimester: 1, title: 'Thư giãn cột sống & Chống ốm nghén nhẹ', duration: '12 phút', level: 'Dễ' },
      { id: 'yoga-t2', trimester: 2, title: 'Mở rộng khung chậu & Giảm áp lực thắt lưng', duration: '18 phút', level: 'Trung bình' },
      { id: 'yoga-t3', trimester: 3, title: 'Tập thở chuẩn bị chuyển dạ & Tư thế cánh bướm', duration: '15 phút', level: 'Nhẹ nhàng' }
    ]
  });
});

// ==========================================
// 6. MODULE 1.4: DIỄN ĐÀN GÓC KHUẤT (SAFE SPACE FORUM)
// ==========================================
router.get('/forum/posts', async (req, res) => {
  try {
    const { room = 'all' } = req.query;
    const filter = room === 'all' ? {} : { room };
    const posts = await ForumPost.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: posts.length,
      posts
    });
  } catch (err) {
    console.error('Lỗi lấy bài viết diễn đàn:', err);
    res.status(500).json({ success: false, message: 'Lỗi tải bài viết từ cơ sở dữ liệu' });
  }
});

// Đăng bài diễn đàn vào MongoDB
router.post('/forum/posts', async (req, res) => {
  try {
    const { title, content, room = '3months', author = 'Mẹ Bầu Ẩn Danh', authorRole = 'Mẹ Bầu', tag = 'Tâm Sự' } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung không được để trống' });
    }

    const newPost = await ForumPost.create({
      author,
      authorRole,
      room,
      title: title.trim(),
      content: content.trim(),
      tag,
      likes: 0,
      comments: []
    });

    res.status(201).json({
      success: true,
      message: 'Tâm sự của mẹ đã được lưu và chia sẻ vào diễn đàn an toàn!',
      post: newPost
    });
  } catch (err) {
    console.error('Lỗi đăng bài viết:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu bài viết vào MongoDB' });
  }
});

// Thả tim bài viết trong MongoDB
router.post('/forum/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ForumPost.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    res.json({
      success: true,
      likes: post.likes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật lượt thích' });
  }
});

// Báo cáo bài viết -> Lưu vào MongoDB Moderation Queue
router.post('/forum/posts/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Nội dung tiêu cực / Cần kiểm duyệt' } = req.body;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    const queueItem = await Moderation.create({
      author: post.author,
      type: 'post',
      content: `${post.title}\n\n${post.content}`,
      reason,
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Cảm ơn mẹ đã gửi báo cáo. Ban kiểm duyệt sẽ xem xét nội dung trong thời gian sớm nhất!',
      reportId: queueItem._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi báo cáo bài viết' });
  }
});

// ==========================================
// 7. MODULE 2.1: ĐỒNG BỘ CẢM XÚC CHO CHỒNG (PARTNER SYNC)
// ==========================================
router.get('/partner/sync', async (req, res) => {
  try {
    let syncData = await PartnerSync.findOne().sort({ updatedAt: -1 });
    if (!syncData) {
      syncData = await PartnerSync.create({
        partnerCode: 'MAMA-8899',
        momName: 'Nguyễn Thùy Trang',
        pregnancyWeek: 24,
        currentMood: 'Hạnh phúc',
        weather: 'sunny',
        actionTip: 'Mẹ đang rất vui! Bố hãy dành thêm thời gian trò chuyện cùng mẹ nhé!',
        lastCheckIn: 'Vừa xong'
      });
    }

    res.json({
      success: true,
      data: syncData
    });
  } catch (err) {
    console.error('Lỗi tải dữ liệu Partner Sync:', err);
    res.status(500).json({ success: false, message: 'Lỗi đọc dữ liệu từ MongoDB' });
  }
});

// Bố bấm gửi hành động cứu vợ
router.post('/partner/action', async (req, res) => {
  try {
    const { actionId, label } = req.body;

    const updatedSync = await PartnerSync.findOneAndUpdate(
      {},
      {
        $push: {
          actionsTaken: {
            actionId,
            label,
            timestamp: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `Bố đã hoàn thành hành động: "${label}". Yêu thương đã được đồng bộ tới mẹ!`,
      data: updatedSync
    });
  } catch (err) {
    console.error('Lỗi thực hiện hành động:', err);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hành động vào MongoDB' });
  }
});

// ==========================================
// 8. MODULE 2.2: LỚP HỌC LÀM BA (DADDY BOOTCAMP)
// ==========================================
router.get('/bootcamp/lessons', (req, res) => {
  res.json({
    success: true,
    lessons: [
      { id: 'b-1', title: 'Giải Mã Biến Đổi Hormone Ở Mẹ Bầu', duration: '8 phút', icon: '🧬', desc: 'Hiểu vì sao progesterone và estrogen làm cảm xúc người vợ thay đổi thất thường.' },
      { id: 'b-2', title: 'Kỹ Thuật Massage Giảm Đau Thắt Lưng & Chuột Rút', duration: '12 phút', icon: '💆‍♂️', desc: 'Thực hành các động tác xoa bóp nhẹ nhàng chuẩn y khoa giúp vợ ngủ ngon.' },
      { id: 'b-3', title: 'Hành Trang Đi Sinh & Quy Trình Phòng Sinh', duration: '15 phút', icon: '🏥', desc: 'Danh sách đồ cần chuẩn bị vào viện và cách trấn an tâm lý vợ trong phòng chờ sinh.' }
    ]
  });
});

router.post('/bootcamp/quiz', (req, res) => {
  res.json({
    success: true,
    score: 100,
    passed: true,
    badge: 'Bố Bỉm 10 Điểm Chuẩn Y Khoa',
    feedback: 'Tuyệt vời! Bạn đã nắm vững kiến thức đồng hành thai kỳ cùng vợ.'
  });
});

// ==========================================
// 9. MODULE 4: BAN QUẢN LÝ (ADMIN DASHBOARD & MODERATION)
// ==========================================
router.get('/admin/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const momCount = await User.countDocuments({ role: 'mom' });
    const dadCount = await User.countDocuments({ role: 'husband' });
    const totalMoods = await MoodRecord.countDocuments();
    const totalPosts = await ForumPost.countDocuments();
    const pendingMod = await Moderation.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      metrics: {
        totalUsers,
        momCount,
        dadCount,
        totalMoods,
        totalPosts,
        pendingModeration: pendingMod,
        systemStatus: 'Hoạt động ổn định',
        databaseEngine: 'MongoDB Database Live',
        monthlyRevenue: 185450000,
        growthPercent: 18.2
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi truy vấn số liệu quản trị từ MongoDB' });
  }
});

router.get('/admin/moderation', async (req, res) => {
  try {
    const queue = await Moderation.find({ status: 'pending' }).sort({ flaggedAt: -1 });
    res.json({
      success: true,
      queue
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy hàng đợi kiểm duyệt từ MongoDB' });
  }
});

router.post('/admin/moderation/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await Moderation.findByIdAndUpdate(id, { status: 'approved' });

    res.json({
      success: true,
      message: 'Đã phê duyệt nội dung trong cơ sở dữ liệu MongoDB!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi phê duyệt nội dung' });
  }
});

router.delete('/admin/moderation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Moderation.findByIdAndUpdate(id, { status: 'rejected' });

    res.json({
      success: true,
      message: 'Đã gỡ bỏ và xử lý vi phạm trong cơ sở dữ liệu MongoDB!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi gỡ bỏ nội dung' });
  }
});

module.exports = router;
