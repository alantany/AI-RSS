const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// 启用 CORS
app.use(cors());

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API 路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// 所有其他GET请求返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 