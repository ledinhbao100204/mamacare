const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// RESTful API Router
app.use('/api', apiRoutes);

// Phục vụ giao diện React JSX từ thư mục FE/dist
const DIST_PATH = path.join(__dirname, '../FE/dist');
const FE_PATH = path.join(__dirname, '../FE');
const STATIC_DIR = fs.existsSync(DIST_PATH) ? DIST_PATH : FE_PATH;

app.use(express.static(STATIC_DIR));

// Mọi route khác chuyển về SPA index.html
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(DIST_PATH, 'index.html'))) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  } else {
    res.sendFile(path.join(FE_PATH, 'index.html'));
  }
});

const { connectDB } = require('./config/db');

// Khởi động MongoDB trước khi lắng nghe HTTP requests
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('====================================================');
    console.log('🌸 MAMACARE - NỀN TẢNG ĐỒNG HÀNH THAI KỲ & SỨC KHỎE TINH THẦN');
    console.log('🚀 Server Node.js Express đã khởi chạy thành công!');
    console.log(`🌐 Website URL:  http://localhost:${PORT}`);
    console.log(`📡 REST API URL: http://localhost:${PORT}/api/health`);
    console.log('🍃 Database:     MongoDB connected via Mongoose');
    console.log('====================================================');
  });
}

startServer();

