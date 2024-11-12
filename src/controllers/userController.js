const createUserController = (userService) => {
  
  const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
      await userService.register(name, email, password);
      return res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  const login = async (req, res) => {
    const { email, password } = req.body;

    try {
      const token = await userService.login(email, password);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  };

  const getUsers = (req, res) => {
    const users = userService.getUsers();
    return res.status(200).json(users);
  };

  return {
    register,
    login,
    getUsers,
  };
};

module.exports = createUserController;