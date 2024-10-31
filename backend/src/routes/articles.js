const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;

    const [articles, total] = await Promise.all([
      Article.find()
        .sort({ createdAt: -1, publishDate: -1 })
        .skip(skip)
        .limit(parseInt(pageSize)),
      Article.countDocuments()
    ]);

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

// 点赞文章
router.post('/:id/like', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    article.likes = (article.likes || 0) + 1;
    await article.save();
    
    res.json({ message: '点赞成功', likes: article.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取文章总数
router.get('/count', async (req, res) => {
  try {
    const count = await Article.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 