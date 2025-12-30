const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'supersecretkey';
const payload = {
  userId: 5,
  role: 'admin'
};

const token = jwt.sign(payload, secret, { expiresIn: '7d' });
console.log(token);
