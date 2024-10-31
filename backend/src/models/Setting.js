const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  crawlInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 240, // 默认4小时（240分钟）
    allowNull: false
  },
  preArticlesPerSource: {
    type: DataTypes.INTEGER,
    defaultValue: 20,  // 每个源预抓取的文章数量
    allowNull: false
  },
  finalArticlesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 5,   // 最终保存的文章数量
    allowNull: false
  },
  autoCrawl: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,  // 默认关闭自动抓取
    allowNull: false
  },
  lastCrawlTime: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Setting; 