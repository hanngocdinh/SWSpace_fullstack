#!/usr/bin/env node
/* Unified backend test: login -> create booking -> query occupied seats
   Uses API_BASE (default http://localhost:5000/api). */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function main() {
  try {
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.TEST_USERNAME || 'demo',
        password: process.env.TEST_PASSWORD || 'password123'
      })
    });
    if (!loginRes.ok) {
      const t = await loginRes.text();
      throw new Error('Login failed: ' + t);
    }
    const login = await loginRes.json();
    console.log('✅ Logged in as', login.user.username, 'token:', login.token.slice(0,20)+'...');

    console.log('\n📝 Creating booking...');
    const bookingPayload = {
      serviceType: 'hot-desk',
      packageDuration: 'daily',
      startDate: new Date().toISOString().slice(0,10),
      startTime: '09:00',
      seatId: 'C1',
      seatName: 'C1',
      floor: 1,
      specialRequests: 'Unified backend test booking'
    };
    const bookingRes = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
      body: JSON.stringify(bookingPayload)
    });
    const booking = await bookingRes.json();
    if (!bookingRes.ok || !booking.success) {
      throw new Error('Booking create failed: ' + JSON.stringify(booking));
    }
    console.log('✅ Booking created ref:', booking.booking.bookingReference, 'seat:', booking.booking.seatName);

    console.log('\n🔍 Querying occupied seats for today...');
    const today = bookingPayload.startDate;
    const occRes = await fetch(`${API_BASE}/bookings/seats/occupied?serviceType=hot-desk&date=${today}`, {
      headers: { Authorization: `Bearer ${login.token}` }
    });
    const occ = await occRes.json();
    if (!occRes.ok) throw new Error('Occupied seats failed: ' + JSON.stringify(occ));
    console.log('✅ Occupied count:', occ.count, 'Seats:', occ.occupiedSeats.join(', ') || '(none)');

    console.log('\n🎉 Workflow complete');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exitCode = 1;
  }
}

if (typeof fetch === 'undefined') {
  // Node <18 fallback
  const { execSync } = require('child_process');
  try { execSync('npm install node-fetch', { stdio: 'inherit' }); global.fetch = require('node-fetch'); } catch (e) { console.error('Install node-fetch manually'); process.exit(1); }
}

main();
