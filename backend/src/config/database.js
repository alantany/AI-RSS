const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // 生产环境使用 PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // 开发环境使用 SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite')
  });
}

module.exports = sequelize; 