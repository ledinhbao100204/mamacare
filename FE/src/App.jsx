import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MomView from './views/MomView';
import HusbandView from './views/HusbandView';
import AdminView from './views/AdminView';
import AuthView from './views/AuthView';
import SosModal from './components/SosModal';
import QrModal from './components/QrModal';
import BootcampModal from './components/BootcampModal';
import PushToast from './components/PushToast';
import { MamaApi } from './services/api';
import './styles/global.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => MamaApi.getStoredUser());
  const [currentRole, setCurrentRole] = useState(() => {
    const stored = MamaApi.getStoredUser();
    return stored ? stored.role : 'mom';
  });
  const [nodeOnline, setNodeOnline] = useState(false);

  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [bootcampModal, setBootcampModal] = useState({ isOpen: false, topic: 'hormone' });
  const [pushAlert, setPushAlert] = useState(null);

  useEffect(() => {
    MamaApi.checkHealth().then(res => {
      if (res && (res.status === 'ok' || res.status === 'degraded')) {
        setNodeOnline(true);
      }
    });
  }, []);

  const triggerSimulatedAlert = () => {
    setPushAlert({
      title: 'Vợ bạn đang bị quá tải cảm xúc!',
      message: 'Vợ bạn hôm nay đang bị quá tải (Mỏi lưng & Tủi thân). Lời khuyên: Hãy rủ cô ấy đi dạo, mua món cô ấy thích hoặc chủ động rửa bát tối nay nhé!'
    });
    setTimeout(() => {
      setPushAlert(null);
    }, 12000);
  };

  const handlePartnerAction = async (actionId, label) => {
    setPushAlert(null);
    await MamaApi.sendPartnerAction(actionId, label);
    alert(`💌 Tuyệt vời! Bạn đã chọn: "${label}". Đã gửi yêu thương ngọt ngào sang vợ.`);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    // Khi đăng nhập thành công: hiển thị giao diện tùy theo vai trò của người dùng
    setCurrentRole(user.role || 'mom');
  };

  const handleLogout = () => {
    MamaApi.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header điều hướng theo vai trò (khi chưa đăng nhập sẽ không hiện các tab vai trò) */}
      <Header
        nodeOnline={nodeOnline}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onTriggerBell={triggerSimulatedAlert}
      />

      {/* Main Content:
          1. Khi CHƯA ĐĂNG NHẬP: chỉ hiện giao diện Đăng Nhập / Đăng Ký
          2. Khi ĐÃ ĐĂNG NHẬP: hiển thị giao diện tùy theo vai trò (Mẹ Bầu, Bố Bỉm, Admin)
      */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
        {!currentUser ? (
          <AuthView onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {/* Phân hệ Mẹ Bầu */}
            {currentRole === 'mom' && (
              <MomView onTriggerSos={() => setIsSosOpen(true)} />
            )}

            {/* Phân hệ Bố Bỉm (Partner) */}
            {currentRole === 'husband' && (
              <HusbandView
                onOpenQr={() => setIsQrOpen(true)}
                onOpenBootcamp={(topic) => setBootcampModal({ isOpen: true, topic })}
              />
            )}

            {/* Phân hệ Quản Trị Hệ Thống */}
            {currentRole === 'admin' && (
              <AdminView />
            )}
          </>
        )}
      </main>

      {/* Footer chung */}
      <footer className="bg-white/80 border-t-2 border-rose-100 py-6 mt-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌸</span>
            <p className="text-xs text-slate-500 font-bold">
              MamaCare © 2026 • Hệ Sinh Thái Đồng Hành Thai Kỳ & Sức Khỏe Tinh Thần Chuẩn Y Khoa
            </p>
          </div>

          {/* Chỉ hiển thị liên kết nhanh nếu là Admin đã đăng nhập */}
          {currentUser && currentUser.role === 'admin' ? (
            <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
              <button onClick={() => setCurrentRole('mom')} className="hover:text-rose-500">Phân hệ Mẹ</button>
              <button onClick={() => setCurrentRole('husband')} className="hover:text-blue-500">Phân hệ Chồng</button>
              <button onClick={() => setCurrentRole('admin')} className="hover:text-purple-500">Ban Quản Lý</button>
              <span className="text-emerald-600 font-black">• MongoDB Atlas Live</span>
            </div>
          ) : (
            <span className="text-xs text-emerald-600 font-black">
              • MongoDB Atlas Cloud Connected
            </span>
          )}
        </div>
      </footer>

      {/* Modals & Toasts */}
      {currentUser && (
        <>
          <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
          <QrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
          <BootcampModal
            isOpen={bootcampModal.isOpen}
            topic={bootcampModal.topic}
            onClose={() => setBootcampModal({ isOpen: false, topic: 'hormone' })}
          />
          <PushToast
            alertData={pushAlert}
            onDismiss={() => setPushAlert(null)}
            onAction={handlePartnerAction}
          />
        </>
      )}
    </div>
  );
}
