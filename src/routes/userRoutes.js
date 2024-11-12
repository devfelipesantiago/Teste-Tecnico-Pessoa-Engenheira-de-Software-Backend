const express = require('express');

const createUserRoutes = (userController) => {
  const router = express.Router();

  router.post('/register', userController.register);
  router.post('/login', userController.login);
  router.get('/users', userController.getUsers);

  return router;
};

module.exports = createUserRoutes;