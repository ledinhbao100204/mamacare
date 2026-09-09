# 🌸 MamaCare - Nền Tảng Đồng Hành Thai Kỳ & Sức Khỏe Tinh Thần

Hệ thống hỗ trợ toàn diện sức khỏe tinh thần cho mẹ bầu, kết nối bạn đời và ban quản trị y tế chuẩn khoa học.

---

## 🚀 Kiến Trúc Hệ Thống (Fullstack)

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + Chart.js.
- **Backend**: Node.js + Express.js.
- **Cơ sở dữ liệu**: MongoDB Atlas Cloud.
- **Hosting & CI/CD**: Vercel & GitHub.

---

## 📂 Cấu Trúc Thư Mục

```text
WEB/
├── FE/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── components/     # Header, Navigation, v.v.
│   │   ├── views/          # AuthView, MomView, HusbandView, AdminView
│   │   ├── services/api.js # API client kết nối Backend
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
├── BE/                     # Backend Node.js Express
│   ├── config/db.js        # Kết nối MongoDB Atlas (hỗ trợ Serverless cache)
│   ├── models/             # Mongoose Models (User, MoodRecord, ForumPost, v.v.)
│   ├── routes/api.js       # RESTful API Endpoints
│   └── server.js           # Server Express chạy local
├── api/
│   └── index.js            # Vercel Serverless Function entry point
├── vercel.json             # Cấu hình routing và build của Vercel
├── package.json            # Scripts quản lý Fullstack
└── README.md
```

---

## ⚙️ Hướng Dẫn Chạy Môi Trường Cục Bộ (Local)

### 1. Cài đặt dependencies
```bash
# Cài đặt Backend
cd BE && npm install

# Cài đặt Frontend
cd ../FE && npm install --legacy-peer-deps
```

### 2. Khởi chạy dự án
```bash
# Chạy cả Frontend & Backend
npm run dev
```
- Frontend: `http://localhost:5173` (hoặc `http://localhost:3000` khi build)
- Backend: `http://localhost:3000/api/health`

---