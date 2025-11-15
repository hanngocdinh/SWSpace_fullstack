// User repository (PostgreSQL only). Legacy MongoDB branch removed after migration.
const bcrypt = require('bcryptjs');

function createPgRepo() {
  const { getPgPool } = require('../../config/pg');
  const pool = getPgPool();
  return {
    async findByLogin(login) {
      // Include status so we can expose isActive derived field
      const { rows } = await pool.query('SELECT id, username, email, password_hash, full_name, role, phone, status, created_at, last_login FROM users WHERE username = $1 OR email = $1 LIMIT 1', [login]);
      const row = rows[0];
      if (!row) return null;
      // Normalize property names similar to Mongo model
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        password_hash: row.password_hash,
        fullName: row.full_name,
        role: row.role,
        phone: row.phone,
        status: row.status,
        isActive: row.status === 'active',
        createdAt: row.created_at,
        lastLogin: row.last_login,
      };
    },
    async findById(id) {
      const { rows } = await pool.query('SELECT id, username, email, full_name, role, phone, status, created_at, last_login FROM users WHERE id = $1', [id]);
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        phone: row.phone,
        status: row.status,
        isActive: row.status === 'active',
        createdAt: row.created_at,
        lastLogin: row.last_login,
      };
    },
    async existsByEmailOrUsername(email, username) {
      const { rows } = await pool.query('SELECT 1 FROM users WHERE email=$1 OR username=$2 LIMIT 1', [email, username]);
      return rows[0] || null;
    },
    async createUser({ username, email, password, fullName, phone }) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const { rows } = await pool.query(
        'INSERT INTO users (username,email,password_hash,full_name,phone,role,status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, username, email, full_name, role, phone, status, created_at, last_login',
        [username, email, hash, fullName, phone, 'user', 'active']
      );
      const row = rows[0];
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        phone: row.phone,
        status: row.status,
        isActive: true,
        createdAt: row.created_at,
        lastLogin: row.last_login,
      };
    },
    async updateLastLogin(user) {
      const id = user.id || user.userId || user._id;
      await pool.query('UPDATE users SET last_login = NOW() WHERE id=$1', [id]);
      return this.findById(id);
    },
    async updateProfile(id, updates) {
      const fields = [];
      const values = [];
      let idx = 1;
      if (updates.fullName !== undefined) { fields.push(`full_name=$${idx++}`); values.push(updates.fullName); }
      if (updates.phone !== undefined) { fields.push(`phone=$${idx++}`); values.push(updates.phone); }
      if (!fields.length) return this.findById(id);
      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=$${idx}`, values);
      return this.findById(id);
    },
    async listAll() {
      const { rows } = await pool.query('SELECT id, username, email, full_name, role, phone, status, created_at, last_login FROM users ORDER BY created_at DESC');
      return rows.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        phone: row.phone,
        status: row.status,
        isActive: row.status === 'active',
        createdAt: row.created_at,
        lastLogin: row.last_login,
      }));
    },
    async changePassword(id, newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, id]);
      return true;
    },
    async comparePassword(userRow, raw) {
      const loginRow = userRow.password_hash ? userRow : (await (async () => {
        const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [userRow.id]);
        return rows[0];
      })());
      if (!loginRow) return false;
      return bcrypt.compare(raw, loginRow.password_hash);
    },
    getId(u) { return u.id; },
    getSafeUser(u) { return { id: u.id, username: u.username, email: u.email, fullName: u.fullName ?? u.full_name, role: u.role, phone: u.phone, status: u.status, isActive: u.isActive ?? (u.status === 'active'), createdAt: u.createdAt ?? u.created_at, lastLogin: u.lastLogin ?? u.last_login }; },
  };
}

function getUserRepository() { return createPgRepo(); }

module.exports = { getUserRepository };
