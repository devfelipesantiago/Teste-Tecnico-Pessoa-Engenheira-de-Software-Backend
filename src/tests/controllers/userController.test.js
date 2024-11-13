const createUserController = require('../../controllers/userController');

describe('User Controller', () => {
  let userController;
  let mockUserService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockUserService = {
      register: jest.fn(),
      login: jest.fn()
    };

    userController = createUserController(mockUserService);

    mockReq = {
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockReq.body = { username: 'testuser', password: 'password123' };
      mockUserService.register.mockResolvedValue({ id: 1, username: 'testuser' });

      await userController.register(mockReq, mockRes);

      expect(mockUserService.register).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should return 400 if registration fails', async () => {
      mockReq.body = { username: 'testuser', password: 'password123' };
      mockUserService.register.mockRejectedValue(new Error('Registration failed'));

      await userController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Registration failed' });
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      mockReq.body = { username: 'testuser', password: 'password123' };
      mockUserService.login.mockResolvedValue('mocktoken');

      await userController.login(mockReq, mockRes);

      expect(mockUserService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockRes.json).toHaveBeenCalledWith({ token: 'mocktoken' });
    });

    it('should return 401 if login fails', async () => {
      mockReq.body = { username: 'testuser', password: 'wrongpassword' };
      mockUserService.login.mockRejectedValue(new Error('Invalid credentials'));

      await userController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});