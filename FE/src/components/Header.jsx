import React from 'react';

export default function Header({
  nodeOnline,
  currentUser,
  onLogout,
  currentRole,
  setCurrentRole,
  onTriggerBell
}) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b-4 border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-tr from-rose-400 via-pink-300 to-amber-200 flex items-center justify-center text-white shadow-cute bounce-hover border-2 border-white">
            <span className="text-2xl animate-bounce">🍼</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black font-cute tracking-wide bg-gradient-to-r from-rose-500 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                MamaCare
              </span>
              {nodeOnline && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>🍃 MongoDB Database</span>
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs text-slate-400 font-bold">
              Nền Tảng Đồng Hành Thai Kỳ & Sức Khỏe Tinh Thần
            </span>
          </div>
        </div>

        {/* Khu vực chỉ hiển thị KHI ĐÃ ĐĂNG NHẬP */}
        {currentUser ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Nếu là Admin thì được phép chuyển đổi các phân hệ để giám sát */}
            {currentUser.role === 'admin' && (
              <div className="bg-purple-50 p-1 rounded-full flex items-center space-x-1 border border-purple-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setCurrentRole('admin')}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                    currentRole === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-700 hover:text-purple-900'
                  }`}
                >
                  <span>📊 Quản Trị</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRole('mom')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    currentRole === 'mom'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🌸 Mẹ Bầu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRole('husband')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    currentRole === 'husband'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🧸 Bố Bỉm</span>
                </button>
              </div>
            )}

            {/* Huy hiệu vai trò cố định của Mẹ hoặc Bố khi đăng nhập */}
            {currentUser.role === 'mom' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-black">
                <span>🌸</span>
                <span>Phân Hệ Dành Cho Mẹ</span>
              </span>
            )}

            {currentUser.role === 'husband' && (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-xs font-black">
                  <span>🧸</span>
                  <span>Vũ Khí Bí Mật Của Bố</span>
                </span>
                {onTriggerBell && (
                  <button
                    type="button"
                    onClick={onTriggerBell}
                    title="Mô phỏng nhận thông báo chăm sóc vợ"
                    className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 text-sm shadow-sm transition-all"
                  >
                    <i className="fa-solid fa-bell"></i>
                  </button>
                )}
              </div>
            )}

            {/* Thông tin tài khoản người dùng & Nút Đăng xuất */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-full px-3 py-1 shadow-sm">
              <span className="text-xl">{currentUser.avatar || '👤'}</span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-black text-slate-700 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-rose-500 font-bold">
                  {currentUser.role === 'mom' && currentUser.pregnancyWeek
                    ? `Mẹ Bầu • Tuần ${currentUser.pregnancyWeek}`
                    : (currentUser.role === 'husband' && currentUser.partnerCode
                        ? `Bố Bỉm • ${currentUser.partnerCode}`
                        : currentUser.roleName || 'Thành viên')}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Đăng xuất tài khoản"
                className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs shadow-sm transition-all border border-rose-200 cursor-pointer ml-1"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </div>
        ) : (
          /* Khi CHƯA ĐĂNG NHẬP: không hiển thị bất kỳ tab hay nút vai trò nào */
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-black flex items-center gap-1.5">
              <span>🔒</span>
              <span>Cổng Đăng Nhập Hệ Thống</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
