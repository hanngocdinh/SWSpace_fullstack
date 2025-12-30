// Standardize Networking Space packages to "3 Hours" and "Day"
// Safe to run multiple times. Reads DB config from env via backend/config/pg.js

const { getPgPool } = require('../config/pg');

async function run() {
  const pool = getPgPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const svcRes = await client.query("SELECT id FROM services WHERE code='networking' LIMIT 1");
    if (!svcRes.rows[0]) {
      console.log('Service networking not found. Abort.');
      await client.query('ROLLBACK');
      return;
    }
    const serviceId = svcRes.rows[0].id;
    const hourId = (await client.query("SELECT id FROM time_units WHERE code='hour' LIMIT 1")).rows[0].id;
    const dayId = (await client.query("SELECT id FROM time_units WHERE code='day' LIMIT 1")).rows[0].id;

    // 3 Hours package
    let pkg3h = (await client.query(
      'SELECT id FROM service_packages WHERE service_id=$1 AND bundle_hours=3 ORDER BY id LIMIT 1',
      [serviceId]
    )).rows[0]?.id;
    if (!pkg3h) {
      pkg3h = (await client.query(
        'SELECT id FROM service_packages WHERE service_id=$1 ORDER BY id LIMIT 1',
        [serviceId]
      )).rows[0]?.id;
    }
    if (pkg3h) {
      await client.query(
        `UPDATE service_packages
           SET name='3 Hours', unit_id=$1, bundle_hours=3, access_days=NULL, status='active', updated_at=NOW()
         WHERE id=$2`,
        [hourId, pkg3h]
      );
    }

    // Day package
    let pkgDay = (await client.query(
      'SELECT id FROM service_packages WHERE service_id=$1 AND (unit_id=$2 OR access_days=1) ORDER BY id LIMIT 1',
      [serviceId, dayId]
    )).rows[0]?.id;
    if (!pkgDay) {
      pkgDay = (await client.query(
        'SELECT id FROM service_packages WHERE service_id=$1 AND id <> $2 ORDER BY id LIMIT 1',
        [serviceId, pkg3h || -1]
      )).rows[0]?.id;
    }
    if (pkgDay) {
      await client.query(
        `UPDATE service_packages
           SET name='Day', unit_id=$1, access_days=1, bundle_hours=NULL, status='active', updated_at=NOW()
         WHERE id=$2`,
        [dayId, pkgDay]
      );
    }

    // Pause other packages of networking
    await client.query(
      `UPDATE service_packages
         SET status='paused', updated_at=NOW()
       WHERE service_id=$1 AND id NOT IN ($2,$3)`,
      [serviceId, pkg3h || -1, pkgDay || -1]
    );

    await client.query('COMMIT');
    console.log('Networking packages standardized: 3 Hours and Day.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to fix networking packages:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
