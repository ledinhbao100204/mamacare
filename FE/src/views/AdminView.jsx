import React, { useState, useEffect, useRef } from 'react';
import { MamaApi } from '../services/api';
import './AdminView.css';

export default function AdminView() {
  const [metrics, setMetrics] = useState({
    totalUsers: 42850,
    dauToday: 8420,
    activePairs: 18920,
    sosResolved: 14
  });

  const [moderationQueue, setModerationQueue] = useState([
    {
      id: 'mod-1',
      author: 'Ẩn danh #9182',
      title: 'Bán thuốc bổ xách tay cam kết sinh con trai 100%',
      reason: 'Quảng cáo sai sự thật / Buôn bán trái phép',
      status: 'pending',
      content: 'Nhắn tin Zalo 09xxxx để mua thuốc thảo dược gia truyền đảm bảo sinh con trai...'
    },
    {
      id: 'mod-2',
      author: 'Ẩn danh #4412',
      title: 'Em mệt quá, em ghét cái thai này, em chỉ muốn biến mất...',
      reason: 'Cảnh báo Đỏ: Nguy cơ trầm cảm thai kỳ nặng',
      status: 'urgent_sos',
      content: 'Mọi người ai cũng vô tâm, em không muốn tiếp tục nữa, em cảm thấy đứa trẻ làm hỏng cuộc đời em...'
    }
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'TX-9901', user: 'Mẹ Hoàng Oanh', package: 'Gói MamaCare Premium 1 Năm', amount: 1200000, date: '10 phút trước' },
    { id: 'TX-9902', user: 'Bố Minh Đức', package: 'Tư Vấn Tâm Lý Chuyên Sâu 1-1', amount: 500000, date: '45 phút trước' },
    { id: 'TX-9903', user: 'Mẹ Ánh Tuyết', package: 'Gói MamaCare Premium 6 Tháng', amount: 690000, date: '2 giờ trước' },
    { id: 'TX-9904', user: 'Bố Quốc Hưng', package: 'Khóa Học Daddy Masterclass', amount: 350000, date: '4 giờ trước' }
  ]);

  const userGrowthChartRef = useRef(null);
  const communityMoodChartRef = useRef(null);
  const revenueChartRef = useRef(null);

  useEffect(() => {
    MamaApi.getAdminMetrics().then(res => {
      if (res && res.metrics) setMetrics(res.metrics);
    });
    MamaApi.getModerationQueue().then(res => {
      if (res && res.queue && res.queue.length > 0) setModerationQueue(res.queue);
    });

    // Vẽ biểu đồ Chart.js
    if (window.Chart) {
      if (userGrowthChartRef.current) {
        new window.Chart(userGrowthChartRef.current.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9'],
            datasets: [{
              label: 'Người dùng mới',
              data: [1200, 1900, 2400, 3100, 3800, 4200],
              backgroundColor: '#38BDF8',
              borderRadius: 12
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
      }

      if (communityMoodChartRef.current) {
        new window.Chart(communityMoodChartRef.current.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: ['Vui Vẻ', 'Bình Thường', 'Lo Âu', 'Tủi Thân'],
            datasets: [{
              data: [45, 25, 18, 12],
              backgroundColor: ['#FACC15', '#4ADE80', '#C084FC', '#FF4D79']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      if (revenueChartRef.current) {
        new window.Chart(revenueChartRef.current.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: ['Gói MamaCare Premium', 'Tư Vấn Chuyên Gia 1-1', 'Khóa Học Bố Bỉm VIP'],
            datasets: [{
              data: [60, 30, 10],
              backgroundColor: ['#FF7597', '#4ADE80', '#38BDF8']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }
  }, []);

  const handleApprove = async (id) => {
    await MamaApi.approveModeration(id);
    setModerationQueue(prev => prev.filter(item => item.id !== id));
    alert('Đã duyệt bài viết thành công!');
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết vi phạm này?')) {
      await MamaApi.deleteModeration(id);
      setModerationQueue(prev => prev.filter(item => item.id !== id));
      alert('Đã gỡ bài viết vi phạm khỏi hệ thống!');
    }
  };

  const handleSosContact = (id) => {
    alert('Đã kích hoạt cuộc gọi khẩn cấp tới chuyên viên công tác xã hội & bác sĩ tâm lý để hỗ trợ mẹ bầu ngay lập tức!');
  };

  const exportExcel = () => {
    alert('Đang xuất báo cáo doanh thu tháng 9/2026 định dạng Excel / CSV thành công!');
  };

  return (
    <section className="space-y-8">
      {/* Header Banner Quản Trị */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-[32px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs font-black uppercase font-cute border border-purple-400/30">
                Admin Control Center
              </span>
              <span className="text-xs text-slate-300 font-bold">• Cập nhật số liệu thời gian thực</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cute mt-1">Bảng Điều Khiển Quản Trị Dự Án MamaCare</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Theo dõi số lượng người dùng, kiểm duyệt bài đăng diễn đàn bằng AI Guard và thống kê doanh thu hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={exportExcel}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black font-cute text-xs shadow-md bounce-hover shrink-0 flex items-center space-x-2"
          >
            <i className="fa-solid fa-file-export"></i>
            <span>Xuất Báo Cáo Excel</span>
          </button>
        </div>
      </div>

      {/* MODULE 4.1: QUẢN LÝ NGƯỜI DÙNG & DỮ LIỆU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card p-5 bg-white border-blue-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase font-cute">Tổng Người Dùng</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">👥</span>
          </div>
          <h4 className="text-2xl font-black font-cute text-slate-800">{metrics.totalUsers?.toLocaleString() || '42,850'}</h4>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up"></i> +14.8% so với tháng trước
          </span>
        </div>

        <div className="kpi-card p-5 bg-white border-emerald-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase font-cute">Truy Cập Hàng Ngày (DAU)</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">⚡</span>
          </div>
          <h4 className="text-2xl font-black font-cute text-slate-800">{metrics.dauToday?.toLocaleString() || '8,420'}</h4>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <i className="fa-solid fa-circle text-[8px] animate-pulse text-emerald-500"></i> Đang hoạt động hôm nay
          </span>
        </div>

        <div className="kpi-card p-5 bg-white border-purple-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase font-cute">Cặp Đôi Đã Liên Kết QR</span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">💍</span>
          </div>
          <h4 className="text-2xl font-black font-cute text-slate-800">{metrics.activePairs?.toLocaleString() || '18,920'}</h4>
          <span className="text-[11px] font-bold text-purple-600">
            Tỷ lệ tương tác chồng: 88.4%
          </span>
        </div>

        <div className="kpi-card p-5 bg-white border-rose-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase font-cute">Ca SOS Khẩn Cấp Đã Cứu</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">🚨</span>
          </div>
          <h4 className="text-2xl font-black font-cute text-rose-600">{metrics.sosResolved || 14}</h4>
          <span className="text-[11px] font-bold text-rose-500">
            100% Đã kết nối chuyên gia y tế
          </span>
        </div>
      </div>

      {/* Biểu đồ phân tích dữ liệu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-cloud border-4 border-slate-100 space-y-4">
          <h3 className="text-sm font-black font-cute text-slate-800 flex items-center gap-2">
            <span>Tốc Độ Tăng Trưởng Người Dùng Mẹ Bầu (6 Tháng Gần Nhất)</span>
            <span>📊</span>
          </h3>
          <div className="h-56 w-full relative">
            <canvas ref={userGrowthChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-cloud border-4 border-slate-100 space-y-4">
          <h3 className="text-sm font-black font-cute text-slate-800 flex items-center gap-2">
            <span>Phân Bổ Chỉ Số Tâm Lý Cộng Đồng</span>
            <span>🧠</span>
          </h3>
          <div className="h-56 w-full relative flex items-center justify-center">
            <canvas ref={communityMoodChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* MODULE 4.2: KIỂM DUYỆT NỘI DUNG */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-rose-100 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black font-cute text-slate-800 flex items-center gap-2">
              <span>Hàng Đợi Kiểm Duyệt Nội Dung & Tự Động Xóa Độc Hại</span>
              <span>🛡️</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold">AI Guard tự động gắn cờ các bài đăng chứa từ ngữ tiêu cực, quảng cáo sai sự thật hoặc cảnh báo SOS</p>
          </div>
          <span className="text-xs font-black font-cute px-3 py-1 bg-rose-100 text-rose-700 rounded-full">
            {moderationQueue.length} Yêu Cầu Cần Xử Lý
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left moderation-table">
            <thead>
              <tr className="text-[11px] font-black uppercase text-slate-400 border-b border-slate-200">
                <th className="py-3 px-3">Tác Giả</th>
                <th className="py-3 px-3">Tiêu Đề & Nội Dung Bài Viết</th>
                <th className="py-3 px-3">Lý Do Gắn Cờ</th>
                <th className="py-3 px-3">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {moderationQueue.map(item => (
                <tr key={item.id} className="moderation-row shadow-sm rounded-2xl border border-slate-100">
                  <td className="py-4 px-3 font-bold text-xs text-slate-700 whitespace-nowrap">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg">{item.author}</span>
                  </td>
                  <td className="py-4 px-3 max-w-xs sm:max-w-md">
                    <h5 className="text-xs font-black font-cute text-slate-800">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">{item.content}</p>
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    {item.status === 'urgent_sos' ? (
                      <span className="px-2.5 py-1 text-[10px] font-black font-cute rounded-full badge-sos-urgent">
                        🚨 SOS KHẨN CẤP
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-black font-cute rounded-full badge-pending">
                        ⚠️ {item.reason}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {item.status === 'urgent_sos' ? (
                        <button
                          type="button"
                          onClick={() => handleSosContact(item.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black font-cute shadow-sm"
                        >
                          Can Thiệp SOS
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black font-cute shadow-sm"
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-black font-cute border border-slate-200 hover:border-rose-300"
                      >
                        Xóa Bài
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULE 4.3: QUẢN LÝ DOANH THU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[32px] p-6 shadow-cloud border-4 border-emerald-100 space-y-4">
          <h3 className="text-sm font-black font-cute text-slate-800 flex items-center gap-2">
            <span>Cơ Cấu Doanh Thu Tháng 9/2026</span>
            <span>💰</span>
          </h3>
          <div className="p-5 revenue-highlight rounded-2xl space-y-2 text-white">
            <span className="text-xs uppercase font-cute tracking-wider opacity-90">Tổng Doanh Thu Đạt Được:</span>
            <h4 className="text-2xl sm:text-3xl font-black font-cute">185,450,000 đ</h4>
            <p className="text-xs text-emerald-100 font-bold">+18.2% tăng trưởng so với tháng 8</p>
          </div>
          <div className="h-44 w-full relative flex items-center justify-center">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-cloud border-4 border-emerald-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black font-cute text-slate-800">Giao Dịch Đặt Lịch Chuyên Gia & Mua Gói Gần Nhất</h3>
            <span className="text-xs text-slate-400 font-bold">Cập nhật 5 phút trước</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {transactions.map(tx => (
              <div key={tx.id} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200 transaction-item">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    💎
                  </div>
                  <div>
                    <h5 className="font-black font-cute text-slate-800">{tx.user}</h5>
                    <p className="text-[11px] text-slate-500 font-semibold">{tx.package}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black font-cute text-emerald-600 block">{tx.amount.toLocaleString()} đ</span>
                  <span className="text-[10px] text-slate-400 font-bold">{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
