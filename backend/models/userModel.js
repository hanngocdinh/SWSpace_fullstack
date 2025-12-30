const pool = require('../config/database');

const UserModel = {
  async create({ email, passwordHash, fullName = null, phone = null, role = 'user', avatarUrl = null }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, avatar_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [email, passwordHash, fullName || null, phone || null, role, avatarUrl || null]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1 LIMIT 1`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1 LIMIT 1`, [id]);
    return rows[0] || null;
  }
};

module.exports = UserModel;
