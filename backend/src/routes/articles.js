const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { Op } = require('sequelize');

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const { rows: articles, count: total } = await Article.findAndCountAll({
      order: [
        ['createdAt', 'DESC'],
        ['publishDate', 'DESC']
      ],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json({
      articles,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 手动触发抓取
router.post('/fetch', async (req, res) => {
  try {
    const crawlerService = new CrawlerService();
    await crawlerService.manualFetch();
    res.json({ message: '抓取任务已执行' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加一个新的路由来检查文章数量
router.get('/count', async (req, res) => {
  try {
    const count = await Article.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 