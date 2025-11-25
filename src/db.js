const { Sequelize } = require('sequelize');
require('dotenv').config(); // подключаем переменные из .env

const sequelize = new Sequelize(
  process.env.DB_NAME,      // имя базы
  process.env.DB_USER,      // пользователь
  process.env.DB_PASSWORD,  // пароль
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

// Проверка подключения
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

module.exports = sequelize;
