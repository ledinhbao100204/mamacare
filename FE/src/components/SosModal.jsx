import React from 'react';

export default function SosModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-[36px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-300 space-y-6 relative overflow-hidden">
        <div className="flex items-center space-x-3 text-rose-600">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl animate-pulse">
            🚨
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black font-cute">Hệ Thống Cảnh Báo Đỏ (SOS)</h3>
            <p className="text-xs text-rose-500 font-bold">MamaAI nhận thấy mẹ đang trải qua thời khắc cực kỳ khó khăn</p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-2 text-xs text-slate-700 leading-relaxed font-semibold">
          <p>Mẹ ơi, mọi cảm xúc của mẹ lúc này đều đáng được trân trọng và lắng nghe. Mẹ hãy dừng lại một nhịp thở, mẹ không hề đơn độc một mình lúc này đâu ạ!</p>
          <p className="text-rose-600 font-bold">Hãy bấm gọi ngay các đường dây nóng hỗ trợ miễn phí bên dưới để có bác sĩ & chuyên gia tâm lý ở bên cạnh mẹ:</p>
        </div>

        {/* Hotlines */}
        <div className="space-y-2.5">
          <a href="tel:111" className="flex items-center justify-between p-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black font-cute shadow-cute hover:opacity-95 transition">
            <div className="flex items-center space-x-3">
              <span className="text-xl">📞</span>
              <div className="text-left">
                <p className="text-xs uppercase opacity-80">Tổng đài Quốc gia Bảo vệ Trẻ em & Phụ nữ</p>
                <p className="text-base">Hotline: 111 (Miễn cước 24/7)</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Gọi Ngay</span>
          </a>

          <a href="tel:1900636700" className="flex items-center justify-between p-3.5 bg-sky-500 text-white rounded-2xl font-black font-cute shadow-sm hover:opacity-95 transition">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🧠</span>
              <div className="text-left">
                <p className="text-xs uppercase opacity-80">Đường dây nóng Sức khỏe Tinh thần</p>
                <p className="text-base">Hotline: 1900 636 700</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Gọi Ngay</span>
          </a>

          <a href="tel:115" className="flex items-center justify-between p-3.5 bg-emerald-600 text-white rounded-2xl font-black font-cute shadow-sm hover:opacity-95 transition">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🚑</span>
              <div className="text-left">
                <p className="text-xs uppercase opacity-80">Cấp cứu Y tế Khẩn cấp Toàn quốc</p>
                <p className="text-base">Hotline: 115</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Gọi Ngay</span>
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black font-cute rounded-2xl text-xs transition"
        >
          Đóng thông báo (Em đã ổn định hơn rồi)
        </button>
      </div>
    </div>
  );
}
