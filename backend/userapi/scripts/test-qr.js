#!/usr/bin/env node
/**
 * Generate a QR and save it to a temp file. No email involved.
 */
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function main() {
  try {
    const qrData = { bookingId: 'test123', bookingReference: 'SWS-TEST-123', serviceType: 'hot-desk', userFullName: 'Test User', startDate: new Date().toISOString(), seatName: 'A1' };
    const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), { width: 256, margin: 2 });
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const file = path.join(tempDir, 'test-qr.png');
    fs.writeFileSync(file, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    console.log('💾 Saved QR to', file);
  } catch (err) {
    console.error('❌ QR generation failed:', err.message);
    process.exitCode = 1;
  }
}
if (require.main === module) main();
module.exports = main;
