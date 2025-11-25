const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Нет токена, авторизация невозможна' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    // Проверка токена
    const decoded = jwt.verify(token, 'SECRET_KEY'); // Используй ту же секретную строку, что и при логине
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Передаем пользователя в следующий middleware или в обработчик
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Неверный или просроченный токен' });
  }
};

module.exports = authMiddleware;
