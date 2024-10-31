const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  originalTitle: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  originalContent: {
    type: String
  },
  source: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: {
    type: String
  }
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt
});

module.exports = mongoose.model('Article', articleSchema); 