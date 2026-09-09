import React from 'react';

export default function QrModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-[36px] max-w-sm w-full p-6 sm:p-8 shadow-2xl border-4 border-blue-200 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
          📱
        </div>
        <div>
          <h3 className="text-xl font-black font-cute text-slate-800">Mã QR Kết Nối Cặp Đôi</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Đưa điện thoại của vợ để quét hoặc nhập mã ghép đôi</p>
        </div>

        {/* QR Simulator */}
        <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center space-y-2">
          <div className="w-44 h-44 bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200 flex items-center justify-center">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MAMACARE-SYNC-8899"
              alt="QR Code Link"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs font-black font-cute text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            MÃ: MAMA-8899
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-black font-cute rounded-2xl text-xs shadow-sm"
        >
          Đã Ghép Đôi Xong ✨
        </button>
      </div>
    </div>
  );
}
