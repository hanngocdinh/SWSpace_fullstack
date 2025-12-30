// paymentMethodRepository.js
// PostgreSQL repository replacing legacy Mongo PaymentMethod model usage.
// Provides minimal methods used by payment-methods routes.

const { getPgPool } = require('../../config/pg');

function createPgRepo() {
  const pool = getPgPool();

  return {
    async listForUser(userId) {
      const { rows } = await pool.query(
        `SELECT id, code, display_name, data, is_default, is_active, created_at
         FROM user_payment_methods
         WHERE user_id=$1 AND is_active = TRUE
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      return rows;
    },
    async create(userId, payload) {
      // If this is the first active method, set is_default = true
      const { rows: countRows } = await pool.query(
        'SELECT COUNT(*)::int AS cnt FROM payment_methods WHERE user_id=$1 AND is_active=TRUE',
        [userId]
      );
      const first = countRows[0].cnt === 0;
      const code = (payload.code || payload.type || 'credit-card').toLowerCase();
      const display = payload.displayName || payload.label || code;
      const data = payload.data || payload.fields || {};
      const { rows } = await pool.query(
        `INSERT INTO user_payment_methods (user_id, code, display_name, data, is_default)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, code, display_name, data, is_default, is_active, created_at`,
        [userId, code, display, data, first]
      );
      return rows[0];
    },
    async findById(userId, id) {
      const { rows } = await pool.query(
        `SELECT id, code, display_name, data, is_default, is_active
         FROM user_payment_methods WHERE id=$1 AND user_id=$2 LIMIT 1`,
        [id, userId]
      );
      return rows[0] || null;
    },
    async update(userId, id, updates) {
      const allowed = ['displayName','isDefault'];
      const setParts = [];
      const params = [id, userId];
      let idx = params.length;
      if (updates.displayName !== undefined) { idx++; setParts.push(`display_name=$${idx}`); params.push(updates.displayName); }
      if (updates.isDefault !== undefined) { idx++; setParts.push(`is_default=$${idx}`); params.push(!!updates.isDefault); }
      if (!setParts.length) return this.findById(userId, id);
      const { rows } = await pool.query(
        `UPDATE user_payment_methods SET ${setParts.join(', ')}
         WHERE id=$1 AND user_id=$2 AND is_active=TRUE
         RETURNING id, code, display_name, data, is_default, is_active`,
        params
      );
      return rows[0] || null;
    },
    async setDefault(userId, id) {
      // Unset previous, set new
      await pool.query(`UPDATE user_payment_methods SET is_default=FALSE WHERE user_id=$1`, [userId]);
      const { rows } = await pool.query(
        `UPDATE user_payment_methods SET is_default=TRUE
         WHERE id=$1 AND user_id=$2 AND is_active=TRUE
         RETURNING id, code, display_name, data, is_default, is_active`,
        [id, userId]
      );
      return rows[0] || null;
    },
    async softDelete(userId, id) {
      const { rows } = await pool.query(
        `UPDATE user_payment_methods SET is_active=FALSE WHERE id=$1 AND user_id=$2 AND is_active=TRUE
         RETURNING id, is_default`,
        [id, userId]
      );
      const deleted = rows[0];
      if (!deleted) return null;
      if (deleted.is_default) {
        // Promote most recent remaining
        const { rows: nextRows } = await pool.query(
          `SELECT id FROM user_payment_methods WHERE user_id=$1 AND is_active=TRUE ORDER BY created_at DESC LIMIT 1`,
          [userId]
        );
        if (nextRows[0]) {
          await pool.query(`UPDATE user_payment_methods SET is_default=TRUE WHERE id=$1`, [nextRows[0].id]);
        }
      }
      return true;
    }
  };
}

function getPaymentMethodRepository() {
  // Only PG now; future: could branch if needed
  return createPgRepo();
}

module.exports = { getPaymentMethodRepository };
