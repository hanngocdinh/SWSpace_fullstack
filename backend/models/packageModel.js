// backend/models/packageModel.js
const pool = require('../config/database');

async function getServiceIdByCode(serviceCode) {
  const { rows } = await pool.query(
    `SELECT id FROM services WHERE code = $1 LIMIT 1`,
    [serviceCode]
  );
  if (!rows[0]) throw new Error(`Service code not found: ${serviceCode}`);
  return rows[0].id;
}

async function getUnitIdByCode(unitCode) {
  const { rows } = await pool.query(
    `SELECT id FROM time_units WHERE code = $1 LIMIT 1`,
    [unitCode]
  );
  if (!rows[0]) throw new Error(`Unit code not found: ${unitCode}`);
  return rows[0].id;
}

const PackageModel = {
  async create(data) {
    const {
      serviceCode,       // 'hot_desk' | 'fixed_desk' | 'meeting_room' | 'private_office' | 'networking'
      unitCode,          // 'hour' | 'day' | 'week' | 'month' | 'year'
      name,
      price,
      description,
      accessDays,        // số ngày (private office 3/6 months)
      bundleHours,       // 👈 số giờ gộp (1/3/5) cho meeting/networking
  discountPct,       // 👈 phần trăm giảm giá
      features,          // array string -> lưu JSON
      status = 'active',
      badge,
      thumbnailUrl,
      maxCapacity,
      createdBy
    } = data;

    const service_id = await getServiceIdByCode(serviceCode);
    const unit_id = await getUnitIdByCode(unitCode);

    const { rows } = await pool.query(
      `INSERT INTO service_packages
         (service_id, name, description, price, unit_id,
          access_days, features, thumbnail_url, badge, max_capacity,
          status, created_by, bundle_hours, discount_pct) -- 👈 thêm discount_pct
       VALUES
         ($1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11,$12,$13,$14)
       RETURNING *`,
      [
        service_id, name, description || null, price, unit_id,
        accessDays ?? null,
        features ? JSON.stringify(features) : null,
        thumbnailUrl || null,
        badge || null,
        maxCapacity ?? null,
        status,
        createdBy ?? null,
        bundleHours ?? null,                           // 👈 giá trị lưu
        discountPct ?? 0
      ]
    );
    return rows[0];
  },

  async list() {
    const { rows } = await pool.query(
      `SELECT sp.*, 
              s.code AS service_code, 
              tu.code AS unit_code,
              (sp.price - (sp.price * COALESCE(sp.discount_pct,0) / 100))::bigint AS final_price
       FROM service_packages sp
       JOIN services s    ON s.id  = sp.service_id
       JOIN time_units tu ON tu.id = sp.unit_id
       ORDER BY sp.id ASC`
    );
    return rows;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name=$${idx++}`); values.push(data.name); }
    if (data.price !== undefined) { fields.push(`price=$${idx++}`); values.push(data.price); }
    if (data.description !== undefined) { fields.push(`description=$${idx++}`); values.push(data.description || null); }
    if (data.accessDays !== undefined) { fields.push(`access_days=$${idx++}`); values.push(data.accessDays ?? null); }
    if (data.bundleHours !== undefined) { fields.push(`bundle_hours=$${idx++}`); values.push(data.bundleHours ?? null); } // 👈 cập nhật bundle_hours
  if (data.discountPct !== undefined) { fields.push(`discount_pct=$${idx++}`); values.push(data.discountPct ?? 0); } // 👈 cập nhật discount_pct
    if (data.features !== undefined) { fields.push(`features=$${idx++}`); values.push(data.features ? JSON.stringify(data.features) : null); }
    if (data.thumbnailUrl !== undefined) { fields.push(`thumbnail_url=$${idx++}`); values.push(data.thumbnailUrl || null); }
    if (data.badge !== undefined) { fields.push(`badge=$${idx++}`); values.push(data.badge || null); }
    if (data.maxCapacity !== undefined) { fields.push(`max_capacity=$${idx++}`); values.push(data.maxCapacity ?? null); }
    if (data.status !== undefined) { fields.push(`status=$${idx++}`); values.push(data.status); }

    if (data.unitCode) {
      const unitId = await getUnitIdByCode(data.unitCode);
      fields.push(`unit_id=$${idx++}`); values.push(unitId);
    }
    if (data.serviceCode) {
      const serviceId = await getServiceIdByCode(data.serviceCode);
      fields.push(`service_id=$${idx++}`); values.push(serviceId);
    }

    if (!fields.length) return this.getById(id);

    const { rows } = await pool.query(
      `UPDATE service_packages SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`,
      [...values, id]
    );
    return rows[0];
  },

  async remove(id) {
    await pool.query(`DELETE FROM service_packages WHERE id=$1`, [id]);
    return { ok: true };
  },

  async getById(id) {
    const { rows } = await pool.query(`SELECT * FROM service_packages WHERE id=$1`, [id]);
    return rows[0] || null;
  }
};

module.exports = PackageModel;
