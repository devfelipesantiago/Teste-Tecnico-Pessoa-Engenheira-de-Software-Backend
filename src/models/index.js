const User = require('./user');
const Url = require('./url');

User.hasMany(Url, { foreignKey: 'userId', as: 'urls' });
Url.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Url
};