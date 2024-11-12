const createUserModel = () => {
  let users = [];

  const create = (user) => {
    const newUser = {
      id: users.length + 1,
      ...user,
    };
    users.push(newUser);
    return newUser;
  };

  const findByEmail = (email) => {
    return users.find((user) => user.email === email);
  };

  const getAll = () => {
    return users;
  };

  return {
    create,
    findByEmail,
    getAll,
  };
};

module.exports = createUserModel;