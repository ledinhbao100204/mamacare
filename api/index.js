const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Nạp thông tin kết nối MongoDB từ atlas-credentials.env hoặc qua biến môi trường Vercel MONGODB_URI
const atlasEnv = path.join(__dirname, '../BE/atlas-credentials.env');
if (fs.existsSync(atlasEnv)) {
  dotenv.config({ path: atlasEnv });
}
dotenv.config({ path: path.join(__dirname, '../BE/.env') });

// MONGODB_URI được lấy trực tiếp từ Environment Variables của Vercel hoặc file .env
if (!process.env.DEEPSEEK_MODEL) {
  process.env.DEEPSEEK_MODEL = 'deepseek-chat';
}
if (!process.env.DEEPSEEK_API_URL) {
  process.env.DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mamacare_secret_key_2026';
}

const { connectDB } = require('../BE/config/db');
const apiRoutes = require('../BE/routes/api');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware đảm bảo kết nối MongoDB Atlas trước khi xử lý các request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Lỗi kết nối MongoDB trong Serverless Function:', err);
  }
  next();
});
// Mount các endpoints backend API
app.get('/api/debug-db', async (req, res) => {
  try {
    const status = {
      readyState: mongoose.connection.readyState,
      isDbConnected: require('../BE/config/db').isConnected(),
      hasEnvUri: Boolean(process.env.MONGODB_URI),
      env: process.env.NODE_ENV
    };
    await connectDB();
    status.readyStateAfter = mongoose.connection.readyState;
    status.connected = true;
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({
      success: false,
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
      readyState: mongoose.connection.readyState
    });
  }
});

app.use('/api', apiRoutes);
app.use('/', apiRoutes);

module.exports = app;
