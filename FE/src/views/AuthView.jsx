import React, { useState } from 'react';
import './AuthView.css';
import { MamaApi } from '../services/api';

export default function AuthView({ onAuthSuccess, initialMode = 'login', onCancel }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error' | 'success', text: string }

  // Form states for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states for Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('mom'); // 'mom' | 'husband'
  const [regWeek, setRegWeek] = useState(20);
  const [regDueDate, setRegDueDate] = useState('');
  const [regPartnerCode, setRegPartnerCode] = useState('');

  // Submit standard login form
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAlert({ type: 'error', text: 'Vui lòng nhập Email hoặc Số điện thoại' });
      return;
    }
    if (!loginPassword) {
      setAlert({ type: 'error', text: 'Vui lòng nhập mật khẩu' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await MamaApi.login(loginEmail, loginPassword);
      if (res.success && res.user) {
        setAlert({ type: 'success', text: res.message || 'Đăng nhập thành công!' });
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 500);
      } else {
        setAlert({ type: 'error', text: res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
      }
    } catch {
      setAlert({ type: 'error', text: 'Lỗi kết nối máy chủ cơ sở dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  // Submit register form
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setAlert({ type: 'error', text: 'Vui lòng nhập họ và tên của bạn' });
      return;
    }
    if (!regEmail.trim()) {
      setAlert({ type: 'error', text: 'Vui lòng nhập địa chỉ email' });
      return;
    }
    if (!regPassword || regPassword.length < 3) {
      setAlert({ type: 'error', text: 'Mật khẩu phải có ít nhất 3 ký tự' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
        pregnancyWeek: regRole === 'mom' ? Number(regWeek) : undefined,
        dueDate: regRole === 'mom' ? regDueDate : undefined,
        partnerCode: regRole === 'husband' ? regPartnerCode.trim() : undefined
      };

      const res = await MamaApi.register(payload);
      if (res.success && res.user) {
        setAlert({ type: 'success', text: 'Đăng ký tài khoản thành công! Đang chuyển tiếp...' });
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 600);
      } else {
        setAlert({ type: 'error', text: res.message || 'Đăng ký tài khoản thất bại' });
      }
    } catch {
      setAlert({ type: 'error', text: 'Lỗi kết nối máy chủ cơ sở dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span className="auth-brand-icon">🌸</span>
            <span>MamaCare Portal</span>
          </div>
          <h1 className="auth-title">
            {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Chào mừng bạn quay lại với không gian đồng hành thai kỳ chuẩn y khoa'
              : 'Bắt đầu hành trình theo dõi thai kỳ an yên và kết nối gia đình'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setAlert(null); }}
          >
            🔑 Đăng Nhập
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setAlert(null); }}
          >
            ✨ Đăng Ký Mới
          </button>
        </div>

        {/* Alert notification */}
        {alert && (
          <div className={`auth-alert ${alert.type}`}>
            <span>{alert.type === 'error' ? '⚠️' : '🎉'}</span>
            <span>{alert.text}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="auth-field">
              <label className="auth-label">
                Email hoặc Số Điện Thoại <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Nhập email hoặc số điện thoại của bạn"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Mật Khẩu <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Nhập mật khẩu của bạn"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? '⏳ Đang Xử Lý...' : '🚀 Đăng Nhập'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            {/* Vai trò */}
            <div className="auth-field">
              <label className="auth-label">
                Bạn Đăng Ký Với Tư Cách Là: <span className="required">*</span>
              </label>
              <div className="role-picker-grid">
                <div
                  className={`role-card-opt ${regRole === 'mom' ? 'selected' : ''}`}
                  onClick={() => setRegRole('mom')}
                >
                  <span className="role-opt-emoji">🌸</span>
                  <span className="role-opt-title">Mẹ Bầu</span>
                  <span className="role-opt-desc">Theo dõi tâm lý & nhật ký thai kỳ</span>
                </div>
                <div
                  className={`role-card-opt ${regRole === 'husband' ? 'selected' : ''}`}
                  onClick={() => setRegRole('husband')}
                >
                  <span className="role-opt-emoji">🧸</span>
                  <span className="role-opt-title">Bố Bỉm (Partner)</span>
                  <span className="role-opt-desc">Kết nối & chăm sóc tinh thần mẹ</span>
                </div>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="auth-field">
              <label className="auth-label">
                Họ và Tên <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Ví dụ: Nguyễn Thùy Trang"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="auth-row-2col">
              <div className="auth-field">
                <label className="auth-label">
                  Email <span className="required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="email@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Số Điện Thoại</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📞</span>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="0912345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Mật Khẩu <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Mật khẩu ít nhất 3 ký tự"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Thông tin đặc thù theo vai trò */}
            {regRole === 'mom' ? (
              <div className="auth-conditional-box">
                <div className="auth-field">
                  <label className="auth-label">
                    Tuần Thai Hiện Tại: <strong style={{ color: '#ff6b8b' }}>{regWeek} tuần</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={regWeek}
                    onChange={(e) => setRegWeek(e.target.value)}
                    style={{ width: '100%', accentColor: '#ff6b8b', cursor: 'pointer' }}
                  />
                  <small style={{ color: '#718096', fontSize: '0.78rem' }}>
                    💡 Hệ thống sẽ tự tạo mã ghép đôi riêng để bố bỉm kết nối vào tài khoản của mẹ.
                  </small>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Ngày Dự Sinh (Nếu có):</label>
                  <input
                    type="date"
                    className="auth-input"
                    style={{ paddingLeft: '14px' }}
                    value={regDueDate}
                    onChange={(e) => setRegDueDate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="auth-conditional-box">
                <div className="auth-field">
                  <label className="auth-label">
                    Mã Ghép Đôi Với Vợ / Partner:
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔗</span>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Mã ghép đôi ví dụ: MAMA-8899"
                      value={regPartnerCode}
                      onChange={(e) => setRegPartnerCode(e.target.value)}
                    />
                  </div>
                  <small style={{ color: '#718096', fontSize: '0.78rem' }}>
                    Nhập mã được hiển thị trên tài khoản MamaCare của vợ để đồng bộ thời tiết cảm xúc tức thì.
                  </small>
                </div>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? '⏳ Đang Tạo Tài Khoản...' : '✨ Hoàn Tất Đăng Ký'}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        <div className="auth-footer">
          {mode === 'login' ? (
            <span>
              Chưa có tài khoản MamaCare?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => { setMode('register'); setAlert(null); }}
              >
                Đăng ký ngay tại đây
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản rồi?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => { setMode('login'); setAlert(null); }}
              >
                Đăng nhập ngay
              </button>
            </span>
          )}

          {onCancel && (
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0aec0',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Quay lại trang chính (Trải nghiệm dạng Khách)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
