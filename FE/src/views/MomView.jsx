import React, { useState, useEffect, useRef } from 'react';
import { MamaApi } from '../services/api';
import './MomView.css';

export default function MomView({ onTriggerSos }) {
  const [activeTab, setActiveTab] = useState('mood'); // mood, ai, zen, forum, reminders

  // Module 1.1 States
  const [selectedMood, setSelectedMood] = useState({
    title: 'Nắng Rực Rỡ',
    emoji: '🥰',
    desc: 'Đang rất vui vẻ & Hạnh phúc',
    score: 90
  });
  const [symptoms, setSymptoms] = useState(['Khỏe khoắn']);
  const [waterCount, setWaterCount] = useState(6);
  const waterTarget = 8;
  const [weight, setWeight] = useState(() => {
    const saved = localStorage.getItem('mamacare_mom_weight');
    return saved ? parseFloat(saved) : 58.5;
  });
  const [temperature, setTemperature] = useState(() => {
    const saved = localStorage.getItem('mamacare_mom_temperature');
    return saved ? parseFloat(saved) : 36.8;
  });
  const initialWeight = 54.3;

  useEffect(() => {
    localStorage.setItem('mamacare_mom_weight', weight.toString());
  }, [weight]);

  useEffect(() => {
    localStorage.setItem('mamacare_mom_temperature', temperature.toString());
  }, [temperature]);

  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('week');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Module 1.2 AI Chat States
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Chào mẹ yêu! Mình là MamaAI. Hôm nay em bé và mẹ có khỏe không? Có điều gì khiến mẹ thấy mỏi mệt hay băn khoăn, mẹ cứ thoải mái trút hết vào đây nhé. Mình luôn ở đây để lắng nghe mẹ! ❤️'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Module 1.3 Zen Space States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Sẵn Sàng');
  const [breathTimer, setBreathTimer] = useState(4);
  const breathInterval = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('');
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const noiseNodeRef = useRef(null);

  // Module 1.4 Forum States
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 'p1',
      room: 'rage',
      author: 'Mẹ Mây Nhỏ #402',
      title: 'Mẹ chồng cứ ép ăn cháo móng giò mỗi ngày phát ngấy...',
      content: 'Bác sĩ đã dặn chỉ cần bổ sung đủ chất, tăng cân khoa học. Nhưng ngày nào mẹ chồng cũng nấu nguyên nồi cháo to bắt ăn hết...',
      likes: 42,
      time: '15 phút trước'
    },
    {
      id: 'p2',
      room: 'advice',
      author: 'Mẹ Hạt Dẻ #718',
      title: 'Tuần 28 rồi mà đêm nào cũng trằn trọc đến 3h sáng, có mẹ nào có mẹo không?',
      content: 'Em kê gối chữ U, uống sữa ấm trước khi ngủ mà vẫn không đỡ. Có mẹ nào có bí quyết nào dễ ngủ không chỉ em với ạ!',
      likes: 27,
      time: '1 giờ trước'
    },
    {
      id: 'p3',
      room: 'joy',
      author: 'Mẹ Bắp Non #911',
      title: 'Lần đầu tiên bố đặt tay lên bụng và bé đạp phản hồi đúng chỗ đó!',
      content: 'Khoảnh khắc kỳ diệu nhất từ lúc mang thai đến giờ các mẹ ơi! Chồng mình bình thường ít nói thế mà lúc cảm nhận được con đã rơm rớm nước mắt...',
      likes: 98,
      time: '3 giờ trước'
    }
  ]);

  // Module 1.5 Medications & Appointments
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', time: '' });
  const [showAddApp, setShowAddApp] = useState(false);
  const [newApp, setNewApp] = useState({ title: '', date: '', doctor: '' });

  const fetchReminders = async () => {
    const medRes = await MamaApi.getMedications();
    if (medRes && medRes.success) setMedications(medRes.medications);
    
    const appRes = await MamaApi.getAppointments();
    if (appRes && appRes.success) setAppointments(appRes.appointments);
  };

  useEffect(() => {
    if (activeTab === 'reminders') {
      fetchReminders();
    }
  }, [activeTab]);

  // Khởi tạo và cập nhật Chart.js cho Module 1.1
  useEffect(() => {
    if (activeTab === 'mood' && chartRef.current && window.Chart) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      const isWeek = chartPeriod === 'week';
      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: isWeek ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
          datasets: [{
            label: 'Chỉ số Tích cực',
            data: isWeek ? [45, 35, 25, 55, 70, 85, 40] : [50, 65, 75, 58],
            borderColor: '#FF4D79',
            borderWidth: 3,
            backgroundColor: 'rgba(255, 77, 121, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#FF4D79'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { display: false }, x: { grid: { display: false } } }
        }
      });
    }
  }, [activeTab, chartPeriod]);

  // Handlers: Lịch Khám & Thuốc (Module 1.5)
  const handleToggleMed = async (id) => {
    const res = await MamaApi.toggleMedication(id);
    if (res && res.success) {
      setMedications(prev => prev.map(m => (m.id === id || m._id === id) ? { ...m, taken: res.medication.taken } : m));
    }
  };

  const handleAddMedSubmit = async (e) => {
    e.preventDefault();
    const res = await MamaApi.addMedication(newMed);
    if (res && res.success) {
      setMedications([...medications, res.medication]);
      setNewMed({ name: '', time: '' });
      setShowAddMed(false);
    }
  };

  const handleAddAppSubmit = async (e) => {
    e.preventDefault();
    const res = await MamaApi.addAppointment(newApp);
    if (res && res.success) {
      setAppointments([...appointments, res.appointment]);
      setNewApp({ title: '', date: '', doctor: '' });
      setShowAddApp(false);
    }
  };

  // Handler: Lưu Check-in cảm xúc
  const handleSaveMood = async () => {
    const payload = {
      mood: selectedMood.title,
      symptoms,
      waterCount,
      weight: parseFloat(weight) || 0,
      temperature: parseFloat(temperature) || 0,
      journal: journalText
    };
    await MamaApi.submitMoodCheckIn(payload);
    alert('💖 Đã lưu dữ liệu cảm xúc & sức khỏe thành công! Dữ liệu đã được đồng bộ tự động sang Bố Bỉm.');
  };

  // Handler: Thu âm giọng nói bằng Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'vi-VN';
      rec.interimResults = false;
      setIsRecording(true);

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setJournalText(prev => (prev ? prev + ' ' : '') + transcript);
      };
      rec.onerror = () => {
        setIsRecording(false);
        setJournalText("Hôm nay em thấy mỏi thắt lưng nhiều, nhưng ăn ngon miệng và bé đạp đều...");
      };
      rec.onend = () => setIsRecording(false);
      rec.start();
    } else {
      setJournalText("Hôm nay trong người hơi mệt mỏi, mong anh xã về sớm massage lưng cho em...");
      alert('Trình duyệt không hỗ trợ Web Speech API. Đã điền đoạn thu âm mẫu.');
    }
  };

  // Handler: Gửi tin nhắn Chat AI & Red-flag SOS
  const handleSendChat = async (textToSend) => {
    const msg = textToSend || aiInput;
    if (!msg.trim()) return;

    const userMsgObj = { id: Date.now(), sender: 'user', text: msg };
    setChatMessages(prev => [...prev, userMsgObj]);
    setAiInput('');
    setIsTyping(true);

    // Quét Red-flag SOS
    const redFlags = ['tuyệt vọng', 'làm hại bản thân', 'ghét bỏ đứa trẻ', 'không muốn sống', 'tự tử', 'chết'];
    const hasRedFlag = redFlags.some(k => msg.toLowerCase().includes(k));
    if (hasRedFlag) {
      onTriggerSos();
    }

    // Gọi Backend Express API
    let aiReply = "MamaAI ôm mẹ thật chặt nhé! Mang thai là một hành trình kỳ diệu nhưng cũng đầy thử thách. Mẹ hãy cứ thả lỏng, uống một ngụm nước ấm và nghỉ ngơi một chút, mẹ đang làm rất tuyệt vời rồi! ❤️🌸";

    const apiRes = await MamaApi.sendAiChat(msg);
    if (apiRes) {
      aiReply = apiRes.reply;
      if (apiRes.isRedFlag) {
        onTriggerSos();
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiReply }]);
    }, 600);
  };

  // Handler: Bài tập thở 4-7-8
  const handleToggleBreathing = () => {
    if (!breathingActive) {
      setBreathingActive(true);
      setBreathPhase('Hít Vào (Mũi)');
      setBreathTimer(4);

      let step = 0;
      breathInterval.current = setInterval(() => {
        step = (step + 1) % 3;
        if (step === 0) {
          setBreathPhase('Hít Vào (Mũi)');
          setBreathTimer(4);
        } else if (step === 1) {
          setBreathPhase('Nín Thở (Giữ hơi)');
          setBreathTimer(7);
        } else {
          setBreathPhase('Thở Ra (Miệng)');
          setBreathTimer(8);
        }
      }, 4000);
    } else {
      setBreathingActive(false);
      clearInterval(breathInterval.current);
      setBreathPhase('Sẵn Sàng');
      setBreathTimer(4);
    }
  };

  // Handler: Web Audio Synthesizer Sóng Não
  const playSynthesizer = (title, freq, type) => {
    stopSynthesizer();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.connect(ctx.destination);

      if (type === 'pink_noise') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseSource.connect(gain);
        noiseSource.start();
        noiseNodeRef.current = noiseSource;
      } else {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        oscRef.current = osc;
      }

      setAudioPlaying(true);
      setCurrentTrackName(title);
    } catch (e) {
      console.error('Audio synthesizer error', e);
    }
  };

  const stopSynthesizer = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch {}
      oscRef.current = null;
    }
    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); } catch {}
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    setAudioPlaying(false);
  };

  // Handler: Đăng bài diễn đàn
  const handleCreatePost = async () => {
    if (!postText.trim()) {
      alert('Mẹ vui lòng nhập nội dung tâm sự nhé!');
      return;
    }
    const newP = {
      id: 'post-' + Date.now(),
      room: selectedRoom === 'all' ? 'rage' : selectedRoom,
      author: 'Mẹ Hướng Dương #' + Math.floor(Math.random() * 900 + 100),
      title: 'Tâm sự ẩn danh của mẹ',
      content: postText,
      likes: 0,
      time: 'Vừa xong'
    };

    setPosts(prev => [newP, ...prev]);
    await MamaApi.createPost({ title: newP.title, content: postText, room: newP.room });
    setPostText('');
    alert('✨ Đã đăng bài ẩn danh thành công!');
  };

  const handleLikePost = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    MamaApi.likePost(id);
  };

  const handleReportPost = (id) => {
    MamaApi.reportPost(id, 'Nội dung phản cảm');
    alert('Cảm ơn mẹ đã báo cáo. Đội ngũ kiểm duyệt Admin đã tiếp nhận và sẽ xử lý ngay!');
  };

  return (
    <section className="space-y-6">
      {/* Sub-Navigation 5 Modules của Mẹ */}
      <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('mood')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap transition bounce-hover ${
            activeTab === 'mood'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-cute border-2 border-white'
              : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-pink-200'
          }`}
        >
          <i className="fa-solid fa-heart-pulse mr-2"></i>Trạm Cảm Xúc & Sức Khỏe 🌈
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap transition bounce-hover ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-cute border-2 border-white'
              : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-pink-200'
          }`}
        >
          <i className="fa-solid fa-robot mr-2 text-pink-400"></i>Trợ Lý AI Tâm Giao 🎀
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('zen')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap transition bounce-hover ${
            activeTab === 'zen'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-cute border-2 border-white'
              : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-emerald-200'
          }`}
        >
          <i className="fa-solid fa-spa mr-2 text-emerald-500"></i>Không Gian Thở Zen 🍃
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('forum')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap transition bounce-hover ${
            activeTab === 'forum'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-cute border-2 border-white'
              : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-purple-200'
          }`}
        >
          <i className="fa-solid fa-comments mr-2 text-purple-400"></i>Diễn Đàn Góc Khuất ☁️
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap transition bounce-hover ${
            activeTab === 'reminders'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-cute border-2 border-white'
              : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-sky-200'
          }`}
        >
          <i className="fa-solid fa-calendar-check mr-2 text-sky-400"></i>Lịch Khám & Thuốc 💊
        </button>
      </div>

      {/* MODULE 1.1: TRẠM CẢM XÚC & SỨC KHỎE */}
      {activeTab === 'mood' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-rose-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-cute text-slate-800 flex items-center gap-2">
                      <span>Check-in Cảm Xúc Hôm Nay</span>
                      <span className="text-2xl float-cute">✨</span>
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Chỉ mất 5 giây để ghi nhận cảm xúc & tự động đồng bộ sang Bố Bỉm</p>
                  </div>
                  <span className="text-xs font-black px-4 py-1.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full border-2 border-rose-200 shadow-sm flex items-center gap-1">
                    <span>👶</span> Tuần thai 24
                  </span>
                </div>

                {/* Emoji Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-black font-cute text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                    <span>Chọn biểu tượng cảm xúc (Chỉ 5 giây):</span>
                    <span className="text-[11px] font-extrabold text-rose-500 font-cute">
                      Đang chọn: {selectedMood.emoji} {selectedMood.title}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                    {[
                      { title: 'Nắng Rực Rỡ', emoji: '🥰', desc: 'Đang rất vui vẻ & Hạnh phúc', sub: 'Vui Vẻ', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-300', textCol: 'text-amber-800' },
                      { title: 'Mây Dịu Êm', emoji: '😌', desc: 'Bình yên & Thư thái', sub: 'Bình Yên', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300', textCol: 'text-emerald-800' },
                      { title: 'Mưa Dông', emoji: '😤', desc: 'Dễ cáu gắt & Quá tải', sub: 'Cáu Gắt', bg: 'bg-rose-50 hover:bg-rose-100 border-rose-300', textCol: 'text-rose-800' },
                      { title: 'Mưa Rào', emoji: '😭', desc: 'Cực kỳ nhạy cảm & Tủi thân', sub: 'Tủi Thân', bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300', textCol: 'text-indigo-800' },
                      { title: 'Gió Lốc', emoji: '🥺', desc: 'Lo lắng & Bồn chồn', sub: 'Lo Âu', bg: 'bg-sky-50 hover:bg-sky-100 border-sky-300', textCol: 'text-sky-800' },
                    ].map(m => (
                      <button
                        key={m.title}
                        type="button"
                        onClick={() => setSelectedMood({ title: m.title, emoji: m.emoji, desc: m.desc, score: 75 })}
                        className={`mood-opt group p-3 rounded-[22px] border-2 flex flex-col items-center space-y-1 bounce-hover transition ${m.bg} ${
                          selectedMood.title === m.title ? 'active-mood' : ''
                        }`}
                      >
                        <span className="text-3xl group-hover:scale-125 transition-transform">{m.emoji}</span>
                        <span className={`text-xs font-black font-cute ${m.textCol}`}>{m.sub}</span>
                        <span className="text-[9px] text-slate-500 font-bold">{m.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Triệu chứng cơ thể */}
                <div className="space-y-2">
                  <label className="text-xs font-black font-cute text-slate-700 uppercase tracking-wider block">Triệu chứng cơ thể hôm nay:</label>
                  <div className="flex flex-wrap gap-2">
                    {['🦴 Đau thắt lưng', '🤢 Buồn nôn / Nghén', '💤 Khó ngủ / Trằn trọc', '🦵 Chuột rút bắp chân', '✨ Tràn đầy năng lượng'].map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          setSymptoms(prev => prev.includes(sym) ? prev.filter(x => x !== sym) : [...prev, sym]);
                        }}
                        className={`px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition bounce-hover ${
                          symptoms.includes(sym)
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'border-slate-200 text-slate-600 hover:border-rose-400'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nước uống & Cân nặng, Thân nhiệt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-cute text-sky-800">Uống nước trong ngày:</span>
                      <span className="text-xs font-black text-sky-600">{waterCount} / {waterTarget} Ly ({waterCount * 250}ml)</span>
                    </div>
                    <div className="flex items-center justify-between text-xl pt-1">
                      {Array.from({ length: waterTarget }).map((_, i) => (
                        <span
                          key={i}
                          onClick={() => setWaterCount(i + 1)}
                          className={`text-xl sm:text-2xl bounce-hover cursor-pointer ${i < waterCount ? '' : 'opacity-30'}`}
                        >
                          {i < waterCount ? '🥛' : '⚪'}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button type="button" onClick={() => setWaterCount(Math.max(0, waterCount - 1))} className="w-7 h-7 rounded-full bg-white text-sky-600 font-bold border border-sky-300 text-xs hover:bg-sky-100 transition shadow-xs cursor-pointer">-</button>
                      <button type="button" onClick={() => setWaterCount(Math.min(waterTarget, waterCount + 1))} className="w-7 h-7 rounded-full bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition shadow-xs cursor-pointer">+</button>
                    </div>
                  </div>

                  {/* Cân nặng & Thân nhiệt có thể điều chỉnh */}
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-cute text-amber-800">Cân nặng & Thân nhiệt:</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Điều chỉnh Cân nặng */}
                      <div className="text-center flex-1">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setWeight(prev => Number((Math.max(30, (parseFloat(prev) || 0) - 0.1)).toFixed(1)))}
                            className="w-7 h-7 rounded-full bg-white text-amber-700 font-bold border border-amber-300 text-xs hover:bg-amber-100 flex items-center justify-center transition shadow-xs cursor-pointer"
                            title="Giảm cân nặng (-0.1 kg)"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setWeight(Number(val.toFixed(1)));
                              } else {
                                setWeight(initialWeight);
                              }
                            }}
                            className="w-14 text-center text-lg font-black font-cute text-slate-800 bg-transparent border-b border-dashed border-amber-400 focus:outline-none focus:border-amber-600"
                            title="Nhấp để nhập trực tiếp số cân nặng"
                          />
                          <button
                            type="button"
                            onClick={() => setWeight(prev => Number((Math.min(150, (parseFloat(prev) || 0) + 0.1)).toFixed(1)))}
                            className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                            title="Tăng cân nặng (+0.1 kg)"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block font-bold mt-1">
                          Kg ({(parseFloat(weight) || 0) >= initialWeight ? `+${((parseFloat(weight) || 0) - initialWeight).toFixed(1)}` : ((parseFloat(weight) || 0) - initialWeight).toFixed(1)}kg)
                        </span>
                      </div>

                      <div className="h-8 w-px bg-amber-200 mx-1"></div>

                      {/* Điều chỉnh Thân nhiệt */}
                      <div className="text-center flex-1">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setTemperature(prev => Number((Math.max(34, (parseFloat(prev) || 0) - 0.1)).toFixed(1)))}
                            className="w-7 h-7 rounded-full bg-white text-amber-700 font-bold border border-amber-300 text-xs hover:bg-amber-100 flex items-center justify-center transition shadow-xs cursor-pointer"
                            title="Giảm thân nhiệt (-0.1 °C)"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setTemperature(Number(val.toFixed(1)));
                              } else {
                                setTemperature(36.8);
                              }
                            }}
                            className="w-14 text-center text-lg font-black font-cute text-slate-800 bg-transparent border-b border-dashed border-amber-400 focus:outline-none focus:border-amber-600"
                            title="Nhấp để nhập trực tiếp thân nhiệt"
                          />
                          <button
                            type="button"
                            onClick={() => setTemperature(prev => Number((Math.min(42, (parseFloat(prev) || 0) + 0.1)).toFixed(1)))}
                            className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                            title="Tăng thân nhiệt (+0.1 °C)"
                          >
                            +
                          </button>
                        </div>
                        <span className={`text-[10px] block font-bold mt-1 ${(parseFloat(temperature) || 0) > 37.5 ? 'text-rose-600' : 'text-slate-500'}`}>
                          °C {(parseFloat(temperature) || 0) < 36.0 ? 'Hạ nhiệt' : (parseFloat(temperature) || 0) <= 37.3 ? 'Bình thường' : (parseFloat(temperature) || 0) <= 38.0 ? 'Sốt nhẹ' : 'Sốt cao ⚠️'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Nhật Ký Biết Ơn / Xả Stress */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black font-cute text-slate-700 uppercase tracking-wider">
                      Nhật ký xả stress / biết ơn:
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`text-xs font-black font-cute px-3 py-1 rounded-full border transition flex items-center space-x-1.5 ${
                        isRecording ? 'bg-rose-500 text-white border-rose-500 animate-pulse' : 'bg-rose-100 text-rose-600 border-rose-300 hover:bg-rose-200'
                      }`}
                    >
                      <i className="fa-solid fa-microphone"></i>
                      <span>{isRecording ? 'Đang thu âm...' : 'Thu âm giọng nói'}</span>
                    </button>
                  </div>
                  <textarea
                    rows="3"
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Gõ những suy nghĩ ẩn sâu hoặc bấm thu âm giọng nói để xả bớt gánh nặng trong lòng nhé mẹ..."
                    className="w-full p-3.5 rounded-2xl border-2 border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 text-xs font-semibold text-slate-700 outline-none resize-none transition bg-rose-50/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveMood}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white font-black font-cute text-sm shadow-cute bounce-hover flex items-center justify-center space-x-2"
                >
                  <span>💖 Lưu Check-in & Đồng Bộ Ngay Cho Bố</span>
                </button>
              </div>
            </div>

            {/* Cột Phải: Biểu Đồ Dashboard Tâm Lý */}
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] p-6 shadow-cloud border-4 border-rose-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black font-cute text-slate-800 flex items-center gap-1.5">
                    <span>Báo Cáo Tâm Lý</span>
                    <span>📈</span>
                  </h3>
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[11px] font-black font-cute">
                    <button
                      type="button"
                      onClick={() => setChartPeriod('week')}
                      className={`px-2.5 py-1 rounded-lg ${chartPeriod === 'week' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Tuần
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartPeriod('month')}
                      className={`px-2.5 py-1 rounded-lg ${chartPeriod === 'month' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Tháng
                    </button>
                  </div>
                </div>

                <div className="h-44 w-full relative">
                  <canvas ref={chartRef}></canvas>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{chartPeriod === 'week' ? '📉' : '📈'}</span>
                    <div>
                      <p className="text-xs font-black font-cute text-rose-600">
                        {chartPeriod === 'week' ? 'Tâm trạng đang có xu hướng đi xuống' : 'Tổng thể tháng: Ổn định (+12%)'}
                      </p>
                      <p className="text-[10px] text-slate-500">Mẹ dễ xúc động & tủi thân hơn vào buổi tối</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-cute">
                    Cần quan tâm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1.2: TRỢ LÝ AI TÂM GIAO 24/7 */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-pink-100 space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center text-2xl shadow-sm">
                🎀
              </div>
              <div>
                <h3 className="text-lg font-black font-cute text-slate-800">Trợ Lý AI Tâm Giao 24/7</h3>
                <p className="text-xs text-pink-500 font-bold">Luôn lắng nghe, thấu cảm & tuyệt đối không phán xét</p>
              </div>
            </div>
            <span className="text-[10px] font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
              🟢 Sẵn sàng 24/7 Ẩn Danh
            </span>
          </div>

          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-pink-50/30 rounded-2xl border border-pink-100 chat-scroll-area">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'space-x-3'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold shadow-sm">
                    <span>🎀</span>
                  </div>
                )}
                <div
                  className={`p-4 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed shadow-sm ${
                    msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai text-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold shadow-sm">
                  <span>🎀</span>
                </div>
                <div className="bg-rose-50 rounded-[22px] p-3 text-xs text-slate-500 font-bold animate-pulse font-cute border border-rose-100">
                  MamaAI đang lắng nghe và viết lời an ủi ngọt ngào cho mẹ... ✨
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'Hôm nay mình bị mỏi lưng quá, có cách nào đỡ không?',
              'Đêm trằn trọc khó ngủ quá AI ơi',
              'Chồng vô tâm không hiểu cho nỗi khổ của mình...',
              'Em mệt quá, em cảm thấy tuyệt vọng và muốn buông xuôi...'
            ].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handleSendChat(p)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                  p.includes('tuyệt vọng') ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-pink-100'
                }`}
              >
                {p.includes('tuyệt vọng') ? '🚨 Test Red-flag SOS' : p.slice(0, 25) + '...'}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="flex items-center space-x-2 pt-2"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Tâm sự ẩn danh cùng AI, không ai biết bạn là ai..."
              className="flex-grow p-3.5 rounded-2xl border-2 border-pink-200 focus:border-pink-400 text-xs font-semibold text-slate-700 outline-none bg-pink-50/30"
            />
            <button
              type="submit"
              className="px-5 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black font-cute text-xs shadow-cute bounce-hover"
            >
              <i className="fa-solid fa-paper-plane mr-1"></i> Gửi
            </button>
          </form>
        </div>
      )}

      {/* MODULE 1.3: KHÔNG GIAN THỞ ZEN */}
      {activeTab === 'zen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-emerald-100 space-y-6 text-center">
            <span className="text-xs font-black uppercase font-cute px-3.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              Kỹ Thuật Thở 4-7-8 Y Khoa
            </span>
            <h3 className="text-lg font-black font-cute text-slate-800">Ngắt Cơn Hoảng Loạn (Panic Attack) Trong 60 Giây</h3>

            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <div
                className={`w-40 h-40 rounded-full border-4 border-emerald-400 bg-emerald-50/60 flex flex-col items-center justify-center transition-all duration-1000 shadow-lg ${
                  breathingActive ? 'breathe-circle-cute' : ''
                }`}
              >
                <span className="text-sm font-black font-cute text-emerald-800">{breathPhase}</span>
                <span className="text-2xl font-black font-cute text-emerald-600">{breathTimer}s</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleBreathing}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black font-cute text-xs shadow-md bounce-hover"
            >
              {breathingActive ? '⏹️ Dừng Bài Tập' : '🍃 Bắt Đầu Nhịp Thở Zen'}
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-emerald-100 space-y-4">
            <h3 className="text-sm font-black font-cute text-slate-800 flex items-center gap-2">
              <span>Kho Nhạc Tần Số Sóng Não & Thai Giáo</span>
              <span>🎶</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { title: 'Sóng Não 432Hz Miracle Tone', desc: 'Giảm căng thẳng thần kinh sâu & ru ngủ', freq: 432, type: 'sine' },
                { title: 'Sóng Não 528Hz DNA Repair', desc: 'Phục hồi năng lượng tế bào & an dịu tâm trí', freq: 528, type: 'sine' },
                { title: 'Tiếng Mưa Rào Pink Noise', desc: 'Âm thanh trắng cắt đứt tạp âm xung quanh', freq: 0, type: 'pink_noise' }
              ].map(track => (
                <div key={track.title} className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black font-cute text-slate-800">{track.title}</h4>
                    <p className="text-[10px] text-slate-500">{track.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playSynthesizer(track.title, track.freq, track.type)}
                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold bounce-hover"
                  >
                    ▶️ Phát Thật
                  </button>
                </div>
              ))}
            </div>

            {audioPlaying && (
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="animate-spin">💿</span>
                  <span className="font-bold font-cute">{currentTrackName}</span>
                </div>
                <button
                  type="button"
                  onClick={stopSynthesizer}
                  className="px-3 py-1 bg-rose-500 rounded-xl font-bold text-white"
                >
                  Dừng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 1.4: DIỄN ĐÀN GÓC KHUẤT */}
      {activeTab === 'forum' && (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-purple-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <h3 className="text-lg font-black font-cute text-slate-800">Cộng Đồng Góc Khuất Ẩn Danh 100%</h3>
              <p className="text-xs text-purple-500 font-bold">Nơi mẹ tâm sự chuyện khó nói nhất mà không sợ bị phán xét</p>
            </div>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="p-2 bg-purple-50 rounded-xl border border-purple-200 text-xs font-black font-cute text-purple-800 outline-none"
            >
              <option value="all">Tất Cả Các Phòng</option>
              <option value="rage">🔥 Phòng Xả Giận</option>
              <option value="advice">💡 Phòng Tìm Lời Khuyên</option>
              <option value="joy">🌸 Phòng Chia Sẻ Niềm Vui</option>
            </select>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-2">
            <textarea
              rows="2"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Viết tâm sự ẩn danh... Hệ thống sẽ tự cấp nickname ngẫu nhiên để bảo vệ bạn tuyệt đối."
              className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold text-slate-700 outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCreatePost}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black font-cute text-xs shadow-sm bounce-hover"
              >
                ✨ Đăng Ẩn Danh
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {posts
              .filter(p => selectedRoom === 'all' || p.room === selectedRoom)
              .map(p => (
                <div
                  key={p.id}
                  className={`forum-card forum-card-${p.room} bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold font-cute">🌸</span>
                      <span className="text-xs font-black font-cute text-slate-800">{p.author}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">• {p.time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReportPost(p.id)}
                      className="text-[11px] font-bold text-slate-400 hover:text-rose-500"
                    >
                      <i className="fa-regular fa-flag mr-1"></i>Báo Cáo
                    </button>
                  </div>
                  <h4 className="text-sm font-black font-cute text-slate-800">{p.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.content}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleLikePost(p.id)}
                      className="flex items-center space-x-1.5 font-bold text-rose-500 hover:scale-105 transition"
                    >
                      <i className="fa-solid fa-heart"></i>
                      <span>{p.likes} Yêu thương</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODULE 1.5: LỊCH KHÁM & THUỐC */}
      {activeTab === 'reminders' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-rose-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-cute text-slate-800">Checklist Uống Thuốc Hôm Nay</h3>
                <p className="text-xs text-rose-600 font-black font-cute">
                  {medications.length > 0 ? Math.round((medications.filter(m => m.taken).length / medications.length) * 100) : 0}% ({medications.filter(m => m.taken).length}/{medications.length} cữ)
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddMed(true)}
                className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${medications.length > 0 ? (medications.filter(m => m.taken).length / medications.length) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="space-y-2 pt-2">
              {medications.map(med => (
                <div key={med._id || med.id} className="p-3.5 bg-rose-50/60 rounded-[20px] border-2 border-rose-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={med.taken}
                      onChange={() => handleToggleMed(med._id || med.id)}
                      className="rounded-full text-rose-500 w-5 h-5 accent-rose-500 cursor-pointer"
                    />
                    <span className={`text-xs sm:text-sm font-bold ${med.taken ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {med.name}
                    </span>
                  </div>
                  <span className="text-xs font-black font-cute text-rose-500 bg-white px-3 py-1 rounded-full border border-rose-200 shadow-sm">
                    {med.time}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Add Medication Modal */}
            {showAddMed && (
              <form onSubmit={handleAddMedSubmit} className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 relative">
                <button type="button" onClick={() => setShowAddMed(false)} className="absolute top-2 right-3 text-slate-400 hover:text-rose-500"><i className="fa-solid fa-xmark"></i></button>
                <h4 className="text-sm font-bold text-rose-700 font-cute">Thêm Thuốc Mới</h4>
                <input 
                  type="text" required placeholder="Tên thuốc (VD: Canxi Nano)" 
                  value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-rose-200 focus:outline-rose-400"
                />
                <input 
                  type="text" required placeholder="Giờ uống (VD: 08:00 AM)" 
                  value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-rose-200 focus:outline-rose-400"
                />
                <button type="submit" className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-sm">Lưu Thuốc</button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-sky-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black font-cute text-slate-800">Mốc Khám Thai Định Kỳ</h3>
              <button 
                type="button" 
                onClick={() => setShowAddApp(true)}
                className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200 transition"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            <div className="space-y-3 pt-2">
              {appointments.map(app => (
                <div key={app._id || app.id} className="p-4 bg-sky-50/70 rounded-[22px] border-2 border-sky-100 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs sm:text-sm font-black font-cute text-slate-800">{app.title}</h4>
                    <span className="text-[10px] font-black font-cute bg-sky-200 text-sky-800 px-2.5 py-0.5 rounded-full">
                      {app.countdown || 'Sắp tới'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                    <span>{app.doctor}</span>
                    <span className="font-bold text-slate-700">📅 {app.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Appointment Modal */}
            {showAddApp && (
              <form onSubmit={handleAddAppSubmit} className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-3 relative">
                <button type="button" onClick={() => setShowAddApp(false)} className="absolute top-2 right-3 text-slate-400 hover:text-sky-500"><i className="fa-solid fa-xmark"></i></button>
                <h4 className="text-sm font-bold text-sky-700 font-cute">Thêm Lịch Khám/Tiêm Mới</h4>
                <input 
                  type="text" required placeholder="Tên mốc khám/tiêm (VD: Tiêm Uốn Ván)" 
                  value={newApp.title} onChange={e => setNewApp({...newApp, title: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-sky-200 focus:outline-sky-400"
                />
                <input 
                  type="text" required placeholder="Ngày khám (VD: 20/10/2026)" 
                  value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-sky-200 focus:outline-sky-400"
                />
                <input 
                  type="text" placeholder="Tên bác sĩ / Phòng khám (Tùy chọn)" 
                  value={newApp.doctor} onChange={e => setNewApp({...newApp, doctor: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-sky-200 focus:outline-sky-400"
                />
                <button type="submit" className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs shadow-sm">Lưu Lịch Khám</button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
