/**
 * MAMACARE - HUSBAND PAGE JAVASCRIPT
 * Xử lý tương tác Phân hệ 2: Dành Cho Người Chồng (Bố Bỉm)
 */

const husbandState = {
    partnerCode: 'MAMA-8899',
    wifeName: 'Thùy Trang',
    week: 24
};

// 1. Thực hiện hành động cứu vợ
async function takePartnerAction(actionId, label, btn) {
    if (btn) {
        btn.innerText = 'Đã làm ❤️';
        btn.disabled = true;
        btn.className = 'px-3.5 py-2 bg-slate-300 text-white rounded-xl text-xs font-black font-cute shrink-0 cursor-not-allowed';
    }

    if (window.MamaApi) {
        try {
            await MamaApi.sendPartnerAction(actionId, label);
        } catch (e) {
            console.warn('API partner action fallback', e);
        }
    }

    alert(`💌 Tuyệt vời! Bạn đã gửi yêu thương: "${label}" đến màn hình của vợ.`);
}

// 2. Daddy Bootcamp Video Modal
function openBootcampVideo(topic) {
    const modal = document.getElementById('bootcampModal');
    const badge = document.getElementById('bootcampBadge');
    const title = document.getElementById('bootcampVideoTitle');
    const desc = document.getElementById('bootcampVideoDesc');
    const quizQ = document.getElementById('bootcampQuizQuestion');

    if (topic === 'hormone') {
        badge.innerText = "Kiến Thức Hormone";
        title.innerText = "Giải Mã Hormone Progesterone & Tâm Trạng Của Vợ";
        desc.innerText = "Thời lượng: 0:45 min • Hiểu vì sao vợ dễ khóc vô cớ";
        quizQ.innerText = "Khi vợ đột ngột khóc vì tủi thân, bố nên làm gì?";
    } else if (topic === 'massage') {
        badge.innerText = "Kỹ Năng Massage";
        title.innerText = "3 Động Tác Xoa Bóp Thắt Lưng Cho Vợ Bầu";
        desc.innerText = "Thời lượng: 0:58 min • Giảm đau mỏi tức thì";
        quizQ.innerText = "Khi massage lưng cho vợ, bố nên dùng lực như thế nào?";
    } else if (topic === 'speech') {
        badge.innerText = "Nghệ Thuật Giao Tiếp";
        title.innerText = "Những Câu Nói Cứu Nguy Cho Bố Bỉm";
        desc.innerText = "Thời lượng: 0:50 min • Tránh xa những câu nói cấm kỵ";
        quizQ.innerText = "Câu nói nào sau đây giúp vợ bầu an tâm nhất?";
    } else {
        badge.innerText = "Chuẩn Bị Đi Sinh";
        title.innerText = "Checklist Giỏ Đồ Đi Sinh Chuẩn Chỉnh";
        desc.innerText = "Thời lượng: 0:55 min • Không lo quên đồ lúc chuyển dạ";
        quizQ.innerText = "Vật dụng quan trọng nhất bố phải chuẩn bị sẵn là gì?";
    }

    document.getElementById('bootcampQuizResult')?.classList.add('hidden');
    modal?.classList.remove('hidden');
}

function closeBootcampModal() {
    document.getElementById('bootcampModal')?.classList.add('hidden');
}

function answerBootcampQuiz(isCorrect) {
    const res = document.getElementById('bootcampQuizResult');
    if (!res) return;
    res.classList.remove('hidden');

    if (isCorrect) {
        res.innerText = "🎉 Chính xác 100%! Bố đã nhận được Huy Hiệu Bố Bỉm Tinh Tế Chuẩn 10 Điểm! 🌟";
        res.className = "text-xs font-black font-cute text-emerald-600 mt-2 block";
    } else {
        res.innerText = "⚠️ Chưa đúng rồi bố ơi! Hãy chọn phương án thể hiện sự thấu hiểu và lắng nghe nhé.";
        res.className = "text-xs font-black font-cute text-rose-500 mt-2 block";
    }
}

// 3. QR Modal
function openQrModal() {
    document.getElementById('qrModal')?.classList.remove('hidden');
}

function closeQrModal() {
    document.getElementById('qrModal')?.classList.add('hidden');
}

// 4. Push Notification Toast Handler
function dismissPushNotif() {
    document.getElementById('pushNotificationBanner')?.classList.add('hidden');
}

function triggerHusbandPushAlert(title, message) {
    const banner = document.getElementById('pushNotificationBanner');
    const titleEl = document.getElementById('pushNotifTitle');
    const msgEl = document.getElementById('pushNotifBody');

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    if (banner) {
        banner.classList.remove('hidden');
        setTimeout(() => { banner.classList.add('hidden'); }, 12000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
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
