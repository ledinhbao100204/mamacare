import React, { useState, useEffect } from 'react';
import { MamaApi } from '../services/api';
import './HusbandView.css';

export default function HusbandView({ currentUser, onUpdateUser, onOpenQr, onOpenBootcamp }) {
  const [syncData, setSyncData] = useState(null);
  const [isPaired, setIsPaired] = useState(false);
  const [loading, setLoading] = useState(true);

  // States ghép đôi & hủy ghép đôi
  const [inputPairCode, setInputPairCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [noticeModal, setNoticeModal] = useState(null);

  const [actionsTaken, setActionsTaken] = useState([]);
  const [customMessage, setCustomMessage] = useState('');

  const userId = currentUser?._id || currentUser?.id || currentUser?.email || 'husband_default';

  // Tải dữ liệu đồng bộ
  const fetchSync = async () => {
    setLoading(true);
    const res = await MamaApi.getPartnerSync(userId);
    if (res && res.success && res.data && res.isPaired !== false) {
      setSyncData(res.data);
      setIsPaired(true);
    } else {
      setSyncData(null);
      setIsPaired(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSync();
  }, [currentUser]);

  // Hành động chăm sóc vợ
  const handleAction = async (actionId, label) => {
    setActionsTaken(prev => [...prev, actionId]);
    await MamaApi.sendPartnerAction(actionId, label);
    setNoticeModal({
      title: 'Đã Gửi Yêu Thương Đến Mẹ Bầu! 💖',
      message: `Hành động: "${label}" đã được gửi tới màn hình của vợ. Vợ chắc chắn sẽ cảm nhận được sự ấm áp từ bạn!`,
      type: 'success'
    });
  };

  // Bố nhập mã để kết nối ghép đôi lại
  const handleConnectPartner = async (e) => {
    if (e) e.preventDefault();
    if (!inputPairCode || !inputPairCode.trim()) {
      setNoticeModal({
        title: 'Chưa Nhập Mã Ghép Đôi',
        message: 'Vui lòng nhập mã do mẹ bầu cung cấp (định dạng MAMA-XXXX).',
        type: 'warning'
      });
      return;
    }

    setIsConnecting(true);
    const res = await MamaApi.connectPartner(userId, inputPairCode.trim().toUpperCase());
    setIsConnecting(false);

    if (res && res.success) {
      setInputPairCode('');
      if (res.user && onUpdateUser) {
        onUpdateUser(res.user);
      }
      await fetchSync();
      setNoticeModal({
        title: 'Ghép Đôi Thành Công! 🎉',
        message: res.message || 'Bạn đã kết nối thành công với mẹ bầu. Mọi cảm xúc và mốc thai kỳ của vợ đã được đồng bộ hóa!',
        type: 'success'
      });
    } else {
      setNoticeModal({
        title: 'Ghép Đôi Thất Bại',
        message: res?.message || 'Không tìm thấy mã ghép đôi này. Vui lòng kiểm tra lại mã từ mẹ bầu!',
        type: 'error'
      });
    }
  };

  // Xác nhận hủy ghép đôi
  const handleConfirmDisconnect = async () => {
    setIsDisconnecting(true);
    const res = await MamaApi.disconnectPartner(userId);
    setIsDisconnecting(false);
    setShowDisconnectModal(false);

    if (res && res.success) {
      if (res.user && onUpdateUser) {
        onUpdateUser(res.user);
      }
      setSyncData(null);
      setIsPaired(false);
      setNoticeModal({
        title: 'Đã Hủy Ghép Đôi Thành Công',
        message: res.message || 'Bạn đã ngắt kết nối với đối tác. Bạn có thể nhập mã mới của mẹ bỉm bất kỳ lúc nào để ghép đôi lại!',
        type: 'info'
      });
    } else {
      setNoticeModal({
        title: 'Lỗi Hủy Ghép Đôi',
        message: res?.message || 'Không thể hủy ghép đôi. Vui lòng thử lại!',
        type: 'error'
      });
    }
  };

  return (
    <section className="space-y-8">
      {/* Header Banner Giới Thiệu Module Vũ Khí Bí Mật */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-[32px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/20 text-blue-100 rounded-full text-xs font-black uppercase font-cute">
                Vũ Khí Bí Mật Của Bố
              </span>
              {isPaired && syncData ? (
                <span className="text-xs text-emerald-200 font-bold flex items-center gap-1 bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đang kết nối: {syncData.momName || 'Vợ Yêu'} (Tuần {syncData.pregnancyWeek || 24}) • Mã: {syncData.partnerCode}
                </span>
              ) : (
                <span className="text-xs text-amber-200 font-bold flex items-center gap-1 bg-amber-900/40 px-3 py-1 rounded-full border border-amber-400/30">
                  <span>🟡</span> Chưa ghép đôi với mẹ bầu nào
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cute">Trung Tâm Trợ Thủ & Đồng Bộ Cảm Xúc Của Vợ</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Giúp các ông bố thấu hiểu sự thay đổi tâm sinh lý của vợ bầu, giải mã cơn giận và nhận hướng dẫn hành động cụ thể để trở thành chỗ dựa vững chắc.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Nút Hủy Ghép Đôi khi đã kết nối */}
            {isPaired && (
              <button
                type="button"
                onClick={() => setShowDisconnectModal(true)}
                className="px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 hover:text-white rounded-2xl font-black font-cute text-xs border border-rose-300/40 backdrop-blur-sm transition flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Ngắt kết nối với mẹ bầu hiện tại để ghép đôi với mã khác"
              >
                <i className="fa-solid fa-link-slash"></i>
                <span>Hủy Ghép Đôi</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenQr}
              className="px-5 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black font-cute text-xs shadow-md bounce-hover flex items-center space-x-2 cursor-pointer"
            >
              <i className="fa-solid fa-qrcode text-base"></i>
              <span>Mã QR Ghép Đôi</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KHU VỰC KẾT NỐI GHÉP ĐÔI (KHI BỐ CHƯA KẾT NỐI HOẶC VỪA HỦY GHÉP ĐÔI)
          ========================================================================= */}
      {!isPaired && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-pink-50 rounded-[32px] p-6 sm:p-8 border-4 border-blue-200 shadow-cloud space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black font-cute">
                <span>🔗</span>
                <span>Kết Nối Đồng Bộ Với Mẹ Bầu</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-cute text-slate-800">
                Nhập Mã Ghép Đôi Để Theo Dõi & Yêu Thương Vợ
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Mỗi mẹ bầu có một mã ghép đôi độc nhất (dạng <strong className="text-rose-600 font-mono">MAMA-XXXX</strong>). Mẹ có thể tìm thấy mã này trong trang Cá Nhân hoặc ở thanh Header. Hãy nhập mã của vợ vào ô dưới đây để cả hai thiết bị kết nối thời gian thực!
              </p>
            </div>

            <form onSubmit={handleConnectPartner} className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  required
                  placeholder="VD: MAMA-8899"
                  value={inputPairCode}
                  onChange={(e) => setInputPairCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-blue-300 focus:border-blue-500 font-mono font-black text-sm uppercase text-slate-800 outline-none shadow-sm placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={isConnecting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black font-cute text-xs shadow-cute bounce-hover flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <i className="fa-solid fa-link"></i>
                <span>{isConnecting ? 'Đang kết nối...' : 'Ghép Đôi Ngay'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 2.1: ĐỒNG BỘ THỜI TIẾT CẢM XÚC & GỢI Ý CỨU VỢ (KHI ĐÃ GHÉP ĐÔI)
          ========================================================================= */}
      {isPaired && syncData && (
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
                <span className="text-[11px] font-bold text-slate-600">{syncData.lastCheckIn || 'Vừa xong'}</span>
              </div>

              <div className="text-center py-4 space-y-2">
                <div className="text-6xl cloud-drift inline-block">
                  {syncData.weather === 'sunny' ? '☀️' : (syncData.weather === 'rainy' ? '🌧️' : '⛈️')}
                </div>
                <h3 className="text-xl font-black font-cute text-slate-800">
                  {syncData.weatherTitle || (syncData.weather === 'storm' ? 'Sấm chớp giông bão - Dễ bức bối' : syncData.weather === 'rain' ? 'Trời mưa - Hơi nhạy cảm & Tủi thân' : 'Nắng ấm dịu êm - Bình an')}
                </h3>
                <p className="text-xs text-slate-600 font-semibold px-4">
                  Tâm trạng: <strong className="text-rose-600">{syncData.currentMood || 'Thư thái'}</strong>
                </p>
              </div>

              {/* Thước đo áp lực của vợ */}
              <div className="p-4 bg-white/80 rounded-2xl border border-white/60 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Mức độ căng thẳng:</span>
                    <span className="text-rose-600">{syncData.stressScore || 65}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${syncData.stressScore || 65}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Mức độ mỏi thắt lưng:</span>
                    <span className="text-amber-600">{syncData.fatigueScore || 70}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${syncData.fatigueScore || 70}%` }}></div>
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
                  className="w-full py-3 bg-white text-slate-800 rounded-2xl font-black font-cute text-xs shadow-sm hover:bg-slate-50 bounce-hover flex items-center justify-center space-x-2 cursor-pointer"
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
                    "{syncData.actionTip || 'Vợ đang cần sự lắng nghe và yêu thương. Bố hãy chủ động massage chân và ôm cô ấy nhé!'}"
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
                  <div key={action.id} className="rescue-tip-card p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between space-x-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-cute">
                        {action.tag}
                      </span>
                      <h5 className="text-xs font-black font-cute text-slate-800">{action.title}</h5>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{action.desc}</p>
                    </div>
                    <button
                      type="button"
                      disabled={actionsTaken.includes(action.id)}
                      onClick={() => handleAction(action.id, action.label)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black font-cute shrink-0 transition cursor-pointer ${
                        actionsTaken.includes(action.id)
                          ? 'bg-slate-300 text-white cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm bounce-click'
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
      )}

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
              className="bootcamp-card p-5 bg-gradient-to-tr from-amber-50/50 to-orange-50/30 border-2 border-amber-200 rounded-2xl space-y-3 cursor-pointer hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm">
                {b.icon}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 font-cute">{b.time}</span>
                <h4 className="text-xs sm:text-sm font-black font-cute text-slate-800 mt-0.5">{b.title}</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{b.desc}</p>
              <span className="text-xs font-black font-cute text-amber-600 flex items-center gap-1">
                Xem bài giảng <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          DIALOG MODAL XÁC NHẬN HỦY GHÉP ĐÔI (CHỈN CHU, KHÔNG DÙNG ALERT)
          ========================================================================= */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-rose-200 space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl shadow-inner">
              💔
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black font-cute text-slate-800">
                Xác Nhận Hủy Ghép Đôi?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn hủy kết nối với mẹ bầu <strong className="text-rose-600 font-bold">{syncData?.momName || 'hiện tại'}</strong>?
              </p>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-[11px] text-rose-700 text-left leading-relaxed">
                💡 <em>Sau khi hủy, ứng dụng sẽ không còn nhận thời tiết cảm xúc của mẹ nữa. Bạn có thể nhập mã của mẹ bỉm bất cứ lúc nào để ghép đôi lại.</em>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="py-3 px-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-black font-cute text-xs transition cursor-pointer"
              >
                Giữ Kết Nối
              </button>
              <button
                type="button"
                disabled={isDisconnecting}
                onClick={handleConfirmDisconnect}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black font-cute text-xs shadow-cute transition cursor-pointer disabled:opacity-50"
              >
                {isDisconnecting ? 'Đang hủy...' : 'Đồng Ý Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG THÔNG BÁO KẾT QUẢ (THAY THẾ ALERT)
          ========================================================================= */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl border-4 border-blue-200 space-y-4 text-center">
            <div className="text-4xl">
              {noticeModal.type === 'success' ? '🎉' : noticeModal.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black font-cute text-slate-800">
                {noticeModal.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {noticeModal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNoticeModal(null)}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black font-cute text-xs shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
