import React, { useState } from 'react';

export default function BootcampModal({ isOpen, topic, onClose }) {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'articles' | 'quiz'
  const [quizResult, setQuizResult] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!isOpen) return null;

  const topicConfig = {
    hormone: {
      badge: "Kiến Thức Y Khoa",
      title: "Giải Mã Biến Động Hormone Estrogen & Progesterone",
      desc: "Thời lượng: 0:45 min • Hiểu vì sao lượng hormone tăng gấp 30 lần khiến vợ siêu nhạy cảm và dễ khóc",
      video: {
        title: "Video Minh Họa: Biến động Hormone & Tâm lý Phụ Nữ Mang Thai",
        duration: "1 phút 20 giây",
        source: "Bác Sĩ Sản Khoa BV Từ Dũ",
        youtubeId: "5mGuCdlbUGk", // Educational pregnancy animation
        summary: "Trong thai kỳ, hormone HCG, Progesterone và Estrogen tăng vọt gấp hàng chục lần, tác động trực tiếp lên vùng dưới đồi não bộ. Việc vợ dễ xúc động hay khóc vô cớ hoàn toàn là phản ứng sinh hóa tự nhiên, không phải do vợ khó tính!"
      },
      articles: [
        {
          id: 'art-h1',
          source: 'Báo Sức Khỏe & Đời Sống (Bộ Y Tế)',
          date: '08/09/2026',
          title: 'Vì sao phụ nữ mang thai dễ nhạy cảm, tủi thân và hay khóc vô cớ?',
          excerpt: 'Nghiên cứu cho thấy nồng độ Estrogen và Progesterone tăng vọt làm thay đổi chất dẫn truyền thần kinh Serotonin, khiến tâm trạng mẹ bầu dao động mạnh như đồ thị hình sin.',
          link: 'https://suckhoedoisong.vn/',
          tag: 'Tâm Lý Y Học'
        },
        {
          id: 'art-h2',
          source: 'Bệnh Viện Đa Khoa Quốc Tế Vinmec',
          date: '05/09/2026',
          title: 'Vai trò cốt lõi của người chồng trong việc cân bằng cảm xúc thai kỳ',
          excerpt: 'Sự hiện diện, những cái ôm ấm áp và lời khen ngợi của chồng kích hoạt hormone hạnh phúc Oxytocin, giúp mẹ bầu giảm 65% nguy cơ trầm cảm trước sinh.',
          link: 'https://vinmec.com/',
          tag: 'Gia Đình'
        }
      ],
      question: "Khi vợ đột ngột khóc vì một chuyện rất nhỏ, câu nói nào thể hiện bố chuẩn 10 điểm?",
      choices: [
        { text: "A. 'Có mỗi chuyện thế thôi mà cũng khóc, em nhạy cảm quá rồi đấy!'", correct: false },
        { text: "B. 'Anh ở đây rồi, vợ vất vả nhiều rồi, để anh ôm vợ một chút nhé!'", correct: true },
        { text: "C. 'Thôi nín đi, khóc nhiều ảnh hưởng đến con bây giờ!'", correct: false }
      ]
    },
    massage: {
      badge: "Kỹ Năng Thực Hành",
      title: "Kỹ Thuật Massage Thắt Lưng & Bấm Huyệt Cho Vợ Bầu",
      desc: "Thời lượng: 0:58 min • 3 động tác xoa bóp chuẩn y khoa giúp giảm đau nhức mỏi lưng đến 80%",
      video: {
        title: "Hướng Dẫn Thực Hành: Xoa Bóp Thắt Lưng Vùng L4-L5 & Bắp Chân",
        duration: "2 phút 15 giây",
        source: "Khoa Vật Lý Trị Liệu - Phục Hồi Chức Năng",
        youtubeId: "2v8P6YqW_jY",
        summary: "Khi thai nhi lớn dần, trọng tâm cơ thể mẹ dồn về phía trước kéo căng các nhóm cơ thắt lưng. Bố dùng lòng bàn tay xoa tròn nhẹ nhàng, không ấn lực mạnh vào đốt sống, kết hợp tinh dầu tràm hoặc dầu dừa ấm."
      },
      articles: [
        {
          id: 'art-m1',
          source: 'Báo VnExpress Sức Khỏe',
          date: '07/09/2026',
          title: 'Cách massage giảm đau thắt lưng an toàn tuyệt đối cho mẹ bầu',
          excerpt: 'Bác sĩ sản khoa khuyến cáo các tư thế massage đúng: Mẹ nằm nghiêng sang trái có gối ôm kê bụng, người chồng thao tác nhẹ nhàng dọc theo cơ cạnh sống.',
          link: 'https://vnexpress.net/suc-khoe',
          tag: 'Kỹ Năng Chăm Sóc'
        },
        {
          id: 'art-m2',
          source: 'Cổng Thông Tin Bệnh Viện Từ Dũ',
          date: '02/09/2026',
          title: 'Các huyệt đạo cấm kỵ tuyệt đối không được bấm mạnh khi vợ mang thai',
          excerpt: 'Chồng cần lưu ý tránh ấn mạnh vào các huyệt Hợp Cốc và Tam Âm Giao vì có thể kích thích cơn co tử cung sớm.',
          link: 'https://tudu.com.vn/',
          tag: 'Cảnh Báo Y Khoa'
        }
      ],
      question: "Khi massage thắt lưng cho vợ bầu, bố cần tuân thủ nguyên tắc vàng nào?",
      choices: [
        { text: "A. Dùng lực thật mạnh ấn vào chính giữa các đốt sống lưng để dãn cơ", correct: false },
        { text: "B. Xoa bóp nhẹ nhàng cơ hai bên sống lưng, cho vợ nằm nghiêng trái thoải mái", correct: true },
        { text: "C. Ngồi lên lưng vợ để tạo lực đè tối đa giúp đỡ đau", correct: false }
      ]
    },
    speech: {
      badge: "Giao Tiếp Yêu Thương",
      title: "Từ Điển Giao Tiếp: Những Câu Nói Cấm Kỵ Của Bố",
      desc: "Thời lượng: 0:50 min • Tránh xa những câu nói khiến vợ tổn thương và nghệ thuật xoa dịu tâm lý",
      video: {
        title: "Talkshow Chuyên Gia: Nghệ thuật thấu hiểu & giao tiếp cùng vợ bầu",
        duration: "1 phút 40 giây",
        source: "Viện Nghiên Cứu Tâm Lý Gia Đình",
        youtubeId: "ZbZSe6N_BXs",
        summary: "Người phụ nữ trong thai kỳ rất nhạy cảm về vóc dáng, ngoại hình và sự quan tâm của chồng. Lời nói tích cực của người chồng là liều thuốc an thần tốt nhất cho cả mẹ và thai nhi."
      },
      articles: [
        {
          id: 'art-s1',
          source: 'Báo Phụ Nữ Việt Nam',
          date: '04/09/2026',
          title: 'Top 5 câu nói vô tâm của chồng khiến vợ bầu bật khóc trong đêm',
          excerpt: 'Những câu như \"Người ta mang thai ai cũng thế\", \"Có ở nhà thôi mà cũng mệt\" là nhát dao vô hình phá hủy sự an tâm của người phụ nữ.',
          link: 'https://phunuvietnam.vn/',
          tag: 'Hôn Nhân'
        },
        {
          id: 'art-s2',
          source: 'Tạp Chí Tâm Lý & Sức Khỏe Cộng Đồng',
          date: '01/09/2026',
          title: 'Phương pháp lắng nghe chủ động (Active Listening) dành cho các ông bố',
          excerpt: 'Thay vì vội vàng đưa ra lời khuyên logic, hãy đồng tình với cảm xúc của vợ trước: \"Anh biết em đang rất mệt mỏi, cảm ơn em đã vì gia đình mình\".',
          link: 'https://tamlyhoc.org/',
          tag: 'Tâm Lý Học'
        }
      ],
      question: "Câu nói nào sau đây giúp vợ bầu an tâm và giảm bức bối nhất?",
      choices: [
        { text: "A. 'Ai mang bầu mà chẳng thế, sao em cứ kêu than mãi vậy?'", correct: false },
        { text: "B. 'Hôm nay mẹ thấy trong người thế nào? Để anh phụ vợ cơm nước và bóp chân nhé!'", correct: true },
        { text: "C. 'Anh đi làm cả ngày đau đầu lắm, em đừng nói linh tinh nữa.'", correct: false }
      ]
    },
    hospital_bag: {
      badge: "Chuẩn Bị Thực Tế",
      title: "Checklist Giỏ Đồ Đi Sinh & Quy Trình Nhập Viện Cho Bố",
      desc: "Thời lượng: 0:55 min • Không lo bối rối hay quên đồ lúc vợ bắt đầu có cơn co chuyển dạ",
      video: {
        title: "Video Hướng Dẫn: Soạn Giỏ Đồ Đi Sinh Gọn Gàng & Thủ Tục Nhập Viện",
        duration: "2 phút 05 giây",
        source: "Nữ Hộ Sinh Trưởng BV Phụ Sản Hà Nội",
        youtubeId: "OPf0YbXqDm0",
        summary: "Bố cần chuẩn bị giỏ đồ sẵn từ tuần 34: Giấy tờ tùy thân, BHYT, hồ sơ khám thai định kỳ, tã sơ sinh, quần áo cotton cài cúc cho bé, băng vệ sinh mama cho mẹ và chuẩn bị sẵn xe cộ."
      },
      articles: [
        {
          id: 'art-hb1',
          source: 'Báo Tuổi Trẻ Sức Khỏe',
          date: '06/09/2026',
          title: 'Kinh nghiệm chuẩn bị giỏ đồ đi sinh: Đầy đủ, tinh gọn, không mang vác cồng kềnh',
          excerpt: 'Chi tiết danh mục 12 vật dụng thiết yếu cho mẹ và 8 món đồ cho bé sơ sinh trong 3 ngày đầu tại bệnh viện phụ sản.',
          link: 'https://tuoitre.vn/suc-khoe.htm',
          tag: 'Kinh Nghiệm Đi Sinh'
        },
        {
          id: 'art-hb2',
          source: 'Bệnh Viện Phụ Sản Trung Ương',
          date: '03/09/2026',
          title: 'Dấu hiệu chuyển dạ thực sự và hướng dẫn bố đưa vợ nhập viện đúng lúc',
          excerpt: 'Cách phân biệt cơn gò chuyển dạ thật (đều đặn 5 phút/lần, tăng dần cường độ) với cơn gò sinh lý Braxton-Hicks.',
          link: 'https://benhvienphusantrunguong.org.vn/',
          tag: 'Y Khoa Sản Khoa'
        }
      ],
      question: "Vật dụng quan trọng nhất bố phải luôn để sẵn trong giỏ đồ đi sinh từ tuần 34 là gì?",
      choices: [
        { text: "A. Toàn bộ hồ sơ khám thai, kết quả siêu âm, CCCD và Thẻ BHYT của mẹ", correct: true },
        { text: "B. Đồ chơi thông minh phát nhạc cho bé mới sinh", correct: false },
        { text: "C. Máy tính xách tay để bố làm việc trong phòng sinh", correct: false }
      ]
    }
  };

  const current = topicConfig[topic] || topicConfig.hormone;

  const handleAnswer = (choice) => {
    if (choice.correct) {
      setQuizResult({
        success: true,
        text: "🎉 Chính xác 100%! Bố đã nhận được Huy Hiệu Bố Bỉm Tinh Tế Chuẩn 10 Điểm! 🌟"
      });
    } else {
      setQuizResult({
        success: false,
        text: "⚠️ Chưa đúng rồi bố ơi! Hãy chọn phương án thể hiện sự thấu hiểu và yêu thương nhé."
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-4 border-amber-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase font-cute px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
              {current.badge}
            </span>
            <span className="text-xs font-bold text-amber-600">
              ⭐ Daddy Bootcamp
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center font-bold transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Tiêu đề bài học */}
        <div className="space-y-1 shrink-0">
          <h3 className="text-base sm:text-xl font-black font-cute text-slate-800 leading-tight">
            {current.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {current.desc}
          </p>
        </div>

        {/* 3 Tab Điều Hướng Nội Dung: Video, Báo Chí, Trắc Nghiệm */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-2xl border border-amber-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-black font-cute text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <i className="fa-solid fa-circle-play"></i>
            <span>Video Minh Họa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-black font-cute text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <i className="fa-solid fa-newspaper"></i>
            <span>Báo Chí & Tin Tức ({current.articles?.length || 2})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-black font-cute text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <i className="fa-solid fa-circle-question"></i>
            <span>Test Bố 10 Điểm</span>
          </button>
        </div>

        {/* Nội dung theo Tab (Có thanh cuộn mượt) */}
        <div className="overflow-y-auto flex-grow space-y-4 pr-1">
          
          {/* TAB 1: VIDEO HƯỚNG DẪN MINH HỌA */}
          {activeTab === 'video' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="w-full aspect-video bg-slate-900 rounded-2xl sm:rounded-3xl relative overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner group">
                {isPlayingVideo ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${current.video.youtubeId}?autoplay=1`}
                    title={current.video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/40 via-purple-600/30 to-rose-600/40"></div>
                    <div className="text-center relative z-10 space-y-3 p-4">
                      <div 
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-16 h-16 rounded-full bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center text-2xl mx-auto shadow-2xl hover:scale-110 active:scale-95 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-play ml-1"></i>
                      </div>
                      <div>
                        <h4 className="text-white text-xs sm:text-sm font-black font-cute">
                          {current.video.title}
                        </h4>
                        <p className="text-amber-200 text-[11px] font-semibold mt-0.5">
                          Thời lượng: {current.video.duration} • Nguồn: {current.video.source}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Tóm tắt nội dung video */}
              <div className="p-3.5 sm:p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1 text-xs text-slate-700">
                <span className="font-black font-cute text-amber-900 flex items-center gap-1">
                  <i className="fa-solid fa-lightbulb text-amber-500"></i>
                  <span>Tóm Tắt Khoa Học Nhanh Cho Bố:</span>
                </span>
                <p className="leading-relaxed font-medium">
                  {current.video.summary}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: BÁO CHÍ & BÀI BÁO TIN TỨC LIÊN QUAN */}
          {activeTab === 'articles' && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-xs text-slate-500 font-semibold px-1">
                Các bài viết & thông tin y khoa chính thống từ cơ quan báo chí uy tín liên quan trực tiếp đến nội dung bài học:
              </div>

              <div className="space-y-2.5">
                {current.articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 bg-white rounded-2xl border-2 border-amber-100 hover:border-amber-300 shadow-xs transition hover:shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase font-cute px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md">
                          {art.tag}
                        </span>
                        <span className="text-[11px] font-bold text-amber-800">
                          {art.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {art.date}
                      </span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-black font-cute text-slate-800 leading-snug">
                      {art.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {art.excerpt}
                    </p>

                    <div className="pt-1 flex items-center justify-end">
                      <a
                        href={art.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-black font-cute text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition"
                      >
                        <span>Đọc toàn văn bài báo</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEST BỐ 10 ĐIỂM (MINI QUIZ) */}
          {activeTab === 'quiz' && (
            <div className="p-4 bg-amber-50/90 rounded-2xl border-2 border-amber-200 space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-black font-cute uppercase text-amber-700">
                  Câu Hỏi Tình Huống Thực Tế:
                </span>
                <p className="text-xs sm:text-sm font-black font-cute text-slate-800">
                  {current.question}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {current.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswer(choice)}
                    className="p-3 bg-white rounded-xl border border-slate-200 text-left font-semibold text-slate-700 hover:border-amber-400 transition flex items-start space-x-2 cursor-pointer"
                  >
                    <span>{choice.text}</span>
                  </button>
                ))}
              </div>

              {quizResult && (
                <div className={`p-3 rounded-xl border text-xs font-black font-cute leading-relaxed ${
                  quizResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-700'
                }`}>
                  {quizResult.text}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="pt-2 border-t border-amber-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
            MamaCare • Micro-learning Dành Cho Bố Bỉm
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black font-cute text-xs shadow-xs transition cursor-pointer ml-auto"
          >
            Đóng Bài Giảng
          </button>
        </div>

      </div>
    </div>
  );
}
