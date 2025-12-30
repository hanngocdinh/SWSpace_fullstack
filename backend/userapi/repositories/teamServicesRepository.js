// Repository PG cho Team Services: thay thế các model Mongo TeamService, DurationPackage, TeamRoom
// Cung cấp API dạng tương tự để route giữ nguyên response shape tối đa.

const { getPgPool } = require('../../config/pg');
const pool = getPgPool();

function normalizeServiceType(serviceType) {
  if (!serviceType) return null;
  const map = {
    'private-office': 'private_office',
    'private_office': 'private_office',
    'private office': 'private_office',
    'meeting-room': 'meeting_room',
    'meeting_room': 'meeting_room',
    'meeting room': 'meeting_room',
    'networking-space': 'networking',
    'networking_space': 'networking',
    'networking space': 'networking'
  };
  const key = String(serviceType).toLowerCase();
  return map[key] || key; // hot_desk, fixed_desk v.v. giữ nguyên
}

async function getServiceByType(serviceType) {
  const code = normalizeServiceType(serviceType);
  const { rows } = await pool.query(
    `SELECT id, code, name, description, image_url, features, min_advance_days, capacity_min, capacity_max
     FROM services
     WHERE code = $1 AND (is_active IS TRUE OR is_active IS NULL)
     LIMIT 1`, [code]
  );
  return rows[0] || null;
}

async function listActiveServices() {
  const { rows } = await pool.query(
    `SELECT id, code, name, description, image_url, features, min_advance_days, capacity_min, capacity_max
     FROM services
     WHERE (is_active IS TRUE OR is_active IS NULL)
       AND code IN ('private_office','meeting_room','networking')
     ORDER BY name`
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    image: r.image_url,
    features: r.features,
    capacity: r.capacity_max || r.capacity_min || null,
    minimumBookingAdvance: (r.min_advance_days === 7 ? '1 week' : '1 day')
  }));
}

async function listPackagesByServiceType(serviceType) {
  const svc = await getServiceByType(serviceType);
  if (!svc) return [];
  const { rows } = await pool.query(
    `SELECT sp.id, sp.name, sp.description, sp.price, sp.is_custom, sp.price_per_unit, sp.discount_pct,
            sp.features, sp.thumbnail_url, sp.badge,
            sp.access_days, sp.bundle_hours,
            tu.code AS unit_code
     FROM service_packages sp
     JOIN time_units tu ON tu.id = sp.unit_id
     WHERE sp.service_id = $1 AND sp.status = 'active'
     ORDER BY sp.price ASC`, [svc.id]
  );
  return rows.map(r => {
    let features = [];
    if (r.features) {
      try {
        features = Array.isArray(r.features) ? r.features : JSON.parse(r.features);
      } catch (e) {
        features = [];
      }
    }
    // Suy ra giá trị duration.value từ bundle_hours hoặc access_days
    let durationValue = null;
    if (r.bundle_hours != null) durationValue = Number(r.bundle_hours);
    else if (r.access_days != null) {
      // Nếu unit là 'month' thì access_days ~ số ngày cho nhiều tháng; cố gắng quy đổi hợp lý
      if (r.unit_code === 'month') durationValue = Math.max(1, Math.round(Number(r.access_days) / 30));
      else durationValue = Number(r.access_days);
    }
    return {
      id: r.id,
      _id: r.id, // compatibility cho frontend cũ dùng _id
      name: r.name,
      description: r.description,
      price: Number(r.price),
      isCustom: !!r.is_custom,
      pricePerUnit: r.price_per_unit ? Number(r.price_per_unit) : null,
      discount: { percentage: r.discount_pct || 0 },
      duration: { unit: r.unit_code, value: durationValue },
      features,
      thumbnailUrl: r.thumbnail_url || null,
      badge: r.badge || null
    };
  });
}

async function getPackageById(id) {
  const { rows } = await pool.query(
    `SELECT sp.id, sp.service_id, sp.name, sp.description, sp.price, sp.is_custom, sp.price_per_unit, sp.discount_pct,
            sp.features, sp.thumbnail_url, sp.badge,
            sp.access_days, sp.bundle_hours,
            tu.code AS unit_code
     FROM service_packages sp
     JOIN time_units tu ON tu.id = sp.unit_id
     WHERE sp.id = $1 LIMIT 1`, [id]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  let features = [];
  if (r.features) {
    try {
      features = Array.isArray(r.features) ? r.features : JSON.parse(r.features);
    } catch (e) {
      features = [];
    }
  }
  return {
    id: r.id,
    service_id: r.service_id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    isCustom: !!r.is_custom,
    pricePerUnit: r.price_per_unit ? Number(r.price_per_unit) : null,
    discount: { percentage: r.discount_pct || 0 },
    duration: { unit: r.unit_code, value: r.bundle_hours != null ? Number(r.bundle_hours) : (r.access_days != null ? (r.unit_code === 'month' ? Math.max(1, Math.round(Number(r.access_days) / 30)) : Number(r.access_days)) : null) },
    features,
    thumbnailUrl: r.thumbnail_url || null,
    badge: r.badge || null,
    _id: r.id
  };
}

async function listRoomsByServiceType(serviceType) {
  const svc = await getServiceByType(serviceType);
  if (!svc) return [];
  // rooms liên kết qua zones.service_id
  const { rows } = await pool.query(
    `SELECT r.id, r.room_code, r.capacity, r.status, r.display_name, z.floor_id
     FROM rooms r
     JOIN zones z ON z.id = r.zone_id
     WHERE z.service_id = $1
     ORDER BY r.room_code`, [svc.id]
  );
  return rows.map(r => ({
    id: r.id,
    roomNumber: r.room_code,
    capacity: r.capacity,
    status: r.status,
    isActive: r.status === 'available',
    name: r.display_name || r.room_code,
    floor: r.floor_id
  }));
}

async function listRoomsStatusByServiceType(serviceType) {
  const svc = await getServiceByType(serviceType);
  if (!svc) return [];
  const { rows } = await pool.query(
    `SELECT r.id, r.room_code, r.capacity, r.status, z.floor_id
     FROM rooms r
     JOIN zones z ON z.id = r.zone_id
     WHERE z.service_id = $1
     ORDER BY r.room_code`, [svc.id]
  );
  return rows.map(r => ({
    id: r.id,
    roomNumber: r.room_code,
    capacity: r.capacity,
    status: r.status,
    floor: r.floor_id
  }));
}

async function getRoomById(id) {
  const { rows } = await pool.query(
    `SELECT r.id, r.room_code, r.capacity, r.status, r.display_name, z.floor_id
     FROM rooms r
     JOIN zones z ON z.id = r.zone_id
     WHERE r.id = $1 LIMIT 1`, [id]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    roomNumber: r.room_code,
    capacity: r.capacity,
    isActive: r.status === 'available',
    name: r.display_name || r.room_code,
    floor: r.floor_id
  };
}

module.exports = {
  listActiveServices,
  listPackagesByServiceType,
  listRoomsByServiceType,
  listRoomsStatusByServiceType,
  getServiceByType,
  getPackageById,
  getRoomById,
  normalizeServiceType
};
