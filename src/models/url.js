const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Url = sequelize.define('Url', {
  longUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortCode: {
    type: DataTypes.STRING(6),
    allowNull: false,
    unique: true
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }, 
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Url;