const QRCode = require('qrcode');
const fs = require('fs');

async function testQRGeneration() {
  try {
    console.log('🧪 Testing QR generation...');
    
    // Test data
    const qrData = {
      bookingId: 'test123',
      bookingReference: 'SWS-TEST-123',
      serviceType: 'hot-desk',
      userFullName: 'Test User',
      startDate: '2025-10-27',
      seatName: 'A1'
    };
    
    const qrString = JSON.stringify(qrData);
    console.log('📄 QR Data:', qrString);
    
    // Generate QR code
    const qrDataURL = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log('✅ QR Code generated successfully!');
    console.log('📏 Data URL length:', qrDataURL.length);
    console.log('🔗 Data URL preview:', qrDataURL.substring(0, 100) + '...');
    
    // Save to file for testing
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('/tmp/test-qr.png', base64Data, 'base64');
    console.log('💾 QR code saved to /tmp/test-qr.png');
    
  } catch (error) {
    console.error('❌ QR generation failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testQRGeneration();
