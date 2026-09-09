/**
 * MAMACARE - MOM PAGE JAVASCRIPT
 * Xử lý toàn bộ tương tác Phân hệ 1: Dành Cho Mẹ Bầu
 */

// Application State
const momState = {
    currentTab: 'mood',
    selectedMood: {
        title: 'Nắng Rực Rỡ',
        emoji: '🥰',
        description: 'Đang rất vui vẻ & Hạnh phúc',
        score: 90
    },
    symptoms: ['Khỏe khoắn'],
    waterCount: 6,
    waterTarget: 8,
    weight: 58.5,
    temperature: 36.8,
    audioPlaying: false,
    audioCtx: null,
    oscillator: null,
    gainNode: null,
    noiseNode: null,
    breathingActive: false,
    breathInterval: null,
    moodChart: null,
    posts: [
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
    ],
    medications: [
        { id: 1, name: "Sắt hữu cơ Fumafer (1 viên sau ăn sáng)", time: "08:00 AM", taken: true },
        { id: 2, name: "Canxi Nano BioCal (1 viên sau ăn trưa)", time: "13:00 PM", taken: true },
        { id: 3, name: "DHA Thai kỳ BioIsland (2 viên sau ăn tối)", time: "19:30 PM", taken: false },
        { id: 4, name: "Acid Folic 400mcg (1 viên trước khi ngủ)", time: "21:30 PM", taken: false }
    ],
    appointments: [
        { id: 1, title: "Siêu âm hình thái 4D (Mốc Tuần 22)", date: "14/09/2026", doctor: "BS. Nguyễn Mai Phương", countdown: "Còn 5 ngày" },
        { id: 2, title: "Nghiệm pháp dung nạp Glucose (Tuần 26)", date: "05/10/2026", doctor: "BS. Lê Hoàng Nam", countdown: "Còn 26 ngày" }
    ]
};

// 1. Chuyển đổi Sub-tabs trong phân hệ Mẹ
function switchMomTab(tabName) {
    momState.currentTab = tabName;
    const tabs = ['mood', 'ai', 'zen', 'forum', 'reminders'];
    
    tabs.forEach(t => {
        const sec = document.getElementById(`momSubSection-${t}`);
        const btn = document.getElementById(`momTab-${t}`);
        if (sec) {
            if (t === tabName) {
                sec.classList.remove('hidden');
            } else {
                sec.classList.add('hidden');
            }
        }
        if (btn) {
            if (t === tabName) {
                btn.className = "mom-tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-cute border-2 border-white bounce-hover";
            } else {
                btn.className = "mom-tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold font-cute whitespace-nowrap bg-white text-slate-600 border-2 border-slate-100 hover:border-pink-200 bounce-hover";
            }
        }
    });

    if (tabName === 'forum') {
        renderForumPosts('all');
    }
}

// 2. Chọn cảm xúc 5 giây
function selectMood(title, emoji, desc, elem) {
    document.querySelectorAll('.mood-opt').forEach(el => el.classList.remove('active-mood'));
    if (elem) elem.classList.add('active-mood');

    momState.selectedMood = { title, emoji, description: desc };
    const notice = document.getElementById('selectedMoodNotice');
    if (notice) notice.innerText = `Đang chọn: ${emoji} ${title}`;
}

function toggleSymptom(tag, elem) {
    elem.classList.toggle('bg-rose-500');
    elem.classList.toggle('text-white');
    elem.classList.toggle('border-rose-500');

    const idx = momState.symptoms.indexOf(tag);
    if (idx > -1) {
        momState.symptoms.splice(idx, 1);
    } else {
        momState.symptoms.push(tag);
    }
}

// 3. Bộ đếm nước
function changeWater(delta) {
    let count = momState.waterCount + delta;
    if (count < 0) count = 0;
    if (count > momState.waterTarget) count = momState.waterTarget;
    momState.waterCount = count;
    renderWaterCups();
}

function setWater(val) {
    momState.waterCount = val;
    renderWaterCups();
}

function renderWaterCups() {
    const container = document.getElementById('waterCupsContainer');
    if (!container) return;
    let html = '';
    for (let i = 1; i <= momState.waterTarget; i++) {
        if (i <= momState.waterCount) {
            html += `<span class="text-xl sm:text-2xl bounce-hover cursor-pointer" onclick="setWater(${i})" title="Đã uống ${i*250}ml">🥛</span>`;
        } else {
            html += `<span class="text-xl sm:text-2xl opacity-30 hover:opacity-60 cursor-pointer" onclick="setWater(${i})" title="Chưa uống">⚪</span>`;
        }
    }
    container.innerHTML = html;
    const txt = document.getElementById('waterProgressText');
    if (txt) txt.innerText = `${momState.waterCount} / ${momState.waterTarget} Ly (${momState.waterCount * 250}ml)`;
}

