const express = require('express');
const validate = require('../middlewares/validate');
const { userSchema } = require('../validations/userValidations');

const createUserRoutes = (userController) => {
  const router = express.Router();

  /**
   * @swagger
   * /api/users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Username already exists
   */
  router.post('/register', validate(userSchema), userController.register);

  /**
   * @swagger
   * /api/users/login:
   *   post:
   *     summary: Login a user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       401:
   *         description: Invalid credentials
   */
  router.post('/login', validate(userSchema), userController.login);

  return router;
};

module.exports = createUserRoutes;