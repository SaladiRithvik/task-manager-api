require('dotenv').config();
const { Sequelize } = require('sequelize');

const storage = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : (process.env.DB_STORAGE || './database.sqlite');

const sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });

module.exports = sequelize;
