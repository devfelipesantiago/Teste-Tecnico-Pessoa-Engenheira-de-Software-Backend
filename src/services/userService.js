const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const createUserService = (secretKey) => {
  
  const register = async (username, password) => {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return User.create({ username, password: hashedPassword });
  };

  const login = async (username, password) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
    return token;
  };

  return {
    register,
    login
  };
};

module.exports = createUserService;