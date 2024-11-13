const { userSchema } = require('../validations/userValidations');
const logger = require('../config/logger');

const createUserController = (userService) => {
  const register = async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
      logger.error('Invalid user data provided', { error: error.details[0].message });
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body;

    try {
      await userService.register(username, password);
      logger.info('User registered successfully', { username });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      logger.error('Error registering user', { error: error.message, username });
      res.status(400).json({ message: error.message });
    }
  };

  const login = async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
      logger.error('Invalid login data provided', { error: error.details[0].message });
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body;

    try {
      const token = await userService.login(username, password);
      logger.info('User logged in successfully', { username });
      res.json({ token });
    } catch (error) {
      logger.error('Error logging in user', { error: error.message, username });
      res.status(401).json({ message: error.message });
    }
  };

  return {
    register,
    login
  };
};

module.exports = createUserController;