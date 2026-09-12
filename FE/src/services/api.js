/**
 * MamaCare React API Service
 * Kết nối với Node.js Express Backend RESTful API (Tương thích cả Local & Vercel)
 */
const API_BASE = '/api';


export const MamaApi = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async submitMoodCheckIn(data) {
    try {
      const res = await fetch(`${API_BASE}/mood/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async sendAiChat(message, history = []) {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getAiConfig() {
    try {
      const res = await fetch(`${API_BASE}/ai/config`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateAiConfig(config) {
    try {
      const res = await fetch(`${API_BASE}/ai/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getForumPosts(room = 'all') {
    try {
      const res = await fetch(`${API_BASE}/forum/posts?room=${room}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async createPost(postData) {
    try {
      const res = await fetch(`${API_BASE}/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async likePost(postId) {
    try {
      const res = await fetch(`${API_BASE}/forum/posts/${postId}/like`, { method: 'POST' });
      return await res.json();
    } catch {
      return null;
    }
  },

  async addPostComment(postId, commentData) {
    try {
      const res = await fetch(`${API_BASE}/forum/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveHealthProfile(profileData) {
    try {
      const res = await fetch(`${API_BASE}/user/health-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async reportPost(postId, reason) {
    try {
      const res = await fetch(`${API_BASE}/forum/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPartnerSync(userId, partnerCode) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (partnerCode) params.append('partnerCode', partnerCode);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/partner/sync${queryStr}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async sendPartnerAction(actionId, label) {
    try {
      const res = await fetch(`${API_BASE}/partner/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, label })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async getModerationQueue() {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async approveModeration(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/${id}/approve`, { method: 'POST' });
      return await res.json();
    } catch {
      return null;
    }
  },

  async deleteModeration(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getTransactions() {
    try {
      const res = await fetch(`${API_BASE}/admin/transactions`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async getZenTracks() {
    try {
      const res = await fetch(`${API_BASE}/zen/tracks`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // --- Module 1.5 Reminders ---
  async getMedications() {
    try {
      const res = await fetch(`${API_BASE}/reminders/medications`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async addMedication(medData) {
    try {
      const res = await fetch(`${API_BASE}/reminders/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medData)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async toggleMedication(id) {
    try {
      const res = await fetch(`${API_BASE}/reminders/medications/${id}/toggle`, { method: 'PUT' });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getAppointments() {
    try {
      const res = await fetch(`${API_BASE}/reminders/appointments`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async addAppointment(appData) {
    try {
      const res = await fetch(`${API_BASE}/reminders/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Auth Methods
  async login(emailOrPhone, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('mamacare_user', JSON.stringify(data.user));
        localStorage.setItem('mamacare_token', data.token || '');
      }
      return data;
    } catch {
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực' };
    }
  },

  async register(formData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('mamacare_user', JSON.stringify(data.user));
        localStorage.setItem('mamacare_token', data.token || '');
      }
      return data;
    } catch {
      return { success: false, message: 'Lỗi đăng ký tài khoản mới' };
    }
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem('mamacare_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('mamacare_user');
    localStorage.removeItem('mamacare_token');
  },

  // User Profile & Pairing Methods
  async getProfile(userId) {
    try {
      const q = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${API_BASE}/user/profile${q}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateProfile(profileData) {
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('mamacare_user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      return { success: false, message: 'Lỗi cập nhật hồ sơ' };
    }
  },

  async generatePairCode(userId) {
    try {
      const res = await fetch(`${API_BASE}/user/generate-pair-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('mamacare_user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      return { success: false, message: 'Lỗi tạo mã ghép đôi' };
    }
  },

  async connectPartner(userId, partnerCode) {
    try {
      const res = await fetch(`${API_BASE}/user/connect-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, partnerCode })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('mamacare_user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      return { success: false, message: 'Lỗi kết nối với đối tác' };
    }
  },

  async disconnectPartner(userId) {
    try {
      const res = await fetch(`${API_BASE}/user/disconnect-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('mamacare_user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      return { success: false, message: 'Lỗi hủy ghép đôi' };
    }
  }
};

