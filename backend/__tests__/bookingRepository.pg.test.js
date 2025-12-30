// No need for path.resolve; mock module path directly

const { __setPgPool } = require('../config/pg');
let mockCalls = [];
let repo;
beforeAll(() => {
  const mockPool = {
    query: jest.fn(async (sql, args) => {
      mockCalls.push({ sql: String(sql), args });
      const text = String(sql).toLowerCase();
      if (text.includes('select status from bookings where id')) return { rows: [{ status: 'pending' }] };
      if (text.includes('select id from payment_methods')) return { rows: [{ id: 1 }] };
      if (text.includes('insert into payments')) return { rows: [] };
      if (text.includes('update bookings set payment_status')) return { rows: [{ id: 99, status: 'paid', payment_status: 'success' }] };
      if (text.includes('select id, booking_reference')) return { rows: [] };
      if (text.includes('select count(*)')) return { rows: [{ total: 0 }] };
      return { rows: [] };
    })
  };
  __setPgPool(mockPool);
  // Require repository after injecting pool to avoid real connection
  const mod = require('../userapi/repositories/bookingRepository');
  repo = mod.getBookingRepository();
});

describe('bookingRepository (PG) basic flows', () => {
  test('confirmPayment creates payment and sets booking paid/success', async () => {
    const result = await repo.confirmPayment(1, 2, { paymentMethod: 'momo', transactionId: 'TXN-1' });
    expect(result).toBeTruthy();
    expect(result.status).toBe('paid');
    expect(result.payment_status || result.paymentStatus).toBe('success');
    expect(result.payment_created).toBe(true);
    // ensure queries executed in expected order
    const sequence = mockCalls.map(c => c.sql.toLowerCase());
    expect(sequence[0]).toContain('select status from bookings');
    expect(sequence.find(s => s.includes('select id from payment_methods'))).toBeTruthy();
    expect(sequence.find(s => s.includes('insert into payments'))).toBeTruthy();
    expect(sequence.find(s => s.includes('update bookings set payment_status'))).toBeTruthy();
  });
});
