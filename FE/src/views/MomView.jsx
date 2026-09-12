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
  
  // Module 1.1: Nước uống (đơn vị ml) & Lịch nhắc
  const [waterMl, setWaterMl] = useState(() => {
    const saved = localStorage.getItem('mamacare_mom_water_ml');
    return saved ? parseInt(saved, 10) : 1500;
  });
  const waterTargetMl = 2000;
  const [showWaterSchedule, setShowWaterSchedule] = useState(false);
  const [waterSchedule, setWaterSchedule] = useState([
    { id: 1, time: '07:00', label: 'Ly nước ấm đánh thức hệ tiêu hóa', amount: 250, done: true },
    { id: 2, time: '09:00', label: 'Bổ sung nước giữa buổi sáng', amount: 250, done: true },
    { id: 3, time: '11:30', label: 'Trước bữa trưa 30 phút (hỗ trợ hấp thu)', amount: 250, done: true },
    { id: 4, time: '14:00', label: 'Giải tỏa uể oải, tỉnh táo buổi chiều', amount: 250, done: true },
    { id: 5, time: '16:30', label: 'Tăng tuần hoàn máu và ối cho bé', amount: 250, done: true },
    { id: 6, time: '19:30', label: 'Sau bữa tối thư giãn', amount: 250, done: true },
    { id: 7, time: '21:30', label: 'Ngụm nhỏ trước khi ngủ (tránh tiểu đêm)', amount: 250, done: false }
  ]);

  useEffect(() => {
    localStorage.setItem('mamacare_mom_water_ml', waterMl.toString());
  }, [waterMl]);

  const toggleWaterScheduleSlot = (id) => {
    setWaterSchedule(prev => prev.map(slot => {
      if (slot.id === id) {
        const nextDone = !slot.done;
        setWaterMl(w => nextDone ? Math.min(3500, w + slot.amount) : Math.max(0, w - slot.amount));
        return { ...slot, done: nextDone };
      }
      return slot;
    }));
  };

  // Cân nặng, Chiều cao, Thân nhiệt & BMI
  const [weight, setWeight] = useState(() => {
    const saved = localStorage.getItem('mamacare_mom_weight');
    return saved ? parseFloat(saved) : 58.5;
  });
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem('mamacare_mom_height');
    return saved ? parseFloat(saved) : 160;
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
    localStorage.setItem('mamacare_mom_height', height.toString());
  }, [height]);

  useEffect(() => {
    localStorage.setItem('mamacare_mom_temperature', temperature.toString());
  }, [temperature]);

  // BMI mẹ bầu
  const bmi = height > 0 ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '22.8';

  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('week');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Module 1.2 AI Chat States (Floating Popup)
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Chào mẹ yêu! Mình là MamaAI. Hôm nay em bé và mẹ có khỏe không? Có điều gì khiến mẹ thấy mỏi mệt hay băn khoăn, mẹ cứ thoải mái trút hết vào đây nhé. Mình luôn ở đây để lắng nghe mẹ! ❤️'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isAiChatOpen && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiChatOpen, isTyping]);

  // Module 1.3 Zen Space States & Controls
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPaused, setBreathingPaused] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Sẵn Sàng');
  const [breathTimer, setBreathTimer] = useState(4);
  const breathInterval = useRef(null);
  const breathStepRef = useRef(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('');
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const noiseNodeRef = useRef(null);

  // Module 1.4 Forum States & Comments
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Dialog Modal Thông Báo Lưu Thành Công
  const [successModal, setSuccessModal] = useState(null);

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSendComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment = {
      author: 'Mẹ Bầu Tuần 24',
      avatar: '🌸',
      authorRole: 'Mẹ Bầu',
      content: text.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId || p._id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    // Gửi API lên MongoDB
    try {
      await MamaApi.addPostComment(postId, newComment);
    } catch (err) {
      console.error('Lỗi gửi bình luận:', err);
    }
  };

  const fetchPosts = async (room = selectedRoom) => {
    const res = await MamaApi.getForumPosts(room);
    if (res && res.posts) {
      setPosts(res.posts.map(p => ({
        ...p,
        id: p._id || p.id,
        time: p.time || (p.createdAt ? new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong')
      })));
    }
  };

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
    } else if (activeTab === 'forum') {
      fetchPosts(selectedRoom);
    }
  }, [activeTab, selectedRoom]);

  // Load ban đầu khi render
  useEffect(() => {
    fetchPosts('all');
  }, []);

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
            label: isWeek ? 'Chỉ số Tích cực Ngày' : 'Chỉ số Tích cực Tuần',
            data: isWeek ? [45, 35, 25, 55, 70, 85, 40] : [68, 74, 85, 78],
            borderColor: isWeek ? '#FF4D79' : '#8B5CF6',
            borderWidth: 3,
            backgroundColor: isWeek ? 'rgba(255, 77, 121, 0.15)' : 'rgba(139, 92, 246, 0.18)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: isWeek ? '#FF4D79' : '#8B5CF6',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Điểm tích cực: ${context.parsed.y}/100`
              }
            }
          },
          scales: {
            y: {
              display: true,
              min: 0,
              max: 100,
              ticks: { stepSize: 25, font: { size: 10 } },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11, weight: 'bold' } }
            }
          }
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
      waterCount: Math.round(waterMl / 250),
      waterMl,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      bmi: parseFloat(bmi) || 0,
      temperature: parseFloat(temperature) || 0,
      journal: journalText
    };
    try {
      await MamaApi.submitMoodCheckIn(payload);
    } catch (err) {
      console.error(err);
    }

    setSuccessModal({
      type: 'mood',
      title: 'Check-in Cảm Xúc Đã Được Lưu! 💖',
      subtitle: 'Tâm trạng và các triệu chứng hôm nay đã được cập nhật an toàn lên hệ thống.',
      details: [
        { icon: selectedMood.emoji, label: 'Cảm xúc', value: selectedMood.title, sub: selectedMood.desc },
        { icon: '🩺', label: 'Triệu chứng', value: symptoms.length > 0 ? symptoms.slice(0, 2).join(', ') : 'Khỏe khoắn', sub: 'Tình trạng cơ thể' },
        { icon: '💧', label: 'Uống nước', value: `${waterMl} ml`, sub: 'Đã nạp vào cơ thể' },
        { icon: '⚖️', label: 'Cân nặng / BMI', value: `${weight} kg`, sub: `BMI: ${bmi} (Chuẩn)`, highlight: true }
      ],
      note: 'Dữ liệu cảm xúc được gửi tức thời đến phân hệ Bố Bỉm để anh xã chủ động hỏi han và chăm sóc mẹ.'
    });
  };

  // Handler: Lưu hồ sơ sức khỏe mẹ bầu
  const handleSaveHealthProfile = async () => {
    const profile = {
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      temperature: parseFloat(temperature) || 0,
      waterMl,
      bmi: parseFloat(bmi) || 0,
      symptoms,
      savedAt: new Date().toISOString()
    };
    try {
      await MamaApi.saveHealthProfile(profile);
    } catch (e) {
      console.error('Lưu hồ sơ sức khỏe:', e);
    }

    setSuccessModal({
      type: 'profile',
      title: 'Lưu Hồ Sơ Sức Khỏe Thành Công! 🎉',
      subtitle: 'Thông tin thể trạng và chỉ số sinh trắc của mẹ bầu đã được ghi nhận an toàn vào cơ sở dữ liệu MongoDB.',
      details: [
        { icon: '⚖️', label: 'Cân Nặng', value: `${weight} kg`, sub: '+4.2kg trong thai kỳ' },
        { icon: '📏', label: 'Chiều Cao', value: `${height} cm`, sub: 'Chiều cao chuẩn' },
        { icon: '🩺', label: 'Chỉ Số BMI', value: `${bmi}`, sub: 'Chuẩn thai kỳ an toàn', highlight: true },
        { icon: '💧', label: 'Lượng Nước', value: `${waterMl} ml`, sub: `${Math.min(100, Math.round((waterMl / waterTargetMl) * 100))}% mục tiêu ngày` },
        { icon: '🌡️', label: 'Thân Nhiệt', value: `${temperature} °C`, sub: (parseFloat(temperature) || 0) <= 37.3 ? 'Thân nhiệt ổn định' : 'Cần theo dõi' },
        { icon: '👶', label: 'Mốc Thai Kỳ', value: 'Tuần 24', sub: 'Tam cá nguyệt thứ 2' }
      ],
      note: 'Hồ sơ sức khỏe này là căn cứ y khoa quan trọng để theo dõi tiến trình phát triển của thai nhi và chia sẻ cùng Bác sĩ trong các đợt khám định kỳ.'
    });
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
    const updatedHistory = [...chatMessages, userMsgObj];
    setChatMessages(updatedHistory);
    setAiInput('');
    setIsTyping(true);

    // Quét Red-flag SOS
    const redFlags = ['tự tử', 'chết', 'kết thúc cuộc sống', 'không muốn sống', 'hại con', 'ghét bỏ đứa trẻ', 'tuyệt vọng', 'biến mất', 'muốn chết', 'nhảy lầu', 'uống thuốc'];
    const hasRedFlag = redFlags.some(k => msg.toLowerCase().includes(k));
    if (hasRedFlag) {
      onTriggerSos();
    }

    // Gọi Backend Express API tích hợp DeepSeek AI
    let aiReply = "MamaAI ôm mẹ thật chặt nhé! Mang thai là một hành trình kỳ diệu nhưng cũng đầy thử thách. Mẹ hãy cứ thả lỏng, uống một ngụm nước ấm và nghỉ ngơi một chút, mẹ đang làm rất tuyệt vời rồi! ❤️🌸";
    let providerInfo = 'DeepSeek AI';

    const apiRes = await MamaApi.sendAiChat(msg, updatedHistory);
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

  // Handlers: Bài tập thở 4-7-8 (Bắt đầu, Tạm dừng, Kết thúc)
  const startBreathingInterval = () => {
    clearInterval(breathInterval.current);
    breathInterval.current = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) {
          breathStepRef.current = (breathStepRef.current + 1) % 3;
          if (breathStepRef.current === 0) {
            setBreathPhase('Hít Vào (Mũi)');
            return 4;
          } else if (breathStepRef.current === 1) {
            setBreathPhase('Nín Thở (Giữ hơi)');
            return 7;
          } else {
            setBreathPhase('Thở Ra (Miệng)');
            return 8;
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartBreathing = () => {
    if (!breathingActive) {
      setBreathingActive(true);
      setBreathingPaused(false);
      breathStepRef.current = 0;
      setBreathPhase('Hít Vào (Mũi)');
      setBreathTimer(4);
      startBreathingInterval();
    } else if (breathingPaused) {
      setBreathingPaused(false);
      startBreathingInterval();
    }
  };

  const handlePauseBreathing = () => {
    if (breathingActive && !breathingPaused) {
      clearInterval(breathInterval.current);
      setBreathingPaused(true);
    }
  };

  const handleStopBreathing = () => {
    clearInterval(breathInterval.current);
    setBreathingActive(false);
    setBreathingPaused(false);
    breathStepRef.current = 0;
    setBreathPhase('Sẵn Sàng');
    setBreathTimer(4);
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
    const targetRoom = selectedRoom === 'all' ? 'rage' : selectedRoom;
    const authorName = 'Mẹ Bầu #' + Math.floor(Math.random() * 900 + 100);
    const res = await MamaApi.createPost({
      title: 'Tâm sự ẩn danh của mẹ',
      content: postText.trim(),
      room: targetRoom,
      author: authorName,
      authorRole: 'Mẹ Bầu Tuần 24'
    });

    if (res && res.success && res.post) {
      const created = {
        ...res.post,
        id: res.post._id || res.post.id,
        time: 'Vừa xong'
      };
      setPosts(prev => [created, ...prev]);
    } else {
      await fetchPosts(selectedRoom);
    }
    setPostText('');
    alert('✨ Đã đăng bài chia sẻ thành công lên MongoDB!');
  };

  const handleLikePost = async (id) => {
    setPosts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, likes: (p.likes || 0) + 1 } : p));
    await MamaApi.likePost(id);
  };

  const handleReportPost = async (id) => {
    await MamaApi.reportPost(id, 'Nội dung phản cảm');
    alert('Cảm ơn mẹ đã báo cáo. Đội ngũ kiểm duyệt Admin đã tiếp nhận và sẽ xử lý ngay!');
  };

  return (
    <section className="space-y-6">
      {/* Sub-Navigation 5 Modules của Mẹ */}
      <div className="inline-flex bg-white p-1.5 rounded-[22px] border border-slate-200/90 shadow-sm max-w-full overflow-x-auto no-scrollbar items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('mood')}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-[14px] text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'mood'
              ? 'bg-[#B93A56] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <i className="fa-solid fa-heart-pulse"></i>
          <span>Trạm cảm xúc</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('zen')}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-[14px] text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'zen'
              ? 'bg-[#B93A56] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <i className="fa-solid fa-spa"></i>
          <span>Không gian thở</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('forum')}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-[14px] text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'forum'
              ? 'bg-[#B93A56] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <i className="fa-solid fa-users"></i>
          <span>Góc khuất</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-[14px] text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'reminders'
              ? 'bg-[#B93A56] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <i className="fa-solid fa-calendar-check"></i>
          <span>Lịch & thuốc</span>
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

                {/* Nước uống (ml), Lịch nhắc & Cân nặng, Chiều cao, Thân nhiệt */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Theo dõi lượng nước uống (ml) */}
                    <div className="bg-sky-50/80 p-4 rounded-2xl border-2 border-sky-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">💧</span>
                          <span className="text-xs font-black font-cute text-sky-900">Uống nước hôm nay:</span>
                        </div>
                        <span className="text-xs font-black font-cute px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-full border border-sky-300">
                          {waterMl} / {waterTargetMl} ml ({Math.min(100, Math.round((waterMl / waterTargetMl) * 100))}%)
                        </span>
                      </div>

                      {/* Thanh tiến độ nước */}
                      <div className="w-full bg-white/90 rounded-full h-3.5 p-0.5 border border-sky-200 shadow-inner overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (waterMl / waterTargetMl) * 100)}%` }}
                        ></div>
                      </div>

                      {/* Bộ điều khiển lượng nước nhanh */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setWaterMl(w => Math.max(0, w - 250))}
                            className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 font-black font-cute text-[11px] rounded-xl border border-sky-300 transition shadow-xs"
                            title="Giảm 250ml"
                          >
                            -250ml
                          </button>
                          <input
                            type="number"
                            value={waterMl}
                            step="50"
                            min="0"
                            max="5000"
                            onChange={(e) => setWaterMl(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 text-center text-xs font-black font-cute text-sky-900 bg-white px-1.5 py-1 rounded-xl border border-sky-300 focus:outline-none focus:border-sky-500 shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setWaterMl(w => Math.min(5000, w + 250))}
                            className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white font-black font-cute text-[11px] rounded-xl transition shadow-xs"
                            title="Thêm 250ml"
                          >
                            +250ml
                          </button>
                          <button
                            type="button"
                            onClick={() => setWaterMl(w => Math.min(5000, w + 500))}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-black font-cute text-[11px] rounded-xl transition shadow-xs"
                            title="Thêm 500ml"
                          >
                            +500ml
                          </button>
                        </div>
                      </div>

                      {/* Nút bật Lịch nhắc uống nước */}
                      <button
                        type="button"
                        onClick={() => setShowWaterSchedule(prev => !prev)}
                        className="w-full py-1.5 px-3 bg-white hover:bg-sky-100 text-sky-700 text-[11px] font-black font-cute rounded-xl border border-sky-300 transition flex items-center justify-center gap-1.5"
                      >
                        <i className={`fa-solid ${showWaterSchedule ? 'fa-chevron-up' : 'fa-clock'}`}></i>
                        <span>{showWaterSchedule ? 'Thu gọn lịch nhắc' : '⏰ Xem Lịch Nhắc Uống Nước (7 Cữ / Ngày)'}</span>
                      </button>
                    </div>

                    {/* Cân nặng, Chiều cao & Thân nhiệt */}
                    <div className="bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-200 space-y-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-base">⚖️</span>
                          <span className="text-xs font-black font-cute text-amber-900">Thể trạng & Chỉ số BMI:</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-cute">
                          BMI: {bmi} (Chuẩn thai kỳ)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
                        {/* Cân nặng */}
                        <div className="p-2 bg-white/90 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-black font-cute text-slate-500 block">Cân Nặng</span>
                          <div className="flex items-center justify-center gap-1 my-1">
                            <button
                              type="button"
                              onClick={() => setWeight(w => Number((Math.max(30, (parseFloat(w) || 0) - 0.1)).toFixed(1)))}
                              className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold hover:bg-amber-200 flex items-center justify-center"
                            >-</button>
                            <input
                              type="text"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="w-10 text-center font-black text-xs font-cute text-slate-800 bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setWeight(w => Number((Math.min(150, (parseFloat(w) || 0) + 0.1)).toFixed(1)))}
                              className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 flex items-center justify-center"
                            >+</button>
                          </div>
                          <span className="text-[9px] text-amber-700 font-bold block">Kg (+4.2kg)</span>
                        </div>

                        {/* Chiều cao */}
                        <div className="p-2 bg-white/90 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-black font-cute text-slate-500 block">Chiều Cao</span>
                          <div className="flex items-center justify-center gap-1 my-1">
                            <button
                              type="button"
                              onClick={() => setHeight(h => Math.max(120, (parseFloat(h) || 0) - 1))}
                              className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold hover:bg-amber-200 flex items-center justify-center"
                            >-</button>
                            <input
                              type="text"
                              value={height}
                              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                              className="w-10 text-center font-black text-xs font-cute text-slate-800 bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setHeight(h => Math.min(210, (parseFloat(h) || 0) + 1))}
                              className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 flex items-center justify-center"
                            >+</button>
                          </div>
                          <span className="text-[9px] text-amber-700 font-bold block">cm</span>
                        </div>

                        {/* Thân nhiệt */}
                        <div className="p-2 bg-white/90 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-black font-cute text-slate-500 block">Thân Nhiệt</span>
                          <div className="flex items-center justify-center gap-1 my-1">
                            <button
                              type="button"
                              onClick={() => setTemperature(t => Number((Math.max(34, (parseFloat(t) || 0) - 0.1)).toFixed(1)))}
                              className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold hover:bg-amber-200 flex items-center justify-center"
                            >-</button>
                            <input
                              type="text"
                              value={temperature}
                              onChange={(e) => setTemperature(e.target.value)}
                              className="w-10 text-center font-black text-xs font-cute text-slate-800 bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setTemperature(t => Number((Math.min(42, (parseFloat(t) || 0) + 0.1)).toFixed(1)))}
                              className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 flex items-center justify-center"
                            >+</button>
                          </div>
                          <span className="text-[9px] text-amber-700 font-bold block">°C (Ổn định)</span>
                        </div>
                      </div>

                      {/* Nút Lưu hồ sơ sức khỏe mẹ bầu */}
                      <button
                        type="button"
                        onClick={handleSaveHealthProfile}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black font-cute text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <i className="fa-solid fa-floppy-disk"></i>
                        <span>Lưu Hồ Sơ Sức Khỏe Mẹ Bầu</span>
                      </button>
                    </div>
                  </div>

                  {/* Chi tiết Lịch Nhắc Uống Nước (Khi mở) */}
                  {showWaterSchedule && (
                    <div className="p-4 bg-sky-50/90 rounded-2xl border-2 border-sky-200 space-y-2.5 transition-all">
                      <div className="flex items-center justify-between pb-1 border-b border-sky-200/80">
                        <span className="text-xs font-black font-cute text-sky-900 flex items-center gap-1.5">
                          <i className="fa-regular fa-calendar-check text-sky-600"></i>
                          <span>Lịch Nhắc Uống Nước Y Khoa (Khuyên dùng cho thai kỳ)</span>
                        </span>
                        <span className="text-[11px] font-bold text-sky-700">
                          Đã hoàn thành: {waterSchedule.filter(s => s.done).length} / {waterSchedule.length} cữ
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {waterSchedule.map(slot => (
                          <div
                            key={slot.id}
                            onClick={() => toggleWaterScheduleSlot(slot.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              slot.done ? 'bg-white border-sky-300 text-slate-700' : 'bg-white/60 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={slot.done}
                                onChange={() => {}}
                                className="rounded text-sky-500 w-4 h-4 accent-sky-500 pointer-events-none"
                              />
                              <div>
                                <span className={`text-xs font-black font-cute ${slot.done ? 'text-sky-900' : 'text-slate-500'}`}>
                                  {slot.time}
                                </span>
                                <p className="text-[10px] text-slate-500 leading-tight">{slot.label}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black font-cute px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                              +{slot.amount}ml
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

            {/* Cột Phải: Biểu Đồ Dashboard Tâm Lý & Báo Cáo Tháng */}
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
                      className={`px-3 py-1 rounded-lg transition ${chartPeriod === 'week' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Tuần
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartPeriod('month')}
                      className={`px-3 py-1 rounded-lg transition ${chartPeriod === 'month' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Tháng
                    </button>
                  </div>
                </div>

                <div className="h-44 w-full relative">
                  <canvas ref={chartRef}></canvas>
                </div>

                {/* Card tóm tắt tuần */}
                {chartPeriod === 'week' && (
                  <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📉</span>
                      <div>
                        <p className="text-xs font-black font-cute text-rose-600">
                          Tâm trạng đang có xu hướng đi xuống
                        </p>
                        <p className="text-[10px] text-slate-500">Mẹ dễ xúc động & tủi thân hơn vào buổi tối</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-cute">
                      Cần quan tâm
                    </span>
                  </div>
                )}

                {/* Báo cáo tâm lý tháng chi tiết */}
                {chartPeriod === 'month' && (
                  <div className="p-4 bg-purple-50/80 rounded-2xl border-2 border-purple-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-200/80">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">📊</span>
                        <span className="text-xs font-black font-cute text-purple-900">Báo Cáo Tâm Lý Tháng</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-cute">
                        TB: 76.3 / 100
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">• Tuần 1: Thích nghi tốt</span>
                        <span className="font-black text-purple-700 font-cute">68đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">• Tuần 2: Bé máy nhiều, mẹ vui</span>
                        <span className="font-black text-purple-700 font-cute">74đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">• Tuần 3: Cao điểm tích cực ✨</span>
                        <span className="font-black text-emerald-600 font-cute">85đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">• Tuần 4: Mỏi lưng, cần thư giãn</span>
                        <span className="font-black text-purple-700 font-cute">78đ</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/90 rounded-xl border border-purple-200 text-[10px] text-purple-950 font-medium leading-relaxed">
                      💡 <strong>Lời khuyên chuyên gia:</strong> Cảm xúc tháng này rất khả quan. Mẹ tiếp tục duy trì bài tập thở 4-7-8 và nghe nhạc sóng não để giữ vững nhịp sinh học tốt nhất cho bé!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1.3: KHÔNG GIAN THỞ ZEN */}
      {activeTab === 'zen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cột Trái: Kỹ Thuật Thở 4-7-8 */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-emerald-100 space-y-4 text-center">
              <div className="flex items-center justify-between pb-1 border-b border-emerald-100">
                <span className="text-xs font-black uppercase font-cute px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  Kỹ Thuật Thở 4-7-8 Y Khoa
                </span>
                <span className={`text-[11px] font-black font-cute px-2.5 py-0.5 rounded-full ${
                  breathingActive && !breathingPaused
                    ? 'bg-emerald-100 text-emerald-800'
                    : breathingPaused
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {breathingActive && !breathingPaused ? '🟢 Đang thực hành' : breathingPaused ? '⏸️ Đang tạm dừng' : '⚪ Sẵn sàng'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-cute text-slate-800">
                Ngắt Cơn Hoảng Loạn & Giảm Đau Thai Kỳ Trong 60 Giây
              </h3>

              {/* BỘ ĐIỀU KHIỂN ĐÃ CHUYỂN LÊN TRÊN VÒNG TRÒN */}
              <div className="flex items-center justify-center gap-2.5 pt-2 pb-1">
                <button
                  type="button"
                  onClick={handleStartBreathing}
                  disabled={breathingActive && !breathingPaused}
                  className={`px-4 py-2.5 rounded-2xl font-black font-cute text-xs shadow-sm transition flex items-center gap-1.5 ${
                    breathingActive && !breathingPaused
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 bounce-hover cursor-pointer'
                  }`}
                  title="Bắt đầu hoặc tiếp tục bài tập thở"
                >
                  <i className="fa-solid fa-play text-[11px]"></i>
                  <span>{breathingPaused ? 'Tiếp Tục' : 'Bắt Đầu'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePauseBreathing}
                  disabled={!breathingActive || breathingPaused}
                  className={`px-4 py-2.5 rounded-2xl font-black font-cute text-xs shadow-sm transition flex items-center gap-1.5 ${
                    !breathingActive || breathingPaused
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 bounce-hover cursor-pointer'
                  }`}
                  title="Tạm dừng bài tập"
                >
                  <i className="fa-solid fa-pause text-[11px]"></i>
                  <span>Tạm Dừng</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopBreathing}
                  disabled={!breathingActive && !breathingPaused}
                  className={`px-4 py-2.5 rounded-2xl font-black font-cute text-xs shadow-sm transition flex items-center gap-1.5 ${
                    !breathingActive && !breathingPaused
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 bounce-hover cursor-pointer'
                  }`}
                  title="Kết thúc và làm lại từ đầu"
                >
                  <i className="fa-solid fa-stop text-[11px]"></i>
                  <span>Kết Thúc</span>
                </button>
              </div>

              {/* Vòng tròn nhịp thở 4-7-8 */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
                <div
                  className={`w-40 h-40 rounded-full border-4 ${
                    breathingPaused ? 'border-amber-400 bg-amber-50/70' : 'border-emerald-400 bg-emerald-50/70'
                  } flex flex-col items-center justify-center transition-all duration-1000 shadow-lg ${
                    breathingActive && !breathingPaused ? 'breathe-circle-cute' : ''
                  }`}
                >
                  <span className="text-sm font-black font-cute text-emerald-900">
                    {breathingPaused ? 'Tạm Dừng' : breathPhase}
                  </span>
                  <span className="text-2xl font-black font-cute text-emerald-600 mt-1">{breathTimer}s</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                💡 <strong>Công thức chuẩn:</strong> Hít sâu qua mũi (4s) ➜ Giữ khí trong buồng phổi (7s) ➜ Thở từ từ qua môi khép (8s)
              </p>
            </div>

            {/* Cột Phải: Kho Nhạc Tần Số Sóng Não */}
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

          {/* BỔ SUNG: BÀI BÁO, TIN TỨC & VIDEO MINH HỌA Y KHOA Ở DƯỚI */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-cloud border-4 border-emerald-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black font-cute text-slate-800 flex items-center gap-2">
                  <span>📚 Cẩm Nang Y Khoa & Video Minh Họa Thai Giáo</span>
                  <span className="text-xl">🌿</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tài liệu chuyên môn được thẩm định bởi Bác sĩ Sản Phụ Khoa & Chuyên gia Tâm lý Chu sinh
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-cute shrink-0">
                Chuẩn Y Học Bằng Chứng
              </span>
            </div>

            {/* Video hướng dẫn minh họa */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none"></div>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-rose-500 text-white rounded-full">
                      Video Chuyên Sâu
                    </span>
                    <span className="text-xs text-emerald-200 font-bold">10:45 phút</span>
                  </div>
                  <div className="relative w-full aspect-video rounded-xl bg-slate-800/80 border border-emerald-400/30 flex items-center justify-center overflow-hidden cursor-pointer group-hover:border-emerald-300 transition">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-emerald-700 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-play ml-1"></i>
                    </div>
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded font-mono text-white">
                      HD 1080p
                    </span>
                  </div>
                  <h4 className="text-sm font-black font-cute leading-snug">
                    Video: Kỹ Thuật Thở Cơ Hoành & 4-7-8 Hạn Chế Cơn Đau Chuyển Dạ
                  </h4>
                  <p className="text-[11px] text-emerald-100 leading-relaxed">
                    BS. CKI Nguyễn Phương Dung hướng dẫn chi tiết tư thế ngồi, cách đặt tay theo dõi cơ hoành và kiểm soát nhịp tim thai nhi.
                  </p>
                </div>
                <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between text-xs mt-3 relative z-10">
                  <span className="text-emerald-200 text-[11px]">Đã xem: 12.8k lượt</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>Xem ngay</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Danh sách 3 bài báo & tài liệu y khoa */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/60 rounded-2xl border-2 border-emerald-100 space-y-2.5 hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-cute">
                      Khoa Học Chu Sinh
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">5 phút đọc</span>
                  </div>
                  <h4 className="text-xs font-black font-cute text-slate-800 hover:text-emerald-700 cursor-pointer">
                    Cơ Chế Thần Kinh Phế Vị Của Nhịp Thở 4-7-8 Đối Với Nồng Độ Cortisol Thai Nhi
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Nghiên cứu chỉ ra khi mẹ thở chậm với pha thở ra dài gấp đôi pha hít vào, nồng độ hormone stress cortisol giảm 27% chỉ sau 10 phút.
                  </p>
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                    <span>Theo Tạp chí Sản Phụ Khoa TW</span>
                    <span>Chi tiết →</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border-2 border-emerald-100 space-y-2.5 hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-cute">
                      Âm Nhạc Trị Liệu
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">4 phút đọc</span>
                  </div>
                  <h4 className="text-xs font-black font-cute text-slate-800 hover:text-emerald-700 cursor-pointer">
                    Tại Sao Tần Số Sóng Âm 432Hz Giúp Kích Thích Thính Giác Thai Nhi Từ Tuần 20?
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sóng âm tần số 432Hz tạo ra sự cộng hưởng dịu dàng qua nước ối, giúp nhịp tim bé chậm lại và đi vào trạng thái thư giãn REM sâu.
                  </p>
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                    <span>Viện Tâm Lý Trẻ Em & Thai Giáo</span>
                    <span>Chi tiết →</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border-2 border-emerald-100 space-y-2.5 hover:border-emerald-300 transition sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-cute">
                      Kinh Nghiệm Vượt Cạn
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">6 phút đọc</span>
                  </div>
                  <h4 className="text-xs font-black font-cute text-slate-800 hover:text-emerald-700 cursor-pointer">
                    Phân Biệt Cơn Gò Giả Braxton-Hicks Và Cơn Gò Thật Bằng Cách Quan Sát Nhịp Thở Cơ Thể
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Khi áp dụng nhịp thở 4-7-8, cơn gò sinh lý giả thường sẽ dịu lại và biến mất sau 3-5 chu kỳ thở. Nếu cơn gò tiếp tục tăng dần tần suất theo chu kỳ 5 phút/lần kèm đau vùng thắt lưng, mẹ cần chuẩn bị nhập viện đón bé.
                  </p>
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                    <span>Cố vấn Y Khoa MamaCare</span>
                    <span>Đọc trọn bộ hướng dẫn →</span>
                  </div>
                </div>
              </div>
            </div>
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
                      className="flex items-center space-x-1.5 font-bold text-rose-500 hover:scale-105 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-heart"></i>
                      <span>{p.likes} Yêu thương</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleComments(p.id)}
                      className="flex items-center space-x-1.5 font-bold text-purple-600 hover:text-purple-800 transition cursor-pointer"
                    >
                      <i className="fa-regular fa-comment-dots"></i>
                      <span>{p.comments ? p.comments.length : 0} Bình luận & Lời khuyên</span>
                      <i className={`fa-solid ${expandedComments[p.id] ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] ml-0.5`}></i>
                    </button>
                  </div>

                  {/* KHU VỰC BÌNH LUẬN DƯỚI BÀI VIẾT */}
                  {expandedComments[p.id] && (
                    <div className="mt-3 pt-3 border-t border-purple-100/80 space-y-3 bg-purple-50/40 rounded-2xl p-3.5">
                      {/* Danh sách bình luận */}
                      <div className="space-y-2">
                        {(!p.comments || p.comments.length === 0) ? (
                          <p className="text-[11px] text-slate-400 italic text-center py-2">
                            Chưa có lời khuyên nào. Hãy gửi cái ôm hoặc lời chia sẻ đầu tiên đến mẹ nhé! 💕
                          </p>
                        ) : (
                          p.comments.map((cmt, idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-xl border border-purple-100 space-y-1 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-xs">{cmt.avatar || '🌸'}</span>
                                  <span className="text-xs font-black font-cute text-slate-800">
                                    {cmt.author || 'Mẹ Ẩn Danh'}
                                  </span>
                                  {(cmt.authorRole && cmt.authorRole.includes('Bác sĩ')) || cmt.isDoctor ? (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-cute">
                                      Bác Sĩ Cố Vấn
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-md">
                                      {cmt.authorRole || 'Mẹ Bầu'}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 pl-5 leading-relaxed">{cmt.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Form gửi bình luận mới */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendComment(p.id);
                        }}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputs[p.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommentInputs(prev => ({ ...prev, [p.id]: val }));
                          }}
                          placeholder="Gửi lời động viên, chia sẻ kinh nghiệm cùng mẹ..."
                          className="flex-grow p-2.5 bg-white rounded-xl border border-purple-200 text-xs font-medium text-slate-700 outline-none focus:border-purple-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black font-cute shadow-xs transition shrink-0 cursor-pointer"
                        >
                          <i className="fa-solid fa-paper-plane mr-1"></i> Gửi
                        </button>
                      </form>
                    </div>
                  )}
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

      {/* DIALOG MODAL THÔNG BÁO LƯU THÀNH CÔNG (THAY THẾ ALERT) */}
      {successModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSuccessModal(null)}
        >
          <div 
            className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-rose-100 relative overflow-hidden transform transition-all scale-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background cute blobs */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-100/60 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-100/60 rounded-full blur-2xl pointer-events-none"></div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            {/* Header icon & title */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-rose-200">
                {successModal.type === 'profile' ? '📋' : '💖'}
              </div>
              <h3 className="text-base sm:text-lg font-black font-cute text-slate-800 leading-snug">
                {successModal.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
                {successModal.subtitle}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {successModal.details.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-2xl border ${
                    item.highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50/50 border-rose-100'
                  } space-y-0.5`}
                >
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
                    <span>{item.icon}</span>
                    <span className="font-cute text-[11px]">{item.label}</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-black font-cute ${item.highlight ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {item.value}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Sync badge & note */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-start space-x-2 text-[11px] text-emerald-900 leading-relaxed font-medium">
              <span className="text-base mt-0.5">🔄</span>
              <div>
                <span className="font-bold text-emerald-800 font-cute block">Đồng Bộ Dữ Liệu:</span>
                <span>{successModal.note}</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className="w-full py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 hover:from-rose-600 hover:to-pink-600 text-white font-black font-cute text-xs sm:text-sm rounded-2xl shadow-cute bounce-hover transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Tuyệt Vời, Đã Hiểu! ✨</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 1.2: ICON AI TÂM GIAO GÓC PHẢI & POPUP CHAT 24/7
          ========================================================================= */}
      {/* Floating Action Button (Icon nhỏ góc phải) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5">
        {!isAiChatOpen && (
          <div
            onClick={() => setIsAiChatOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border-2 border-rose-200 text-xs font-black font-cute text-rose-600 cursor-pointer hover:scale-105 hover:shadow-xl transition select-none"
          >
            <span>🌸 Tâm sự cùng MamaAI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}

        <button
          type="button"
          id="btn-open-ai-chat"
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer border-2 border-white ring-4 ${
            isAiChatOpen
              ? 'bg-gradient-to-tr from-slate-600 to-slate-800 ring-slate-300 scale-95'
              : 'bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 ring-rose-200/60 hover:scale-110 active:scale-95'
          }`}
          title={isAiChatOpen ? 'Thu nhỏ AI Tâm Giao' : 'AI Tâm Giao 24/7 - Bấm để trò chuyện'}
        >
          {isAiChatOpen ? (
            <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-black">
              ✕
            </div>
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-pink-50">
              <img
                src="/assets/mama_ai_mascot.jpg"
                alt="MamaAI"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Online status dot */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
          )}

          {/* Badge nhỏ khi chưa mở */}
          {!isAiChatOpen && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-600 text-[10px] text-white font-black rounded-full shadow border border-white font-cute">
              AI
            </span>
          )}
        </button>
      </div>

      {/* Popup Cửa Sổ Chat AI Tâm Giao */}
      {isAiChatOpen && (
        <div
          id="mama-ai-chat-popup"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[560px] max-h-[82vh] bg-white rounded-[28px] shadow-2xl border-4 border-pink-200 flex flex-col overflow-hidden"
          style={{
            boxShadow: '0 25px 60px -15px rgba(255, 77, 121, 0.35), 0 10px 25px -5px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header Popup */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 p-3.5 sm:p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="/assets/mama_ai_mascot.jpg"
                  alt="MamaAI Mascot"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-white/90 shadow ring-2 ring-white/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-black font-cute text-white leading-tight">
                    MamaAI Tâm Giao
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-sm">
                    DeepSeek V3
                  </span>
                </div>
                <p className="text-[11px] text-rose-100 font-medium leading-tight mt-0.5">
                  Tra cứu y khoa & thấu cảm thai kỳ 24/7 🌸
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiChatOpen(false)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs sm:text-sm font-bold transition active:scale-90"
              title="Đóng cửa sổ chat"
            >
              ✕
            </button>
          </div>

          {/* Body: Tin nhắn chat */}
          <div className="flex-grow overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20 chat-scroll-area">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'space-x-2.5'}`}
              >
                {msg.sender === 'ai' && (
                  <img
                    src="/assets/mama_ai_mascot.jpg"
                    alt="MamaAI"
                    className="w-8 h-8 rounded-2xl object-cover border border-pink-200 shadow-sm shrink-0 mt-0.5"
                  />
                )}
                <div
                  className={`p-3 sm:p-3.5 text-xs sm:text-sm font-semibold max-w-[85%] leading-relaxed shadow-sm rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-pink-100 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.sender === 'ai' && (
                    <div className="text-[10px] text-slate-400 font-medium mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-rose-500 font-bold">✨ {msg.provider || 'DeepSeek AI Tra Cứu'}</span>
                      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Chuẩn Y Khoa</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-2.5">
                <img
                  src="/assets/mama_ai_mascot.jpg"
                  alt="MamaAI"
                  className="w-8 h-8 rounded-2xl object-cover border border-pink-200 shadow-sm shrink-0"
                />
                <div className="bg-rose-50 rounded-[20px] rounded-tl-none p-3 text-xs text-rose-500 font-bold animate-pulse font-cute border border-rose-100 flex items-center gap-1.5">
                  <span>MamaAI đang lắng nghe và viết lời an ủi...</span>
                  <span className="text-base">✨</span>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Quick Prompts (Gợi ý câu hỏi nhanh) */}
          <div className="px-3 py-2 bg-pink-50/60 border-t border-pink-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              'Mỏi lưng quá có cách nào đỡ không?',
              'Đêm trằn trọc khó ngủ quá AI ơi',
              'Chồng vô tâm không hiểu cho mình...',
              'Em cảm thấy tuyệt vọng quá...'
            ].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handleSendChat(p)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition shrink-0 ${
                  p.includes('tuyệt vọng')
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                    : 'bg-white text-slate-600 hover:bg-pink-100 border border-pink-100'
                }`}
              >
                {p.includes('tuyệt vọng') ? '🚨 Test Red-flag SOS' : p}
              </button>
            ))}
          </div>

          {/* Form nhập & gửi tin nhắn */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="p-3 bg-white border-t border-pink-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Tâm sự ẩn danh cùng MamaAI..."
              className="flex-grow p-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 text-xs font-semibold text-slate-700 outline-none bg-pink-50/30 transition"
            />
            <button
              type="submit"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black flex items-center justify-center shadow-cute hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer"
              title="Gửi tin nhắn"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
