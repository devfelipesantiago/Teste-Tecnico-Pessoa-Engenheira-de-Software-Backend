const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUserService = require('../../services/userService');
const User = require('../../models/user');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/user');

describe('User Service', () => {
  let userService;
  const mockSecretKey = 'test-secret-key';

  beforeEach(() => {
    userService = createUserService(mockSecretKey);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('hashedpassword');

      const result = await userService.register('testuser', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({ username: 'testuser', password: 'hashedpassword' });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if username already exists', async () => {
      User.findOne.mockResolvedValue({ id: 1, username: 'testuser' });

      await expect(userService.register('testuser', 'password123')).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocktoken');

      const result = await userService.login('testuser', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, mockSecretKey, { expiresIn: '1h' });
      expect(result).toBe('mocktoken');
    });

    it('should throw an error if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(userService.login('nonexistent', 'password123')).rejects.toThrow('User not found');
    });

    it('should throw an error if password is invalid', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid password');
    });
  });
});