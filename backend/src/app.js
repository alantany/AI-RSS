const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// 配置 CORS，允许小程序访问
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// 在生产环境中提供静态文件
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  console.log('Frontend build path:', frontendBuildPath);
  
  app.use(express.static(frontendBuildPath));
  
  app.get('*', (req, res) => {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    console.log('Serving index.html from:', indexPath);
    
    if (!require('fs').existsSync(indexPath)) {
      return res.status(404).send('Frontend build not found');
    }
    res.sendFile(indexPath);
  });
}

// 使用 Railway 提供的 PORT 环境变量
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app; 