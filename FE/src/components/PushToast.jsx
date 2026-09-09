import React from 'react';

export default function PushToast({ alertData, onDismiss, onAction }) {
  if (!alertData) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-[92%] sm:w-[420px] toast-animate">
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-[28px] p-5 shadow-2xl border-2 border-rose-400/80 backdrop-blur-xl space-y-3 relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center text-xl shadow-md bell-ring">
              🔔
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-300 font-cute">MamaCare Push Alert</span>
                <span className="text-[10px] bg-rose-500/40 text-rose-200 px-2 py-0.5 rounded-full font-bold">Thời gian thực</span>
              </div>
              <h4 className="text-sm font-black font-cute text-white">{alertData.title}</h4>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white text-lg"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p className="text-xs text-rose-100/90 font-medium leading-relaxed bg-white/10 p-3 rounded-2xl border border-white/15">
          "{alertData.message}"
        </p>

        {/* Quick Action Buttons for Husband */}
        <div className="pt-1 flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => onAction('dish', 'Tối nay anh chủ động rửa bát')}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-cute shadow-sm bounce-click"
          >
            🧼 Tối nay anh rửa bát
          </button>
          <button
            type="button"
            onClick={() => onAction('milk_tea', 'Mua đồ ăn vặt & trà sữa vợ thích')}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full font-cute shadow-sm bounce-click"
          >
            🧋 Mua món vợ thích
          </button>
          <button
            type="button"
            onClick={() => onAction('hug', 'Ôm vợ thật chặt và động viên')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full font-cute bounce-click"
          >
            ❤️ Ôm vợ thật chặt
          </button>
        </div>
      </div>
    </div>
  );
}
