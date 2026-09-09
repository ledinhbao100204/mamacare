/**
 * MamaCare Client API SDK
 * Kết nối tương tác trực tiếp hai chiều với Node.js Express Backend
 */
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

const MamaApi = {
  // 1. Kiểm tra trạng thái máy chủ
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      console.warn('[MamaCare API] Backend offline, using local mode', e);
      return { status: 'offline' };
    }
  },

  // 2. Module 1.1: Trạm cảm xúc
  async getMoodAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/mood/analytics`);
      return await res.json();
    } catch (e) {
      return null;
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
    } catch (e) {
      return { success: false, fallback: true };
    }
  },

  async saveJournal(data) {
    try {
      const res = await fetch(`${API_BASE}/mood/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return { success: false, fallback: true };
    }
  },

  // 3. Module 1.2: AI Chat & Red-flag SOS
  async sendAiChat(message) {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // 4. Module 1.4: Diễn đàn Safe Space
  async getForumPosts(room = 'all') {
    try {
      const res = await fetch(`${API_BASE}/forum/posts?room=${room}`);
      return await res.json();
    } catch (e) {
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
    } catch (e) {
      return null;
    }
  },

  async likePost(postId) {
    try {
      const res = await fetch(`${API_BASE}/forum/posts/${postId}/like`, { method: 'POST' });
      return await res.json();
    } catch (e) {
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
    } catch (e) {
      return null;
    }
  },

  // 5. Module 1.5: Thuốc & Lịch khám
  async getMedications() {
    try {
      const res = await fetch(`${API_BASE}/reminders/medications`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async toggleMedication(medId) {
    try {
      const res = await fetch(`${API_BASE}/reminders/medications/${medId}/toggle`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // 6. Module 2.1: Đồng bộ cảm xúc người chồng
  async getPartnerSync() {
    try {
      const res = await fetch(`${API_BASE}/partner/sync`);
      return await res.json();
    } catch (e) {
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
    } catch (e) {
      return null;
    }
  },

  // 7. Module 4: Quản trị Admin
  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getModerationQueue() {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async approveModeration(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/${id}/approve`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteModeration(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};

window.MamaApi = MamaApi;
