const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalTitle: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  originalContent: {
    type: DataTypes.TEXT
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  publishDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Article; 