const express = require('express');
const { register } = require('../config/metrics');

const createMetricsRoutes = () => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  return router;
};

module.exports = createMetricsRoutes;