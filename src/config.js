module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/budget-tracker',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
};

