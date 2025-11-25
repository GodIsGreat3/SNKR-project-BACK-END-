const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Регистрация
exports.register = async (req, res) => {
  console.log('Данные с фронта:', req.body);

  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email уже зарегистрирован' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmation_code = crypto.randomBytes(20).toString('hex');

    await User.create({ username, email, password: hashedPassword, confirmation_code });

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Подтверждение регистрации',
    //   html: `<p>Привет, ${username}! Подтверди регистрацию: 
    //   <a href="http://localhost:${process.env.PORT}/auth/confirm/${confirmation_code}">Подтвердить</a></p>`
    // };
    // transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Пользователь создан, проверь почту' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Подтверждение email
exports.confirmEmail = async (req, res) => {
  const { code } = req.params;
  const user = await User.findOne({ where: { confirmation_code: code } });
  if (!user) return res.status(400).send('Неверный код подтверждения');

  user.is_confirmed = true;
  user.confirmation_code = null;
  await user.save();

  res.send('Email подтвержден! Можно логиниться.');
};

// Авторизация
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Пользователь не найден' });
    if (!user.is_confirmed) return res.status(400).json({ message: 'Email не подтверждён' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id }, 'SECRET_KEY', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
