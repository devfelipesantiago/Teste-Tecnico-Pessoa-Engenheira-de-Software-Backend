const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUserService = (userModel, secretKey) => {

  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      throw new Error('Preencha todos os campos');
    }

    const userAlreadyExists = userModel.findByEmail(email);

    if (userAlreadyExists) {
      throw new Error('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return userModel.create({ name, email, password: hashedPassword });
  };

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Preencha todos os campos');
    }

    const user = userModel.findByEmail(email);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Senha inválida');
    }

    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });

    return token;
  };

  const getUsers = () => {
    return userModel.getAll();
  };

  return {
    register,
    login,
    getUsers,
  };
};

module.exports = createUserService;