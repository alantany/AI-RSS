const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const CrawlerService = require('./services/crawler');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 导入所有模型
const Article = require('./models/Article');
const Admin = require('./models/Admin');
const Setting = require('./models/Setting');

// 连接数据库
connectDB();

// API路由
const articlesRouter = require('./routes/articles');
const adminRouter = require('./routes/admin');
app.use('/api/articles', articlesRouter);
app.use('/api/admin', adminRouter);

// 对于本地开发
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}

// 为 Vercel 导出
module.exports = app; 