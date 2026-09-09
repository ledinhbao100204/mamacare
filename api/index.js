const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Nạp thông tin kết nối MongoDB từ atlas-credentials.env hoặc qua biến môi trường Vercel MONGODB_URI
const atlasEnv = path.join(__dirname, '../BE/atlas-credentials.env');
if (fs.existsSync(atlasEnv)) {
  dotenv.config({ path: atlasEnv });
}
dotenv.config({ path: path.join(__dirname, '../BE/.env') });

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
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

module.exports = app;
