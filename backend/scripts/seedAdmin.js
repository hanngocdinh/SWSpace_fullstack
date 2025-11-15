/**
 * Dev helper: create an admin user if not exists
 * Usage: node scripts/seedAdmin.js
 */
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const readline = require('readline');

async function run() {
  // Allow non-interactive usage via env vars for automation
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;
  let email = envEmail;
  let password = envPassword;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(res => rl.question(q, ans => res(ans)));
  try {
    if (!email) {
      email = (await question('Admin email (default admin@example.com): ')) || 'admin@example.com';
    }
    if (!password) {
      password = (await question('Password (default password123): ')) || 'password123';
    }
    rl.close();

    const existing = await db.pool.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email]);
    if (existing.rows[0]) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const { rows } = await db.pool.query(
      `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id`,
      [email, hash, 'Admin', 'admin']
    );
    console.log('Created admin user id=', rows[0].id, 'email=', email);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin', err);
    process.exit(1);
  }
}

run();