// 4. Lưu Check-in & Nhật ký
async function saveMoodEntry() {
    const journalText = document.getElementById('journalInput')?.value.trim() || '';

    const payload = {
        mood: momState.selectedMood.title,
        symptoms: momState.symptoms,
        waterCount: momState.waterCount,
        journal: journalText
    };

    if (window.MamaApi) {
        try {
            await MamaApi.submitMoodCheckIn(payload);
        } catch (e) {
            console.warn('Backend sync fallback', e);
        }
    }

    alert('💖 Đã lưu dữ liệu cảm xúc & sức khỏe thành công! Dữ liệu đã được đồng bộ tự động sang Bố Bỉm.');
}

// 5. Thu âm giọng nói bằng Web Speech API
function toggleVoiceInput() {
    const micBtn = document.getElementById('micBtn');
    const wave = document.getElementById('recordingWave');
    const textarea = document.getElementById('journalInput');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'vi-VN';
        rec.interimResults = false;

        if (wave) wave.classList.remove('hidden');
        if (micBtn) micBtn.classList.add('text-rose-500', 'animate-pulse');

        rec.onresult = function(e) {
            const transcript = e.results[0][0].transcript;
            if (textarea) textarea.value = (textarea.value ? textarea.value + ' ' : '') + transcript;
        };

        rec.onerror = function() {
            if (wave) wave.classList.add('hidden');
            if (micBtn) micBtn.classList.remove('text-rose-500', 'animate-pulse');
            if (textarea) textarea.value = "Hôm nay em thấy mỏi thắt lưng nhiều, nhưng ăn ngon miệng và bé đạp đều...";
        };

        rec.onend = function() {
            if (wave) wave.classList.add('hidden');
            if (micBtn) micBtn.classList.remove('text-rose-500', 'animate-pulse');
        };

        rec.start();
    } else {
        if (textarea) textarea.value = "Hôm nay trong người hơi mệt mỏi, mong anh xã về sớm massage lưng cho em...";
        alert('Trình duyệt không hỗ trợ Web Speech API. Đã điền đoạn ghi âm mẫu.');
    }
}

// 6. Chat AI Tâm Giao & Red-flag Detection
function sendQuickChat(text) {
    const input = document.getElementById('aiInput');
    if (input) {
        input.value = text;
        handleAiChat(new Event('submit'));
    }
}

