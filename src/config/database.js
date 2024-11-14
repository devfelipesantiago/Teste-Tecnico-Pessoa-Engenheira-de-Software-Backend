const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
  retry: { 
    match: [/SQLITE_BUSY/], 
    max: 5
  },
  dialectOptions: {
    busyTimeout: 3000
  }
});

sequelize.query("PRAGMA busy_timeout = 3000");

module.exports = sequelize;