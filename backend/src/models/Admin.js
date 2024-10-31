const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const Admin = sequelize.define('Admin', {
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isFirstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// 添加密码哈希方法
Admin.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

module.exports = Admin; 