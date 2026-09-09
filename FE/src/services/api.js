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

  async sendAiChat(message) {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
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

  async getPartnerSync() {
    try {
      const res = await fetch(`${API_BASE}/partner/sync`);
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
  }
};

