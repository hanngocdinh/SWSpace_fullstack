#!/usr/bin/env node
/**
 * Standalone QR email test with custom payload. Uses emailService.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const emailService = require('../services/emailService');

async function run() {
  try {
    const testBookingData = {
      bookingReference: 'SWS-NHATHUY-QR-TEST',
      serviceType: 'hot-desk',
      packageDuration: 'daily',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(Date.now() + 24*60*60*1000),
      seatName: 'A1',
      floor: 1,
      totalAmount: 78333,
      userFullName: 'nguyen nhat huy'
    };

    const qrData = {
      bookingId: 'test-booking-id',
      bookingReference: testBookingData.bookingReference,
      serviceType: testBookingData.serviceType,
      userFullName: testBookingData.userFullName,
      username: 'nhathuy',
      startDate: testBookingData.startDate,
      startTime: testBookingData.startTime,
      seatName: testBookingData.seatName,
      timestamp: new Date().toISOString()
    };

    const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), { width: 256, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `qr-test-${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));

    const recipient = process.env.TEST_RECIPIENT || 'example@example.com';
    const result = await emailService.sendQRBookingConfirmation(recipient, testBookingData, filePath);
    console.log('📬 Email Result:', result);

    try { fs.unlinkSync(filePath); } catch {}
  } catch (err) {
    console.error('❌ QR email script failed:', err.message);
    process.exitCode = 1;
  }
}
if (require.main === module) run();
module.exports = run;
