import React, { useState, useEffect } from 'react';
import { MamaApi } from '../services/api';
import './HusbandView.css';

export default function HusbandView({ onOpenQr, onOpenBootcamp }) {
  const [syncData, setSyncData] = useState({
    partnerCode: "MAMA-8899",
    momName: "Thùy Trang",
    pregnancyWeek: 24,
    currentMood: "Cực kỳ nhạy cảm",
    weather: "stormy",
    weatherTitle: "Sấm chớp giông bão - Dễ bức bối & Quá tải",
    stressScore: 76,
    fatigueScore: 82,
    lastCheckIn: "Vừa xong",
    actionTip: "Vợ đang bị quá tải và mỏi thắt lưng. Hãy chủ động rửa bát tối nay, chuẩn bị chậu nước ấm ngâm chân và ôm cô ấy thật chặt nhé!"
  });

  const [actionsTaken, setActionsTaken] = useState([]);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    MamaApi.getPartnerSync().then(res => {
      if (res && res.data) {
        setSyncData(res.data);
      }
    });
  }, []);

  const handleAction = async (actionId, label) => {
    setActionsTaken(prev => [...prev, actionId]);
    await MamaApi.sendPartnerAction(actionId, label);
    alert(`💌 Tuyệt vời! Bạn đã gửi yêu thương: "${label}" đến màn hình của vợ.`);
  };

  return (
    <section className="space-y-8">
      {/* Header Banner Giới Thiệu Module Vũ Khí Bí Mật */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-[32px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-white/20 text-blue-100 rounded-full text-xs font-black uppercase font-cute">
                Vũ Khí Bí Mật Của Bố
              </span>
              <span className="text-xs text-blue-200 font-bold">• Đang kết nối với vợ: {syncData.momName} (Tuần {syncData.pregnancyWeek})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cute">Trung Tâm Trợ Thủ & Đồng Bộ Cảm Xúc Của Vợ</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Giúp các ông bố thấu hiểu sự thay đổi tâm sinh lý của vợ bầu, giải mã cơn giận và nhận hướng dẫn hành động cụ thể để trở thành chỗ dựa vững chắc.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQr}
            className="px-5 py-3 bg-white text-blue-600 rounded-2xl font-black font-cute text-xs shadow-md bounce-hover shrink-0 flex items-center space-x-2"
          >
            <i className="fa-solid fa-qrcode text-base"></i>
            <span>Mã QR Ghép Đôi</span>
          </button>
        </div>
      </div>

      {/* MODULE 2.1: ĐỒNG BỘ THỜI TIẾT CẢM XÚC & GỢI Ý CỨU VỢ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Thẻ Thời Tiết Cảm Xúc Của Vợ */}
        <div className="lg:col-span-1">
          <div className={`weather-hero-card ${
            syncData.weather === 'sunny' ? 'weather-hero-sunny' : (syncData.weather === 'rainy' ? 'weather-hero-rainy' : 'weather-hero-stormy')
          } p-6 sm:p-8 shadow-cloud space-y-5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase font-cute px-3 py-1 bg-white/80 rounded-full text-slate-800 shadow-sm">
                Thời Tiết Cảm Xúc Của Vợ
              </span>
              <span className="text-[11px] font-bold text-slate-600">{syncData.lastCheckIn}</span>
            </div>

            <div className="text-center py-4 space-y-2">
              <div className="text-6xl cloud-drift inline-block">
                {syncData.weather === 'sunny' ? '☀️' : (syncData.weather === 'rainy' ? '🌧️' : '⛈️')}
              </div>
              <h3 className="text-xl font-black font-cute text-slate-800">{syncData.weatherTitle}</h3>
              <p className="text-xs text-slate-600 font-semibold px-4">
                Tâm trạng: <strong className="text-rose-600">{syncData.currentMood}</strong>
              </p>
            </div>

            {/* Thước đo áp lực của vợ */}
            <div className="p-4 bg-white/80 rounded-2xl border border-white/60 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Mức độ căng thẳng:</span>
                  <span className="text-rose-600">{syncData.stressScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${syncData.stressScore}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Mức độ mỏi thắt lưng:</span>
                  <span className="text-amber-600">{syncData.fatigueScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${syncData.fatigueScore}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <input
                type="text"
                placeholder="Nhập lời nhắn yêu thương thủ công..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 text-xs font-semibold text-slate-700 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 placeholder:text-slate-400 shadow-inner bg-white/80"
              />
              <button
                type="button"
                onClick={() => {
                  handleAction('hug', customMessage.trim() || 'Gửi cái ôm ấm áp');
                  setCustomMessage('');
                }}
                className="w-full py-3 bg-white text-slate-800 rounded-2xl font-black font-cute text-xs shadow-sm hover:bg-slate-50 bounce-hover flex items-center justify-center space-x-2"
              >
                <span>💌 Gửi Yêu Thương Đến Màn Hình Vợ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gợi Ý Hành Động "Cứu Vợ" */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-blue-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black font-cute text-slate-800 flex items-center gap-2">
                  <span>Gợi Ý Hành Động "Cứu Vợ" Tức Thời</span>
                  <span>🎯</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold">Tự động đề xuất dựa trên cảm xúc & triệu chứng thực tế của vợ hôm nay</p>
              </div>
              <span className="text-xs font-black font-cute px-3 py-1 bg-rose-100 text-rose-700 rounded-full">
                Đang Cần Bố Giúp
              </span>
            </div>

            {/* Banner Lời Khuyên Y Khoa */}
            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border-2 border-rose-200 flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black font-cute uppercase text-rose-700">Lời Khuyên Y Khoa Cho Bố:</h4>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  "{syncData.actionTip}"
                </p>
              </div>
            </div>

            {/* 4 Thao Tác Cụ Thể */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { id: 'dish', tag: 'Việc nhà', title: 'Chủ động rửa bát & dọn bếp 🧼', desc: 'Giúp vợ không phải đứng lâu gây dồn trọng lượng lên thắt lưng và bắp chân.', label: 'Rửa bát tối nay', col: 'rose' },
                { id: 'massage', tag: 'Thư giãn', title: 'Massage thắt lưng 15 phút 💆‍♂️', desc: 'Xoa tròn nhẹ nhàng vùng L4-L5 cùng dầu dừa hoặc tinh dầu tràm ấm.', label: 'Massage thắt lưng', col: 'amber' },
                { id: 'treat', tag: 'Dinh dưỡng', title: 'Mua món bánh/trà sữa vợ thích 🧋', desc: 'Một chút đồ ăn ngon kèm lời nhắn ngọt ngào sẽ làm dịu tâm trạng ngay.', label: 'Mua món vợ thích', col: 'sky' },
                { id: 'walk', tag: 'Gắn kết', title: 'Rủ vợ đi dạo hóng gió mát 🍃', desc: '15 phút đi bộ cùng chồng hít thở không khí trong lành giúp giải tỏa bức bối.', label: 'Rủ đi dạo công viên', col: 'emerald' }
              ].map(action => (
                <div key={action.id} className={`rescue-tip-card p-4 bg-${action.col}-50/70 border-${action.col}-200 flex items-start justify-between space-x-3`}>
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase text-${action.col}-700 bg-${action.col}-100 px-2 py-0.5 rounded-full font-cute`}>
                      {action.tag}
                    </span>
                    <h5 className="text-xs font-black font-cute text-slate-800">{action.title}</h5>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{action.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={actionsTaken.includes(action.id)}
                    onClick={() => handleAction(action.id, action.label)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black font-cute shrink-0 transition ${
                      actionsTaken.includes(action.id)
                        ? 'bg-slate-300 text-white cursor-not-allowed'
                        : `bg-${action.col}-500 hover:bg-${action.col}-600 text-white shadow-sm bounce-click`
                    }`}
                  >
                    {actionsTaken.includes(action.id) ? 'Đã Làm ❤️' : 'Đã Làm'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODULE 2.2: LỚP HỌC LÀM BA (DADDY BOOTCAMP) */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-amber-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black font-cute text-slate-800 flex items-center gap-2">
              <span>Lớp Học Làm Ba (Daddy Bootcamp)</span>
              <span>🎓</span>
            </h3>
            <p className="text-xs text-amber-700 font-semibold">Các bài học Micro-learning dưới 1 phút giải thích khoa học biến động hormone và kỹ năng chăm sóc</p>
          </div>
          <span className="text-xs font-black font-cute px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-300 w-fit">
            ⭐ Huy hiệu Bố Bỉm 10 Điểm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { topic: 'hormone', icon: '🧬', time: '45 giây đọc', title: 'Giải Mã Hormone Estrogen & Progesterone', desc: 'Hiểu vì sao lượng hormone tăng gấp 30 lần khiến vợ siêu nhạy cảm và dễ khóc.', color: 'rose' },
            { topic: 'massage', icon: '💆‍♂️', time: '55 giây video', title: 'Kỹ Thuật Massage Thắt Lưng Cho Vợ', desc: '3 động tác xoa bóp chuẩn y khoa giúp giảm đau nhức mỏi lưng đến 80%.', color: 'amber' },
            { topic: 'speech', icon: '💬', time: '40 giây đọc', title: 'Từ Điển Giao Tiếp: Tránh Câu Nói Cấm Kỵ', desc: 'Những câu nói tuyệt đối không được nói và cách an ủi để vợ luôn an tâm.', color: 'blue' },
            { topic: 'hospital_bag', icon: '🎒', time: '50 giây đọc', title: 'Checklist Giỏ Đồ Đi Sinh Cho Bố', desc: 'Hồ sơ khám thai, đồ sơ sinh, bỉm mẹ và những vật dụng thiết yếu lúc chuyển dạ.', color: 'emerald' }
          ].map(b => (
            <div
              key={b.topic}
              onClick={() => onOpenBootcamp(b.topic)}
              className={`bootcamp-card p-5 bg-gradient-to-tr from-${b.color}-50 to-pink-50 border-2 border-${b.color}-200 space-y-3`}
            >
              <div className={`w-10 h-10 rounded-2xl bg-${b.color}-500 text-white flex items-center justify-center text-lg shadow-sm`}>
                {b.icon}
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase text-${b.color}-600 font-cute`}>{b.time}</span>
                <h4 className="text-xs sm:text-sm font-black font-cute text-slate-800 mt-0.5">{b.title}</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{b.desc}</p>
              <span className={`text-xs font-black font-cute text-${b.color}-600 flex items-center gap-1`}>
                Xem bài giảng <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
