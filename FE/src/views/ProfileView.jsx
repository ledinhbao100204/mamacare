import React, { useState, useEffect } from 'react';
import { MamaApi } from '../services/api';

export default function ProfileView({ currentUser, onUpdateUser, onBack }) {
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '🌸',
    role: currentUser?.role || 'mom',
    roleName: currentUser?.roleName || 'Mẹ Bầu',
    pregnancyWeek: currentUser?.pregnancyWeek || 24,
    dueDate: currentUser?.dueDate || '2026-12-25',
    partnerCode: currentUser?.partnerCode || 'MAMA-8899'
  });

  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [inputPairCode, setInputPairCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saveSuccessDialog, setSaveSuccessDialog] = useState(null);

  const availableAvatars = ['🌸', '🤰', '🥰', '🎀', '👸', '🍼', '👶', '🧸', '👨‍👩‍👦', '🩺', '🌿', '✨'];

  // Tải dữ liệu Profile và trạng thái ghép đôi từ MongoDB
  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await MamaApi.getProfile(currentUser?.id || currentUser?._id);
      if (res && res.success && res.user) {
        setProfile(prev => ({
          ...prev,
          ...res.user,
          partnerCode: res.user.partnerCode || prev.partnerCode
        }));
        setPartnerInfo(res.partner);
        setIsPaired(res.isPaired);
      }
    } catch (err) {
      console.error('Lỗi tải profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  // Sao chép mã ghép đôi
  const handleCopyCode = () => {
    if (!profile.partnerCode) return;
    navigator.clipboard.writeText(profile.partnerCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Tạo mã ghép đôi mới cho Mẹ Bầu
  const handleGenerateNewCode = async () => {
    const confirmGen = window.confirm(
      'Mẹ có chắc muốn tạo mã ghép đôi mới? Bố bỉm sẽ cần nhập mã mới này để tiếp tục kết nối đồng bộ.'
    );
    if (!confirmGen) return;

    try {
      const res = await MamaApi.generatePairCode(currentUser?.id || currentUser?._id);
      if (res && res.success) {
        setProfile(prev => ({ ...prev, partnerCode: res.partnerCode }));
        if (onUpdateUser && res.user) onUpdateUser(res.user);
        setSaveSuccessDialog({
          title: 'Đã Tạo Mã Ghép Đôi Mới! ✨',
          message: `Mã ghép đôi mới của mẹ là: ${res.partnerCode}. Hãy chia sẻ mã này cho Bố Bỉm nhé!`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bố bỉm liên kết mã với mẹ bầu
  const handleConnectPartnerSubmit = async (e) => {
    e.preventDefault();
    if (!inputPairCode.trim()) return;

    setIsConnecting(true);
    try {
      const res = await MamaApi.connectPartner(currentUser?.id || currentUser?._id, inputPairCode.trim());
      if (res && res.success) {
        setPartnerInfo(res.partner);
        setIsPaired(true);
        setProfile(prev => ({ ...prev, partnerCode: res.partnerCode }));
        if (onUpdateUser && res.user) onUpdateUser(res.user);
        setInputPairCode('');
        setSaveSuccessDialog({
          title: 'Ghép Đôi Thành Công! 🎉',
          message: `Chúc mừng bạn đã kết nối thành công với mẹ bầu ${res.partner?.name || ''}! Mọi cảm xúc và dữ liệu thai kỳ sẽ được đồng bộ tự động.`
        });
      } else {
        setSaveSuccessDialog({
          title: 'Không Thể Kết Nối',
          message: res?.message || 'Không tìm thấy mẹ bầu với mã này. Mời bạn kiểm tra lại mã!'
        });
      }
    } catch (err) {
      setSaveSuccessDialog({
        title: 'Lỗi Khi Kết Nối',
        message: err.message || 'Không thể kết nối đến máy chủ.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Hủy ghép đôi cho Bố Bỉm
  const handleDisconnectPartner = async () => {
    setIsDisconnecting(true);
    try {
      const res = await MamaApi.disconnectPartner(currentUser?.id || currentUser?._id);
      if (res && res.success) {
        setIsPaired(false);
        setPartnerInfo(null);
        setProfile(prev => ({ ...prev, partnerCode: '' }));
        if (onUpdateUser && res.user) onUpdateUser(res.user);
        setSaveSuccessDialog({
          title: 'Đã Hủy Ghép Đôi Thành Công! 💔',
          message: res.message || 'Bạn đã ngắt kết nối với đối tác. Bạn có thể nhập mã của mẹ bỉm khác để ghép đôi lại bất cứ lúc nào.'
        });
      } else {
        setSaveSuccessDialog({
          title: 'Thông Báo',
          message: res?.message || 'Có lỗi xảy ra khi hủy ghép đôi.'
        });
      }
    } catch (err) {
      setSaveSuccessDialog({
        title: 'Lỗi Hủy Ghép Đôi',
        message: err.message || 'Không thể kết nối đến máy chủ.'
      });
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectConfirm(false);
    }
  };

  // Lưu thông tin cá nhân
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await MamaApi.updateProfile({
        userId: currentUser?.id || currentUser?._id,
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
        pregnancyWeek: profile.pregnancyWeek,
        dueDate: profile.dueDate
      });

      if (res && res.success) {
        if (onUpdateUser && res.user) onUpdateUser(res.user);
        setSaveSuccessDialog({
          title: 'Cập Nhật Hồ Sơ Thành Công! 💖',
          message: 'Thông tin cá nhân và mốc thai kỳ của bạn đã được lưu an toàn lên hệ thống.'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header thanh điều hướng quay lại */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-[24px] border-2 border-rose-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shadow-xs cursor-pointer"
            title="Quay lại phân hệ"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black font-cute text-slate-800 flex items-center gap-2">
              <span>Hồ Sơ Cá Nhân & Ghép Đôi Gia Đình</span>
              <span className="text-xl">💍</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý tài khoản, thông tin thai kỳ và mã kết nối đồng bộ giữa Mẹ Bầu & Bố Bỉm
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="hidden sm:inline-flex px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold font-cute text-xs rounded-xl shadow-xs bounce-hover items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-house"></i>
          <span>Về Phân Hệ Chính</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: THẺ TÀI KHOẢN & AVATAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-6 shadow-cloud border-4 border-rose-100 text-center space-y-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-pink-100/50 rounded-full blur-xl pointer-events-none"></div>

            {/* Avatar lớn kèm nút đổi */}
            <div className="relative inline-block mx-auto pt-2">
              <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-rose-400 via-pink-300 to-amber-200 flex items-center justify-center text-5xl shadow-cute border-4 border-white ring-4 ring-rose-100">
                {profile.avatar}
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-200 flex items-center justify-center text-xs shadow-sm transition cursor-pointer"
                title="Thay đổi biểu tượng đại diện"
              >
                <i className="fa-solid fa-pen"></i>
              </button>
            </div>

            {/* Chọn Avatar Popup */}
            {showAvatarPicker && (
              <div className="p-3 bg-rose-50 rounded-2xl border-2 border-rose-200 space-y-2 animate-fade-in">
                <span className="text-[11px] font-black font-cute text-rose-800 block">Chọn biểu tượng yêu thích:</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {availableAvatars.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        setProfile(prev => ({ ...prev, avatar: av }));
                        setShowAvatarPicker(false);
                      }}
                      className={`w-9 h-9 rounded-xl bg-white hover:bg-rose-200 text-lg flex items-center justify-center transition ${
                        profile.avatar === av ? 'ring-2 ring-rose-500 scale-110' : ''
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-black font-cute text-slate-800">{profile.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs font-black font-cute px-3 py-1 bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                  {profile.role === 'mom' ? '🌸 Mẹ Bầu' : profile.role === 'husband' ? '🧸 Bố Bỉm' : '🛡️ Quản Trị Viên'}
                </span>
                {profile.role === 'mom' && (
                  <span className="text-xs font-black font-cute px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    Tuần {profile.pregnancyWeek}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold font-cute">Email tài khoản:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold font-cute">Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{profile.phone || 'Chưa cập nhật'}</span>
              </div>
              {profile.role === 'mom' && (
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold font-cute">Ngày dự sinh:</span>
                  <span className="font-semibold text-rose-600 font-cute">
                    {profile.dueDate ? new Date(profile.dueDate).toLocaleDateString('vi-VN') : '25/12/2026'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: MÃ GHÉP ĐÔI & FORM CHỈNH SỬA PROFILE */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. KHU VỰC MÃ GHÉP ĐÔI RIÊNG BIỆT (CORE REQUIREMENT) */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 shadow-cloud border-4 border-rose-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black font-cute text-slate-800 flex items-center gap-2">
                  <span>Mã Ghép Đôi Kết Nối Bố & Mẹ</span>
                  <span className="text-rose-500">💕</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Mỗi mẹ bầu sở hữu một mã định danh độc nhất để đồng bộ thời gian thực sang thiết bị của Bố Bỉm
                </p>
              </div>

              {/* Trạng thái kết nối */}
              <span className={`px-3 py-1 rounded-full text-xs font-black font-cute flex items-center gap-1.5 self-start sm:self-auto ${
                isPaired
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <span>{isPaired ? '🟢' : '🟡'}</span>
                <span>{isPaired ? 'Đã Ghép Đôi Thành Công' : 'Đang Chờ Bố Kết Nối'}</span>
              </span>
            </div>

            {/* HIỂN THỊ MÃ CHO MẸ BẦU */}
            {profile.role === 'mom' ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 p-5 rounded-2xl border-2 border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 font-cute">
                      Mã Ghép Đôi Của Bạn:
                    </span>
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-800 bg-white px-4 py-1.5 rounded-xl border-2 border-rose-300 shadow-inner">
                        {profile.partnerCode || 'MAMA-8899'}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className={`px-3 py-2 rounded-xl text-xs font-black font-cute transition flex items-center gap-1 shadow-xs cursor-pointer ${
                          copySuccess
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                        title="Sao chép mã vào bộ nhớ tạm"
                      >
                        <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                        <span>{copySuccess ? 'Đã chép!' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleGenerateNewCode}
                      className="px-3.5 py-2.5 bg-white hover:bg-rose-100 text-rose-700 font-bold font-cute text-xs rounded-xl border border-rose-300 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Cấp mã ngẫu nhiên mới"
                    >
                      <i className="fa-solid fa-arrows-rotate"></i>
                      <span>Tạo Mã Mới</span>
                    </button>
                  </div>
                </div>

                {/* Thẻ thông tin Bố Bỉm đã ghép đôi hoặc hướng dẫn */}
                {isPaired && partnerInfo ? (
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{partnerInfo.avatar || '🧸'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-black font-cute text-emerald-900">
                            {partnerInfo.name || 'Bố Bỉm'}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full font-bold">
                            Đang Đồng Bộ
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          SĐT: {partnerInfo.phone || '0977223344'} • Mọi check-in cảm xúc của mẹ đều tự động gửi sang bố.
                        </p>
                      </div>
                    </div>
                    <span className="text-xl">💖</span>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                    <span className="text-xl mt-0.5">💡</span>
                    <div className="space-y-1">
                      <p className="font-bold font-cute">Cách kết nối nhanh với Bố Bỉm:</p>
                      <p className="text-slate-600 leading-relaxed">
                        Mẹ hãy gửi mã <strong>{profile.partnerCode || 'MAMA-8899'}</strong> cho anh xã. Bố chỉ cần đăng nhập tài khoản của bố, vào trang cá nhân và nhập mã này vào để cả 2 thiết bị kết nối với nhau.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* DÀNH CHO BỐ BỈM HOẶC QUẢN TRỊ VIÊN */
              <div className="space-y-4">
                {isPaired && partnerInfo ? (
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{partnerInfo.avatar || '🌸'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black font-cute text-emerald-900">
                            Đã ghép đôi với vợ yêu: {partnerInfo.name || 'Mẹ Bầu'}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full font-bold">
                            Tuần {partnerInfo.pregnancyWeek || 24}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Mã kết nối hiện tại: <span className="font-mono font-black">{profile.partnerCode}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-black font-cute transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-300"
                        title="Hủy ghép đôi với mẹ bỉm hiện tại"
                      >
                        <i className="fa-solid fa-heart-crack"></i>
                        <span>Hủy Ghép Đôi</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConnectPartnerSubmit} className="p-4 bg-blue-50/80 rounded-2xl border-2 border-blue-200 space-y-3">
                    <div>
                      <h4 className="text-xs font-black font-cute text-blue-900 uppercase">
                        Nhập Mã Ghép Đôi Của Mẹ Bầu:
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Nhập mã do vợ cung cấp (dạng MAMA-XXXX) để nhận thông tin cảm xúc & sức khỏe thai kỳ.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        placeholder="VD: MAMA-8899"
                        value={inputPairCode}
                        onChange={(e) => setInputPairCode(e.target.value)}
                        className="flex-grow p-2.5 uppercase font-mono font-black text-sm bg-white rounded-xl border border-blue-300 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={isConnecting}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black font-cute text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-link"></i>
                        <span>{isConnecting ? 'Đang kết nối...' : 'Kết Nối Ngay'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* 2. FORM CHỈNH SỬA THÔNG TIN CÁ NHÂN */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 shadow-cloud border-4 border-rose-100 space-y-5">
            <div className="border-b border-rose-100 pb-3">
              <h2 className="text-base sm:text-lg font-black font-cute text-slate-800 flex items-center gap-2">
                <span>Chỉnh Sửa Thông Tin Cá Nhân</span>
                <span className="text-base">📝</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cập nhật họ tên, số điện thoại liên lạc và các chỉ số thai kỳ chính xác
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div className="space-y-1">
                  <label className="text-xs font-black font-cute text-slate-700 uppercase">Họ và Tên:</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 text-xs font-bold text-slate-800 outline-none transition"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1">
                  <label className="text-xs font-black font-cute text-slate-700 uppercase">Số Điện Thoại:</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    placeholder="VD: 0388558698"
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 text-xs font-bold text-slate-800 outline-none transition"
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-1">
                  <label className="text-xs font-black font-cute text-slate-700 uppercase">Email Đăng Nhập:</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Vai trò */}
                <div className="space-y-1">
                  <label className="text-xs font-black font-cute text-slate-700 uppercase">Vai Trò Hệ Thống:</label>
                  <input
                    type="text"
                    disabled
                    value={profile.roleName || (profile.role === 'mom' ? 'Mẹ Bầu' : 'Bố Bỉm')}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Tuần thai kỳ (chỉ hiện cho mẹ) */}
                {profile.role === 'mom' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-black font-cute text-slate-700 uppercase">Tuần Thai Kỳ Hiện Tại:</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="42"
                          value={profile.pregnancyWeek}
                          onChange={(e) => setProfile({ ...profile, pregnancyWeek: parseInt(e.target.value, 10) || 12 })}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 text-xs font-black font-cute text-rose-600 outline-none transition"
                        />
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Tuần thai</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black font-cute text-slate-700 uppercase">Ngày Dự Sinh (Dự Kiến):</label>
                      <input
                        type="date"
                        value={profile.dueDate ? profile.dueDate.slice(0, 10) : '2026-12-25'}
                        onChange={(e) => setProfile({ ...profile, dueDate: e.target.value })}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 text-xs font-bold text-slate-800 outline-none transition"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-5 py-3 rounded-xl text-xs font-bold font-cute text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 hover:from-rose-600 hover:to-pink-600 text-white font-black font-cute text-xs sm:text-sm rounded-xl shadow-cute bounce-hover transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>{isSaving ? 'Đang Lưu...' : 'Lưu Cập Nhật Hồ Sơ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* DIALOG THÔNG BÁO THÀNH CÔNG */}
      {saveSuccessDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSaveSuccessDialog(null)}
        >
          <div 
            className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl border-4 border-rose-100 text-center space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center text-2xl shadow-md">
              💖
            </div>
            <h3 className="text-base font-black font-cute text-slate-800">
              {saveSuccessDialog.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {saveSuccessDialog.message}
            </p>
            <button
              type="button"
              onClick={() => setSaveSuccessDialog(null)}
              className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black font-cute text-xs rounded-xl shadow-xs bounce-hover cursor-pointer"
            >
              Đồng Ý ✨
            </button>
          </div>
        </div>
      )}
      {/* DIALOG XÁC NHẬN HỦY GHÉP ĐÔI */}
      {showDisconnectConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !isDisconnecting && setShowDisconnectConfirm(false)}
        >
          <div 
            className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl border-4 border-rose-100 text-center space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl shadow-xs">
              💔
            </div>
            <h3 className="text-base font-black font-cute text-slate-800">
              Xác Nhận Hủy Ghép Đôi?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Bạn có chắc muốn hủy kết nối đồng bộ với mẹ bỉm <strong className="text-slate-800">{partnerInfo?.name || 'hiện tại'}</strong>? Sau khi hủy, bạn có thể nhập mã của mẹ bỉm khác để ghép đôi lại.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDisconnecting}
                onClick={() => setShowDisconnectConfirm(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold font-cute text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Giữ Lại
              </button>
              <button
                type="button"
                disabled={isDisconnecting}
                onClick={handleDisconnectPartner}
                className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black font-cute text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDisconnecting ? 'Đang Hủy...' : 'Hủy Ghép Đôi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
