const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
const atlasEnvPath = path.join(__dirname, '../atlas-credentials.env');
if (fs.existsSync(atlasEnvPath)) {
  dotenv.config({ path: atlasEnvPath });
}

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

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mamacare';
  const maskedUri = uri.replace(/:[^:@]+@/, ':****@');
  console.log(`📡 Đang kết nối tới MongoDB để reset & nạp dữ liệu: ${maskedUri}...`);

  try {
    await mongoose.connect(uri, {
      dbName: 'mamacare',
      serverSelectionTimeoutMS: 10000
    });
    console.log('🍃 Đã kết nối MongoDB thành công!');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      MoodRecord.deleteMany({}),
      ForumPost.deleteMany({}),
      PartnerSync.deleteMany({}),
      Moderation.deleteMany({}),
      AiChat.deleteMany({}),
      Medication.deleteMany({}),
      Appointment.deleteMany({}),
      Transaction.deleteMany({}),
      ZenContent.deleteMany({})
    ]);
    console.log('🗑️  Đã làm sạch database cũ.');

    // 1. Tạo Users
    const mom = await User.create({
      name: 'Nguyễn Thùy Trang',
      email: 'mebau@mamacare.vn',
      phone: '0388558698',
      password: 'abc',
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
      partnerCode: 'MAMA-8899',
      partnerName: 'Nguyễn Thùy Trang'
    });

    await User.create({
      name: 'Quản Trị Hệ Thống',
      email: 'admin@mamacare.vn',
      phone: '0911000999',
      password: 'adminpassword123',
      role: 'admin',
      roleName: 'Ban Quản Trị',
      avatar: '🛡️'
    });

    // 2. Tạo MoodRecords
    await MoodRecord.create([
      { user: mom._id, userName: mom.name, date: '2026-09-03', dayOfWeek: 'T5', time: '09:00', mood: 'Hạnh phúc', emoji: '🥰', score: 90, symptoms: ['Khỏe khoắn', 'Tràn đầy năng lượng'], waterCount: 8, journal: 'Hôm nay bé đạp rất ngoan, mẹ cảm thấy thật bình yên.' },
      { user: mom._id, userName: mom.name, date: '2026-09-04', dayOfWeek: 'T6', time: '14:30', mood: 'Thư thái', emoji: '🌿', score: 85, symptoms: ['Hơi khát nước'], waterCount: 7, journal: 'Đi dạo buổi chiều ở công viên cùng chồng.' },
      { user: mom._id, userName: mom.name, date: '2026-09-05', dayOfWeek: 'T7', time: '20:15', mood: 'Bình an', emoji: '🌸', score: 80, symptoms: ['Mỏi chân nhẹ'], waterCount: 6, journal: 'Nghe nhạc sóng não thiền trước khi ngủ.' },
      { user: mom._id, userName: mom.name, date: '2026-09-06', dayOfWeek: 'CN', time: '11:00', mood: 'Nhạy cảm', emoji: '🥺', score: 65, symptoms: ['Mỏi thắt lưng', 'Buồn ngủ'], waterCount: 5, journal: 'Thời tiết mưa âm u khiến mẹ hơi tủi thân một chút.' },
      { user: mom._id, userName: mom.name, date: '2026-09-07', dayOfWeek: 'T2', time: '08:45', mood: 'Căng thẳng', emoji: '🌩️', score: 55, symptoms: ['Khó ngủ', 'Mỏi lưng'], waterCount: 6, journal: 'Công việc đầu tuần hơi dồn dập, phải hít thở sâu.' },
      { user: mom._id, userName: mom.name, date: '2026-09-08', dayOfWeek: 'T3', time: '15:20', mood: 'Hồi phục', emoji: '🌤️', score: 75, symptoms: ['Đã khỏe hơn'], waterCount: 7, journal: 'Chồng pha cho cốc nước ấm ngâm chân, thấy dễ chịu hẳn.' },
      { user: mom._id, userName: mom.name, date: '2026-09-09', dayOfWeek: 'T4', time: '10:00', mood: 'Yêu đời', emoji: '🥰', score: 88, symptoms: ['Khỏe khoắn'], waterCount: 7, journal: 'Bé con tuần 24 đã bắt đầu phản ứng với giọng nói của ba!' }
    ]);

    // 3. Tạo PartnerSync
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

    // 4. Tạo ForumPosts
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
      },
      {
        author: 'Mẹ Mây Nhỏ #402',
        authorRole: 'Mẹ Bầu Tuần 18',
        avatar: '☁️',
        room: 'rage',
        title: 'Mẹ chồng cứ ép ăn cháo móng giò mỗi ngày phát ngấy...',
        content: 'Bác sĩ đã dặn chỉ cần bổ sung đủ chất, tăng cân khoa học. Nhưng ngày nào mẹ chồng cũng nấu nguyên nồi cháo to bắt ăn hết...',
        tag: 'Trút Giận',
        likes: 42,
        isExpertVerified: false,
        comments: []
      },
      {
        author: 'Mẹ Hạt Dẻ #718',
        authorRole: 'Mẹ Bầu Tuần 28',
        avatar: '🌰',
        room: 'advice',
        title: 'Tuần 28 rồi mà đêm nào cũng trằn trọc đến 3h sáng, có mẹ nào có mẹo không?',
        content: 'Em kê gối chữ U, uống sữa ấm trước khi ngủ mà vẫn không đỡ. Có mẹ nào có bí quyết nào dễ ngủ không chỉ em với ạ!',
        tag: 'Xin Lời Khuyên',
        likes: 27,
        isExpertVerified: false,
        comments: []
      },
      {
        author: 'Mẹ Bắp Non #911',
        authorRole: 'Mẹ Bầu Tuần 22',
        avatar: '🌽',
        room: 'joy',
        title: 'Lần đầu tiên bố đặt tay lên bụng và bé đạp phản hồi đúng chỗ đó!',
        content: 'Khoảnh khắc kỳ diệu nhất từ lúc mang thai đến giờ các mẹ ơi! Chồng mình bình thường ít nói thế mà lúc cảm nhận được con đã rơm rớm nước mắt...',
        tag: 'Hạnh Phúc',
        likes: 98,
        isExpertVerified: false,
        comments: []
      }
    ]);

    // 5. Tạo Moderations
    await Moderation.create([
      {
        author: 'Ẩn danh #9182',
        type: 'post',
        content: 'Bán thuốc bổ xách tay cam kết sinh con trai 100%. Nhắn tin Zalo 09xxxx để mua thuốc thảo dược gia truyền...',
        reason: 'Quảng cáo sai sự thật / Buôn bán trái phép',
        status: 'pending'
      },
      {
        author: 'Ẩn danh #4412',
        type: 'chat',
        content: 'Em mệt quá, em ghét cái thai này, em chỉ muốn biến mất... Mọi người ai cũng vô tâm...',
        reason: 'Cảnh báo Đỏ: Nguy cơ trầm cảm thai kỳ nặng',
        status: 'urgent_sos'
      }
    ]);

    // 6. Tạo Medications
    await Medication.create([
      { userId: 'system', name: 'Sắt hữu cơ Fumafer (1 viên sau ăn sáng)', time: '08:00 AM', taken: true },
      { userId: 'system', name: 'Canxi Nano BioCal (1 viên sau ăn trưa)', time: '13:00 PM', taken: true },
      { userId: 'system', name: 'DHA Thai kỳ BioIsland (2 viên sau ăn tối)', time: '19:30 PM', taken: false },
      { userId: 'system', name: 'Acid Folic 400mcg (1 viên trước khi ngủ)', time: '21:30 PM', taken: false }
    ]);

    // 7. Tạo Appointments
    await Appointment.create([
      { userId: 'system', title: 'Siêu âm hình thái 4D (Mốc Tuần 22)', date: '14/09/2026', doctor: 'BS. Nguyễn Mai Phương' },
      { userId: 'system', title: 'Nghiệm pháp dung nạp Glucose (Tuần 26)', date: '05/10/2026', doctor: 'BS. Lê Hoàng Nam' }
    ]);

    // 8. Tạo Transactions
    await Transaction.create([
      { txId: 'TX-9901', user: 'Mẹ Hoàng Oanh', package: 'Gói MamaCare Premium 1 Năm', amount: 1200000, date: '10 phút trước', status: 'completed' },
      { txId: 'TX-9902', user: 'Bố Minh Đức', package: 'Tư Vấn Tâm Lý Chuyên Sâu 1-1', amount: 500000, date: '45 phút trước', status: 'completed' },
      { txId: 'TX-9903', user: 'Mẹ Ánh Tuyết', package: 'Gói MamaCare Premium 6 Tháng', amount: 690000, date: '2 giờ trước', status: 'completed' },
      { txId: 'TX-9904', user: 'Bố Quốc Hưng', package: 'Khóa Học Daddy Masterclass', amount: 350000, date: '4 giờ trước', status: 'completed' }
    ]);

    // 9. Tạo ZenContent
    await ZenContent.create({
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

    console.log('✅ Hoàn tất nạp dữ liệu chuẩn y khoa vào MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi seed database:', err);
    process.exit(1);
  }
}

seed();