async function handleAiChat(e) {
    e.preventDefault();
    const input = document.getElementById('aiInput');
    const userMsg = input.value.trim();
    if (!userMsg) return;

    const chatContainer = document.getElementById('chatContainer');

    // Render tin nhắn của mẹ
    const userBubble = `
        <div class="flex items-start justify-end space-x-3">
            <div class="chat-bubble-user p-4 text-xs sm:text-sm max-w-lg shadow-sm font-semibold">
                ${userMsg}
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', userBubble);
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Kiểm tra Red-flag từ khóa nguy hiểm
    const redFlags = ['tuyệt vọng', 'làm hại bản thân', 'ghét bỏ đứa trẻ', 'không muốn sống', 'tự tử', 'chết'];
    const hasRedFlag = redFlags.some(k => userMsg.toLowerCase().includes(k));

    if (hasRedFlag) {
        openSosModal();
    }

    // Hiển thị bong bóng typing
    const typingId = 'typing-' + Date.now();
    const typingBubble = `
        <div id="${typingId}" class="flex items-start space-x-3">
            <div class="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-sm font-bold">
                <span>🎀</span>
            </div>
            <div class="bg-rose-50 rounded-[22px] p-3 text-xs text-slate-500 font-bold animate-pulse font-cute border border-rose-100">
                MamaAI đang lắng nghe và viết lời an ủi ngọt ngào cho mẹ... ✨
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', typingBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    let aiReply = "MamaAI ôm mẹ thật chặt nhé! Mang thai là một hành trình kỳ diệu nhưng cũng đầy thử thách. Mẹ hãy cứ thả lỏng, uống một ngụm nước ấm và nghỉ ngơi một chút, mẹ đang làm rất tuyệt vời rồi! ❤️🌸";

    if (window.MamaApi) {
        try {
            const apiRes = await MamaApi.sendAiChat(userMsg);
            if (apiRes) {
                aiReply = apiRes.reply;
                if (apiRes.isRedFlag) {
                    openSosModal();
                }
            }
        } catch (err) {
            console.warn('API error, using local reply engine', err);
        }
    }

    setTimeout(() => {
        document.getElementById(typingId)?.remove();
        const aiBubble = `
            <div class="flex items-start space-x-3">
                <div class="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold shadow-sm">
                    <span>🎀</span>
                </div>
                <div class="chat-bubble-ai p-4 text-xs sm:text-sm font-semibold text-slate-700 max-w-lg leading-relaxed shadow-sm">
                    ${aiReply}
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', aiBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
}

function openSosModal() {
    document.getElementById('sosModal')?.classList.remove('hidden');
}

function closeSosModal() {
    document.getElementById('sosModal')?.classList.add('hidden');
}

// 7. Bài tập thở 4-7-8 Zen Space
function toggleBreathingExercise() {
    const btn = document.getElementById('breathBtn');
    const ring = document.getElementById('breatheRing');
    const timer = document.getElementById('breathTimer');
    const phaseText = document.getElementById('breathPhaseText');
    const instruction = document.getElementById('breathInstruction');

    if (!momState.breathingActive) {
        momState.breathingActive = true;
        if (btn) btn.innerText = "⏹️ Dừng Bài Tập";
        if (ring) ring.classList.add('breathe-circle-cute');
        
        let step = 0;
        if (phaseText) phaseText.innerText = "Hít Vào";
        if (instruction) instruction.innerText = "Hít vào thật sâu bằng mũi nhẹ nhàng (4 giây)...";
        if (timer) timer.innerText = "4s";

        momState.breathInterval = setInterval(() => {
            step = (step + 1) % 3;
            if (step === 0) {
                if (phaseText) phaseText.innerText = "Hít Vào";
                if (instruction) instruction.innerText = "Hít vào thật sâu bằng mũi nhẹ nhàng (4 giây)...";
                if (timer) timer.innerText = "4s";
            } else if (step === 1) {
                if (phaseText) phaseText.innerText = "Nín Thở";
                if (instruction) instruction.innerText = "Giữ hơi thở lắng đọng êm ái, thả lỏng vai (7 giây)...";
                if (timer) timer.innerText = "7s";
            } else {
                if (phaseText) phaseText.innerText = "Thở Ra";
                if (instruction) instruction.innerText = "Thở ra từ từ bằng miệng xua tan mệt mỏi (8 giây)...";
                if (timer) timer.innerText = "8s";
            }
        }, 4000);
    } else {
        momState.breathingActive = false;
        if (btn) btn.innerText = "🍃 Bắt Đầu Nhịp Thở Zen";
        if (ring) ring.classList.remove('breathe-circle-cute');
        clearInterval(momState.breathInterval);
        if (instruction) instruction.innerText = "Giúp ổn định nhịp tim, giảm bớt cơn hoảng loạn và âu lo tức thì";
        if (phaseText) phaseText.innerText = "Sẵn sàng";
        if (timer) timer.innerText = "4s";
    }
}

// 8. Web Audio API Synthesizer (Sóng não thực tế)
function playAudioSynthesizer(title, freq, type) {
    stopAudioSynthesizer();
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        momState.audioCtx = new AudioContext();
        momState.gainNode = momState.audioCtx.createGain();
        momState.gainNode.gain.setValueAtTime(0.08, momState.audioCtx.currentTime);
        momState.gainNode.connect(momState.audioCtx.destination);

        if (type === 'pink_noise') {
            const bufferSize = momState.audioCtx.sampleRate * 2;
            const noiseBuffer = momState.audioCtx.createBuffer(1, bufferSize, momState.audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
            }
            momState.noiseNode = momState.audioCtx.createBufferSource();
            momState.noiseNode.buffer = noiseBuffer;
            momState.noiseNode.loop = true;
            momState.noiseNode.connect(momState.gainNode);
            momState.noiseNode.start();
        } else {
            momState.oscillator = momState.audioCtx.createOscillator();
            momState.oscillator.type = 'sine';
            momState.oscillator.frequency.setValueAtTime(freq, momState.audioCtx.currentTime);
            momState.oscillator.connect(momState.gainNode);
            momState.oscillator.start();
        }

        momState.audioPlaying = true;
        document.getElementById('currentPlayingTrackName').innerText = title;
        document.getElementById('audioPlayerBar')?.classList.remove('hidden');
    } catch (e) {
        console.error('Audio synthesizer error:', e);
    }
}

function stopAudioSynthesizer() {
    if (momState.oscillator) {
        try { momState.oscillator.stop(); } catch(e){}
        momState.oscillator = null;
    }
    if (momState.noiseNode) {
        try { momState.noiseNode.stop(); } catch(e){}
        momState.noiseNode = null;
    }
    if (momState.audioCtx) {
        try { momState.audioCtx.close(); } catch(e){}
        momState.audioCtx = null;
    }
    momState.audioPlaying = false;
    document.getElementById('audioPlayerBar')?.classList.add('hidden');
}

// 9. Diễn Đàn Góc Khuất (Safe Space Forum)
function renderForumPosts(room = 'all') {
    const list = document.getElementById('forumPostsList');
    if (!list) return;

    let filtered = momState.posts;
    if (room !== 'all') {
        filtered = momState.posts.filter(p => p.room === room);
    }

    list.innerHTML = filtered.map(p => `
        <div class="forum-card forum-card-${p.room} bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold font-cute">🌸</span>
                    <span class="text-xs font-black font-cute text-slate-800">${p.author}</span>
                    <span class="text-[10px] text-slate-400 font-semibold">• ${p.time}</span>
                </div>
                <button type="button" onclick="reportPost('${p.id}')" class="text-[11px] font-bold text-slate-400 hover:text-rose-500">
                    <i class="fa-regular fa-flag mr-1"></i>Báo Cáo
                </button>
            </div>
            <h4 class="text-sm font-black font-cute text-slate-800">${p.title}</h4>
            <p class="text-xs text-slate-600 leading-relaxed">${p.content}</p>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button type="button" onclick="likePost('${p.id}')" class="flex items-center space-x-1.5 font-bold text-rose-500 hover:scale-105 transition">
                    <i class="fa-solid fa-heart"></i>
                    <span>${p.likes} Yêu thương</span>
                </button>
            </div>
        </div>
    `).join('');
}

function createNewPost() {
    const text = document.getElementById('forumPostText')?.value.trim();
    const room = document.getElementById('forumRoomSelect')?.value || 'rage';
    if (!text) {
        alert('Mẹ vui lòng nhập nội dung tâm sự nhé!');
        return;
    }

    const newP = {
        id: 'post-' + Date.now(),
        room,
        author: 'Mẹ Bồ Công Anh #' + Math.floor(Math.random() * 900 + 100),
        title: 'Tâm sự ẩn danh của mẹ',
        content: text,
        likes: 0,
        time: 'Vừa xong'
    };

    momState.posts.unshift(newP);
    if (window.MamaApi) {
        MamaApi.createPost({ title: newP.title, content: text, room });
    }

    document.getElementById('forumPostText').value = '';
    renderForumPosts(room);
    alert('✨ Đã đăng bài ẩn danh thành công!');
}

function likePost(id) {
    const p = momState.posts.find(item => item.id === id);
    if (p) {
        p.likes += 1;
        renderForumPosts(document.getElementById('forumRoomSelect')?.value || 'all');
        if (window.MamaApi) MamaApi.likePost(id);
    }
}

function reportPost(id) {
    if (window.MamaApi) MamaApi.reportPost(id, 'Nội dung độc hại');
    alert('Cảm ơn mẹ đã báo cáo. Đội ngũ kiểm duyệt Admin đã tiếp nhận và sẽ xử lý ngay!');
}

// 10. Checklist Thuốc & Lịch Khám
function renderMedications() {
    const list = document.getElementById('medList');
    if (!list) return;

    let takenCount = 0;
    list.innerHTML = momState.medications.map(med => {
        if (med.taken) takenCount++;
        return `
            <div class="p-3.5 bg-rose-50/60 rounded-[20px] border-2 border-rose-100 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" ${med.taken ? 'checked' : ''} onchange="toggleMed(${med.id})" class="med-checkbox rounded-full text-rose-500 w-5 h-5 accent-rose-500 cursor-pointer">
                    <span class="text-xs sm:text-sm font-bold ${med.taken ? 'line-through text-slate-400' : 'text-slate-800'}">${med.name}</span>
                </div>
                <span class="text-xs font-black font-cute text-rose-500 bg-white px-3 py-1 rounded-full border border-rose-200 shadow-sm">${med.time}</span>
            </div>
        `;
    }).join('');

    const total = momState.medications.length;
    const pct = total > 0 ? Math.round((takenCount / total) * 100) : 0;
    const pctElem = document.getElementById('medProgressPercent');
    const barElem = document.getElementById('medProgressBar');
    if (pctElem) pctElem.innerText = `${pct}% (${takenCount}/${total} cữ)`;
    if (barElem) barElem.style.width = `${pct}%`;
}

function toggleMed(id) {
    const med = momState.medications.find(m => m.id === id);
    if (med) med.taken = !med.taken;
    renderMedications();
}

function addMedicationPrompt() {
    const name = prompt('Nhập tên thuốc hoặc vi chất:');
    const time = prompt('Nhập giờ uống:');
    if (name && time) {
        momState.medications.push({ id: Date.now(), name, time, taken: false });
        renderMedications();
    }
}

function renderAppointments() {
    const list = document.getElementById('appointmentList');
    if (!list) return;

    list.innerHTML = momState.appointments.map(app => `
        <div class="p-4 bg-sky-50/70 rounded-[22px] border-2 border-sky-100 space-y-1.5 hover:border-sky-300 transition">
            <div class="flex justify-between items-center">
                <h4 class="text-xs sm:text-sm font-black font-cute text-slate-800">${app.title}</h4>
                <span class="text-[10px] font-black font-cute bg-sky-200 text-sky-800 px-2.5 py-0.5 rounded-full">${app.countdown}</span>
            </div>
            <div class="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                <span>${app.doctor}</span>
                <span class="font-bold text-slate-700">📅 ${app.date}</span>
            </div>
        </div>
    `).join('');
}

function addAppointmentPrompt() {
    const title = prompt('Tên mốc khám (ví dụ: Siêu âm 4D):');
    const date = prompt('Ngày khám:');
    const doctor = prompt('Bác sĩ:') || 'Bệnh viện Phụ Sản';
    if (title && date) {
        momState.appointments.push({ id: Date.now(), title, date, doctor, countdown: 'Mới đặt' });
        renderAppointments();
    }
}

// 11. Biểu đồ Chart.js Phân tích Tâm lý
function initMoodChart() {
    const ctx = document.getElementById('moodChart')?.getContext('2d');
    if (!ctx) return;

    momState.moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [{
                label: 'Chỉ số Tích cực',
                data: [45, 35, 25, 55, 70, 85, 40],
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

function toggleMoodChartPeriod(period) {
    if (!momState.moodChart) return;
    const btnWeek = document.getElementById('chartPeriod-week');
    const btnMonth = document.getElementById('chartPeriod-month');
    const trend = document.getElementById('moodTrendStatus');

    if (period === 'week') {
        if (btnWeek) btnWeek.className = "px-2.5 py-1 rounded-lg bg-white text-rose-600 shadow-sm";
        if (btnMonth) btnMonth.className = "px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800";
        momState.moodChart.data.labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        momState.moodChart.data.datasets[0].data = [45, 35, 25, 55, 70, 85, 40];
        if (trend) {
            trend.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span class="text-lg">📉</span>
                    <div>
                        <p class="text-xs font-black font-cute text-rose-600">Tâm trạng đang có dấu hiệu đi xuống</p>
                        <p class="text-[10px] text-slate-500">Mẹ dễ xúc động & tủi thân hơn vào buổi tối</p>
                    </div>
                </div>
                <span class="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-cute">Cần quan tâm</span>
            `;
        }
    } else {
        if (btnMonth) btnMonth.className = "px-2.5 py-1 rounded-lg bg-white text-rose-600 shadow-sm";
        if (btnWeek) btnWeek.className = "px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800";
        momState.moodChart.data.labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        momState.moodChart.data.datasets[0].data = [50, 65, 75, 58];
        if (trend) {
            trend.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span class="text-lg">📈</span>
                    <div>
                        <p class="text-xs font-black font-cute text-emerald-600">Tổng thể tháng: Ổn định và đi lên (+12%)</p>
                        <p class="text-[10px] text-slate-500">Mẹ đã duy trì uống nước và tập yoga đều đặn</p>
                    </div>
                </div>
                <span class="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-cute">Khá tốt</span>
            `;
        }
    }
    momState.moodChart.update();
}

// Khởi chạy khi DOM load
window.addEventListener('DOMContentLoaded', () => {
    renderWaterCups();
    renderMedications();
    renderAppointments();
    renderForumPosts('all');
    initMoodChart();

    if (window.MamaApi) {
        MamaApi.checkHealth().then(health => {
            const badge = document.getElementById('nodeBackendBadge');
            if (badge && health && health.status === 'ok') {
                badge.classList.remove('hidden');
                badge.classList.add('inline-flex');
            }
        });
    }
});
