import React, { useState } from 'react';

export default function BootcampModal({ isOpen, topic, onClose }) {
  const [quizResult, setQuizResult] = useState(null);

  if (!isOpen) return null;

  const topicConfig = {
    hormone: {
      badge: "Kiến Thức Hormone",
      title: "Giải Mã Hormone Progesterone & Tâm Trạng Của Vợ",
      desc: "Thời lượng: 0:45 min • Hiểu vì sao vợ dễ khóc vô cớ",
      question: "Khi vợ đột ngột khóc vì tủi thân, câu nói nào thể hiện bố 10 điểm?",
      correctChoice: 1
    },
    massage: {
      badge: "Kỹ Năng Massage",
      title: "3 Động Tác Xoa Bóp Thắt Lưng Cho Vợ Bầu",
      desc: "Thời lượng: 0:58 min • Giảm đau mỏi tức thì đến 80%",
      question: "Khi massage thắt lưng cho vợ, bố nên dùng lực như thế nào?",
      correctChoice: 1
    },
    speech: {
      badge: "Nghệ Thuật Giao Tiếp",
      title: "Những Câu Nói Cứu Nguy Cho Bố Bỉm",
      desc: "Thời lượng: 0:50 min • Tránh xa những câu nói cấm kỵ",
      question: "Câu nói nào sau đây giúp vợ bầu an tâm và giảm bức bối nhất?",
      correctChoice: 1
    },
    hospital_bag: {
      badge: "Chuẩn Bị Đi Sinh",
      title: "Checklist Giỏ Đồ Đi Sinh Chuẩn Chỉnh",
      desc: "Thời lượng: 0:55 min • Không lo quên đồ lúc chuyển dạ",
      question: "Vật dụng quan trọng nhất bố phải chuẩn bị sẵn từ tuần 34 là gì?",
      correctChoice: 1
    }
  };

  const current = topicConfig[topic] || topicConfig.hormone;

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-[36px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-200 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase font-cute px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
            {current.badge}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black font-cute text-slate-800">{current.title}</h3>
          <p className="text-xs text-slate-500 font-semibold">{current.desc}</p>
        </div>

        {/* Video Player Simulator */}
        <div className="w-full aspect-video bg-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-rose-500/20"></div>
          <div className="text-center relative z-10 space-y-2">
            <div className="w-14 h-14 rounded-full bg-white/90 text-amber-600 flex items-center justify-center text-xl mx-auto shadow-lg group-hover:scale-110 transition cursor-pointer">
              <i className="fa-solid fa-play ml-1"></i>
            </div>
            <p className="text-white text-xs font-bold font-cute">Bấm để phát video cô đọng 45 giây</p>
          </div>
        </div>

        {/* Mini-Quiz */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
          <p className="text-xs font-black font-cute text-slate-800">{current.question}</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="p-2.5 bg-white rounded-xl border border-slate-200 text-left font-semibold text-slate-700 hover:border-amber-400 transition"
            >
              A. 'Có mỗi việc ở nhà cũng kêu mệt, em nhạy cảm quá rồi đấy!'
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="p-2.5 bg-white rounded-xl border border-slate-200 text-left font-semibold text-slate-700 hover:border-emerald-400 transition"
            >
              B. 'Anh ở đây rồi, vợ vất vả nhiều rồi, để anh xoa bóp lưng cho vợ nhé!'
            </button>
          </div>
          {quizResult && (
            <p className={`text-xs font-black font-cute ${quizResult.success ? 'text-emerald-600' : 'text-rose-500'}`}>
              {quizResult.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
