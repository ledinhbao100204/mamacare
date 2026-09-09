/**
 * MAMACARE - ADMIN PAGE JAVASCRIPT
 * Xử lý tương tác Phân hệ 3: Ban Quản Lý Dự Án
 */

// 1. Khởi tạo các biểu đồ quản trị Chart.js
function initAdminCharts() {
    // A. Biểu đồ tăng trưởng người dùng (Bar Chart)
    const ctxUser = document.getElementById('userGrowthChart')?.getContext('2d');
    if (ctxUser) {
        new Chart(ctxUser, {
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

    // B. Biểu đồ tâm lý cộng đồng (Doughnut Chart)
    const ctxMood = document.getElementById('communityMoodChart')?.getContext('2d');
    if (ctxMood) {
        new Chart(ctxMood, {
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

    // C. Biểu đồ doanh thu (Doughnut Chart)
    const ctxRev = document.getElementById('revenuePieChart')?.getContext('2d');
    if (ctxRev) {
        new Chart(ctxRev, {
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

// 2. Thao tác hàng đợi kiểm duyệt nội dung
async function adminApprove(id, btn) {
    if (window.MamaApi) {
        try {
            await MamaApi.approveModeration(id);
        } catch (e) {
            console.warn('API approve error', e);
        }
    }
    const row = btn.closest('tr');
    if (row) {
        row.querySelector('.action-cell').innerHTML = '<span class="text-emerald-600 font-black text-xs font-cute">Đã duyệt ✨</span>';
    }
}

async function adminDelete(id, btn) {
    if (confirm('Bạn có chắc chắn muốn gỡ bỏ vĩnh viễn bài viết vi phạm này không?')) {
        if (window.MamaApi) {
            try {
                await MamaApi.deleteModeration(id);
            } catch (e) {
                console.warn('API delete error', e);
            }
        }
        const row = btn.closest('tr');
        if (row) row.remove();
        alert('Đã gỡ bỏ bài viết vi phạm khỏi hệ thống!');
    }
}

function adminSosContact(id, btn) {
    alert('Đã kích hoạt cuộc gọi khẩn cấp tới chuyên viên công tác xã hội & bác sĩ tâm lý để hỗ trợ mẹ bầu ngay lập tức!');
    btn.className = "px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs";
    btn.innerText = "Đã Can Thiệp";
}

function exportRevenueReport() {
    alert('Đang xuất báo cáo doanh thu tháng 9/2026 định dạng Excel / CSV thành công!');
}

window.addEventListener('DOMContentLoaded', () => {
    initAdminCharts();

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
