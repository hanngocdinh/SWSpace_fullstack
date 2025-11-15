#!/usr/bin/env node
/**
 * Generate a QR for sample booking data and send an email using unified emailService.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const emailService = require('../services/emailService');

async function simpleQRTest() {
  try {
    const qrData = {
      bookingReference: 'SWS-NHATHUY-QR',
      userFullName: 'nguyen nhat huy',
      username: 'nhathuy',
      seatName: 'A1',
      timestamp: new Date().toISOString()
    };
    const qrString = JSON.stringify(qrData);
    const dataUrl = await QRCode.toDataURL(qrString, { width: 256 });

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const qrPath = path.join(tempDir, `simple-qr-${Date.now()}.png`);
    fs.writeFileSync(qrPath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));

    const bookingData = {
      bookingReference: 'SWS-NHATHUY-QR',
      serviceType: 'hot-desk',
      packageDuration: 'daily',
      startDate: new Date(),
      startTime: '09:00',
      seatName: 'A1',
      totalAmount: 78333,
      userFullName: 'nguyen nhat huy'
    };

    console.log('📧 Sending QR test email...');
    const result = await emailService.sendQRBookingConfirmation(
      process.env.TEST_RECIPIENT || 'example@example.com',
      bookingData,
      qrPath
    );
    console.log('📬 Result:', result);
    try { fs.unlinkSync(qrPath); } catch {}
  } catch (err) {
    console.error('❌ Simple QR test failed:', err.message);
    process.exitCode = 1;
  }
}
if (require.main === module) simpleQRTest();
module.exports = simpleQRTest;
