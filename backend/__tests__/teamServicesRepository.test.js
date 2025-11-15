const { __setPgPool } = require('../config/pg');
let teamRepo;
beforeAll(() => {
  const mockPool = { query: jest.fn(async (sql, args) => {
    const text = String(sql).toLowerCase();
    if (text.includes('from services') && text.includes('where (is_active is true')) {
      return { rows: [
        { id: 4, code: 'meeting_room', name: 'Meeting Room', description: null, image_url: null, features: null, min_advance_days: 1, capacity_min: null, capacity_max: 16 },
        { id: 3, code: 'private_office', name: 'Private Office', description: null, image_url: null, features: null, min_advance_days: 7, capacity_min: 2, capacity_max: 6 }
      ] };
    }
    if (text.includes('from services') && text.includes('where code =')) {
      return { rows: [{ id: 4, code: 'meeting_room', category_id: 2, name: 'Meeting Room' }] };
    }
    if (text.includes('from service_packages')) {
      return { rows: [{ id: 10, name: 'Hour', description: 'Per hour', price: 300000, is_custom: false, price_per_unit: null, discount_pct: 0, unit_code: 'hour' }] };
    }
    if (text.includes('from rooms')) {
      return { rows: [{ id: 21, room_code: 'MR-201', capacity: 12, status: 'available', display_name: 'MR 201', floor_id: 2 }] };
    }
    return { rows: [] };
  }) };
  __setPgPool(mockPool);
  teamRepo = require('../userapi/repositories/teamServicesRepository');
});

describe('teamServicesRepository helpers', () => {

  test('normalizeServiceType mapping', () => {
    expect(teamRepo.normalizeServiceType('Private Office')).toBe('private_office');
    expect(teamRepo.normalizeServiceType('meeting-room')).toBe('meeting_room');
    expect(teamRepo.normalizeServiceType('networking space')).toBe('networking');
  });

  test('listActiveServices returns transformed fields', async () => {
    const items = await teamRepo.listActiveServices();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('name');
    expect(items[0]).toHaveProperty('minimumBookingAdvance');
  });
});
