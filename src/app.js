const express = require('express');
const bodyParser = require("body-parser");
const createUserService = require('./service/createUserService');
const createUserController = require('./controllers/UserController');
const createUserRoutes = require('./routes/userRoutes');
const createUserModel = require('./models/userModel');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const secretKey = 'mysecretkey';

const userModel = createUserModel();
const userService = createUserService(userModel, secretKey);
const userController = createUserController(userService);
const userRoutes = createUserRoutes(userController);

app.use('/api', userRoutes);

module.exports = app;