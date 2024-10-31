const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
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

// 初始化数据库和启动服务器
(async () => {
  try {
    // 使用 force: false，保留现有数据
    await sequelize.sync({ force: false });
    console.log('数据库模型同步完成');

    // 检查是否存在管理员账户
    const adminExists = await Admin.findOne();
    if (!adminExists) {
      console.log('创建默认管理员账户...');
      await Admin.create({
        password: Admin.hashPassword('admin123'),
        isFirstLogin: false
      });
      console.log('默认管理员账户创建成功');
    }

    // 检查是否存在设置
    const settingExists = await Setting.findOne();
    if (!settingExists) {
      console.log('创建默认设置...');
      await Setting.create({
        crawlInterval: 240,
        preArticlesPerSource: 20,
        finalArticlesCount: 5,
        autoCrawl: false
      });
      console.log('默认设置创建成功');
    }

    // API路由
    const articlesRouter = require('./routes/articles');
    const adminRouter = require('./routes/admin');
    app.use('/api/articles', articlesRouter);
    app.use('/api/admin', adminRouter);

    // 启动服务器
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });

    // 创建爬虫服务实例
    const crawlerService = new CrawlerService();
    
    // 检查是否开启自动抓取
    const setting = await Setting.findOne();
    if (setting?.autoCrawl) {
      console.log('自动抓取已开启，启动定时任务');
      crawlerService.startCronJob();
    } else {
      console.log('自动抓取已关闭，可以通过管理面板手动触发抓取');
    }

  } catch (error) {
    console.error('启动失败:', error);
  }
})(); 