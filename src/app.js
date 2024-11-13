require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const createUrlService = require('./services/urlService');
const createUserService = require('./services/userService');
const createUrlController = require('./controllers/urlController');
const createUserController = require('./controllers/userController');
const createUrlRoutes = require('./routes/urlRoutes');
const createUserRoutes = require('./routes/userRoutes');
const createMetricsRoutes = require('./config/metricsRoutes');
const logger = require('./config/logger');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const urlService = createUrlService();
const userService = createUserService(process.env.JWT_SECRET);

const urlController = createUrlController(urlService);
const userController = createUserController(userService);

const urlRoutes = createUrlRoutes(urlController);
const userRoutes = createUserRoutes(userController);
const metricsRoutes = createMetricsRoutes();

app.use('/api/urls', urlRoutes);
app.use('/api/users', userRoutes);
app.use('/metrics', metricsRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ message: 'An unexpected error occurred' });
});

module.exports = app;