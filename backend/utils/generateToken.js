const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_and_failover';
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '30d',
  });

  return token;
};

module.exports = generateToken;
