// backend/models/packageModel.js
const pool = require('../config/database');

function normalizeName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeFeaturesForCompare(features) {
  if (features == null) return null;
  if (typeof features === 'string') return features;
  try {
    return JSON.stringify(features);
  } catch {
    return null;
  }
}

function assertValidPrice(price) {
  const num = Number(price);
  if (!Number.isFinite(num)) {
    const err = new Error('Invalid price');
    err.status = 400;
    throw err;
  }
  if (num < 0) {
    const err = new Error('Price must be greater than or equal to 0');
    err.status = 400;
    throw err;
  }
  return num;
}

async function assertNotDuplicate({
  excludeId = null,
  service_id,
  unit_id,
  name,
  price,
  accessDays,
  bundleHours,
  discountPct,
  maxCapacity,
  description,
  features,
}) {
  const normalizedName = normalizeName(name);
  const normalizedDescription = description ?? null;
  const featuresStr = normalizeFeaturesForCompare(features);

  const params = [
    service_id,
    unit_id,
    normalizedName,
    price,
    accessDays ?? null,
    bundleHours ?? null,
    discountPct ?? 0,
    maxCapacity ?? null,
    normalizedDescription,
    featuresStr,
  ];

  let sql =
    `SELECT id FROM service_packages
     WHERE service_id = $1
       AND unit_id = $2
       AND lower(trim(name)) = lower(trim($3))
       AND price = $4
       AND COALESCE(access_days, 0) = COALESCE($5, 0)
       AND COALESCE(bundle_hours, 0) = COALESCE($6, 0)
       AND COALESCE(discount_pct, 0) = COALESCE($7, 0)
       AND COALESCE(max_capacity, 0) = COALESCE($8, 0)
       AND COALESCE(description, '') = COALESCE($9, '')
       AND COALESCE(features::text, '') = COALESCE($10, '')`;

  if (excludeId != null) {
    params.push(excludeId);
    sql += ` AND id <> $11`;
  }
  sql += ` LIMIT 1`;

  const { rows } = await pool.query(sql, params);
  if (rows[0]) {
    const err = new Error('Package already exists (duplicate)');
    err.status = 409;
    throw err;
  }
}

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

    const normalizedName = normalizeName(name);
    const normalizedPrice = assertValidPrice(price);

    const service_id = await getServiceIdByCode(serviceCode);
    const unit_id = await getUnitIdByCode(unitCode);

    await assertNotDuplicate({
      service_id,
      unit_id,
      name: normalizedName,
      price: normalizedPrice,
      accessDays,
      bundleHours,
      discountPct,
      maxCapacity,
      description: description || null,
      features: features ? features : null,
    });

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
        service_id, normalizedName, description || null, normalizedPrice, unit_id,
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
    const current = await this.getById(id);
    if (!current) {
      const err = new Error('Package not found');
      err.status = 404;
      throw err;
    }

    if (data.price !== undefined) {
      data.price = assertValidPrice(data.price);
    }

    const resolvedServiceId = data.serviceCode
      ? await getServiceIdByCode(data.serviceCode)
      : current.service_id;
    const resolvedUnitId = data.unitCode
      ? await getUnitIdByCode(data.unitCode)
      : current.unit_id;

    const resolvedName = data.name !== undefined ? normalizeName(data.name) : normalizeName(current.name);
    const resolvedPrice = data.price !== undefined ? Number(data.price) : Number(current.price);
    const resolvedAccessDays = data.accessDays !== undefined ? (data.accessDays ?? null) : (current.access_days ?? null);
    const resolvedBundleHours = data.bundleHours !== undefined ? (data.bundleHours ?? null) : (current.bundle_hours ?? null);
    const resolvedDiscountPct = data.discountPct !== undefined ? (data.discountPct ?? 0) : (current.discount_pct ?? 0);
    const resolvedMaxCapacity = data.maxCapacity !== undefined ? (data.maxCapacity ?? null) : (current.max_capacity ?? null);
    const resolvedDescription = data.description !== undefined ? (data.description || null) : (current.description ?? null);
    const resolvedFeatures = data.features !== undefined
      ? (data.features ? data.features : null)
      : (current.features ?? null);

    await assertNotDuplicate({
      excludeId: id,
      service_id: resolvedServiceId,
      unit_id: resolvedUnitId,
      name: resolvedName,
      price: resolvedPrice,
      accessDays: resolvedAccessDays,
      bundleHours: resolvedBundleHours,
      discountPct: resolvedDiscountPct,
      maxCapacity: resolvedMaxCapacity,
      description: resolvedDescription,
      features: resolvedFeatures,
    });

    const fields = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name=$${idx++}`); values.push(normalizeName(data.name)); }
    if (data.price !== undefined) { fields.push(`price=$${idx++}`); values.push(Number(data.price)); }
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
      fields.push(`unit_id=$${idx++}`); values.push(resolvedUnitId);
    }
    if (data.serviceCode) {
      fields.push(`service_id=$${idx++}`); values.push(resolvedServiceId);
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
