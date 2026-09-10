// In-memory failover store for MamaCare
// Đảm bảo hệ thống hoạt động 100% trên Vercel ngay cả khi MongoDB Atlas chưa mở IP Access List (0.0.0.0/0)

const memoryDb = {
  users: [
    {
      id: 'usr-mom-01',
      _id: 'usr-mom-01',
      name: 'Nguyễn Thùy Trang',
      email: 'mebau@mamacare.vn',
      phone: '0388558698',
      password: 'abc',
      role: 'mom',
      roleName: 'Mẹ Bầu',
      avatar: '🌸',
      pregnancyWeek: 24,
      dueDate: '2026-12-25',
      partnerCode: 'MAMA-8899',
      partnerName: '',
      createdAt: new Date(),
      toSafeObject: function() {
        const copy = { ...this };
        delete copy.password;
        delete copy.toSafeObject;
        return copy;
      }
    },
    {
      id: 'usr-dad-01',
      _id: 'usr-dad-01',
      name: 'Trần Minh Đức',
      email: 'bobim@mamacare.vn',
      phone: '0977223344',
      password: 'password123',
      role: 'husband',
      roleName: 'Bố Bỉm (Partner)',
      avatar: '🧸',
      pregnancyWeek: undefined,
      dueDate: '',
      partnerCode: 'MAMA-8899',
      partnerName: 'Nguyễn Thùy Trang',
      createdAt: new Date(),
      toSafeObject: function() {
        const copy = { ...this };
        delete copy.password;
        delete copy.toSafeObject;
        return copy;
      }
    },
    {
      id: 'usr-admin-01',
      _id: 'usr-admin-01',
      name: 'Quản Trị Hệ Thống',
      email: 'admin@mamacare.vn',
      phone: '0911000999',
      password: 'adminpassword123',
      role: 'admin',
      roleName: 'Ban Quản Trị',
      avatar: '🛡️',
      pregnancyWeek: undefined,
      dueDate: '',
      partnerCode: '',
      partnerName: '',
      createdAt: new Date(),
      toSafeObject: function() {
        const copy = { ...this };
        delete copy.password;
        delete copy.toSafeObject;
        return copy;
      }
    }
  ],

  moodRecords: [
    { id: 'm-1', _id: 'm-1', userName: 'Mẹ Bầu', date: '2026-09-03', dayOfWeek: 'T5', time: '09:00', mood: 'Hạnh phúc', emoji: '🥰', score: 90, symptoms: ['Khỏe khoắn'], waterCount: 8, journal: 'Bé đạp rất ngoan.' },
    { id: 'm-2', _id: 'm-2', userName: 'Mẹ Bầu', date: '2026-09-04', dayOfWeek: 'T6', time: '14:30', mood: 'Thư thái', emoji: '🌿', score: 85, symptoms: ['Hơi khát nước'], waterCount: 7, journal: 'Đi dạo công viên.' },
    { id: 'm-3', _id: 'm-3', userName: 'Mẹ Bầu', date: '2026-09-05', dayOfWeek: 'T7', time: '20:15', mood: 'Bình an', emoji: '🌸', score: 80, symptoms: ['Mỏi chân nhẹ'], waterCount: 6, journal: 'Nghe nhạc sóng não.' },
    { id: 'm-4', _id: 'm-4', userName: 'Mẹ Bầu', date: '2026-09-06', dayOfWeek: 'CN', time: '11:00', mood: 'Nhạy cảm', emoji: '🥺', score: 65, symptoms: ['Mỏi lưng'], waterCount: 5, journal: 'Trời mưa hơi buồn.' },
    { id: 'm-5', _id: 'm-5', userName: 'Mẹ Bầu', date: '2026-09-07', dayOfWeek: 'T2', time: '08:45', mood: 'Căng thẳng', emoji: '🌩️', score: 55, symptoms: ['Khó ngủ'], waterCount: 6, journal: 'Công việc đầu tuần.' },
    { id: 'm-6', _id: 'm-6', userName: 'Mẹ Bầu', date: '2026-09-08', dayOfWeek: 'T3', time: '15:20', mood: 'Hồi phục', emoji: '🌤️', score: 75, symptoms: ['Đã khỏe hơn'], waterCount: 7, journal: 'Ngâm chân nước ấm.' },
    { id: 'm-7', _id: 'm-7', userName: 'Mẹ Bầu', date: '2026-09-09', dayOfWeek: 'T4', time: '10:00', mood: 'Yêu đời', emoji: '🥰', score: 88, symptoms: ['Khỏe khoắn'], waterCount: 7, journal: 'Bé con phản ứng giọng ba!' }
  ],

  partnerSync: {
    partnerCode: 'MAMA-8899',
    momName: 'Nguyễn Thùy Trang',
    pregnancyWeek: 24,
    currentMood: 'Sấm Chớp',
    weather: 'storm',
    actionTip: 'Vợ đang mệt mỏi và mỏi thắt lưng. Hãy chủ động pha nước ấm ngâm chân và ôm cô ấy nhé!',
    lastCheckIn: 'Vừa xong',
    actionsTaken: [
      { actionId: 'foot_massage', label: 'Massage chân cho vợ', timestamp: new Date() }
    ],
    updatedAt: new Date()
  },

  forumPosts: [
    {
      _id: 'post-01',
      id: 'post-01',
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
        { author: 'BS. Bích Liên (CK Sản)', avatar: '👩‍⚕️', content: 'Chào em, chuột rút tuần 24 rất phổ biến do nhu cầu canxi và magie tăng. Em nên ngâm chân nước muối ấm 15 phút trước khi ngủ nhé.' }
      ],
      createdAt: new Date()
    },
    {
      _id: 'post-02',
      id: 'post-02',
      author: 'Mẹ Bầu Ẩn Danh #412',
      authorRole: 'Mẹ Bầu 3 Tháng Đầu',
      avatar: '🤰',
      room: '3months',
      title: 'Nghén không ăn uống được gì, có ảnh hưởng đến sự phát triển của thai nhi không?',
      content: 'Em mới mang thai 8 tuần, ngửi mùi thức ăn là nôn nao. Cả tuần nay em chỉ uống được nước cam và bánh mì khô...',
      tag: 'Tâm Sự',
      likes: 42,
      isExpertVerified: true,
      comments: [],
      createdAt: new Date()
    },
    {
      _id: 'post-03',
      id: 'post-03',
      author: 'BS. Bích Liên (Chuyên Khoa Sản Nhi)',
      authorRole: 'Chuyên Gia Y Khoa',
      avatar: '👩‍⚕️',
      room: 'doctor',
      title: 'Hướng dẫn nhận biết dấu hiệu trầm cảm thai kỳ và cách phòng ngừa',
      content: 'Trầm cảm thai kỳ do thay đổi hormone estrogen và progesterone là hoàn toàn có thật và không phải do mẹ yếu đuối...',
      tag: 'Kiến Thức Y Khoa',
      likes: 128,
      isExpertVerified: true,
      comments: [],
      createdAt: new Date()
    }
  ],

  moderations: [
    {
      _id: 'mod-01',
      id: 'mod-01',
      author: 'User#8821',
      type: 'post',
      content: 'Có ai uống thuốc giảm cân thảo dược trong lúc mang thai không?',
      reason: 'Nghi vấn quảng cáo dược phẩm / thuốc không rõ nguồn gốc',
      status: 'pending',
      flaggedAt: new Date()
    },
    {
      _id: 'mod-02',
      id: 'mod-02',
      author: 'User#3012',
      type: 'chat',
      content: 'Tôi cảm thấy vô cùng tuyệt vọng và không muốn tiếp tục nữa...',
      reason: 'Cảnh báo đỏ (Red-flag): Từ khóa nguy hiểm',
      status: 'pending',
      flaggedAt: new Date()
    }
  ],

  chats: [],

  medications: [
    { id: 'med-1', _id: 'med-1', userId: 'system', name: "Sắt hữu cơ Fumafer (1 viên sau ăn sáng)", time: "08:00 AM", taken: true, createdAt: new Date() },
    { id: 'med-2', _id: 'med-2', userId: 'system', name: "Canxi Nano BioCal (1 viên sau ăn trưa)", time: "13:00 PM", taken: true, createdAt: new Date() },
    { id: 'med-3', _id: 'med-3', userId: 'system', name: "DHA Thai kỳ BioIsland (2 viên sau ăn tối)", time: "19:30 PM", taken: false, createdAt: new Date() },
    { id: 'med-4', _id: 'med-4', userId: 'system', name: "Acid Folic 400mcg (1 viên trước khi ngủ)", time: "21:30 PM", taken: false, createdAt: new Date() }
  ],

  appointments: [
    { id: 'app-1', _id: 'app-1', userId: 'system', title: "Siêu âm hình thái 4D (Mốc Tuần 22)", date: "14/09/2026", doctor: "BS. Nguyễn Mai Phương", createdAt: new Date() },
    { id: 'app-2', _id: 'app-2', userId: 'system', title: "Nghiệm pháp dung nạp Glucose (Tuần 26)", date: "05/10/2026", doctor: "BS. Lê Hoàng Nam", createdAt: new Date() }
  ]
};

module.exports = memoryDb;
