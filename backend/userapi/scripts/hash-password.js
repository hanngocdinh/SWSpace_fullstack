#!/usr/bin/env node
/* Tạo hash cho mật khẩu demo (mặc định password123) */
const bcrypt = require('bcryptjs');
const pwd = process.env.PWD || 'password123';
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(pwd, salt);
  console.log(`Hash for "${pwd}":\n${hashed}`);
})();
