const emailService = require('./services/emailService');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function testQREmail() {
  try {
    console.log('🧪 Starting QR Email Test...');
    
    // Test booking data with user nhathuy
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

    // Create QR data
    const qrData = {
      bookingId: 'test-booking-id',
      bookingReference: testBookingData.bookingReference,
      serviceType: testBookingData.serviceType,
      userFullName: 'nguyen nhat huy',
      username: 'nhathuy',
      startDate: testBookingData.startDate,
      startTime: testBookingData.startTime,
      seatName: testBookingData.seatName,
      timestamp: new Date().toISOString()
    };

    console.log('📊 QR Data:', JSON.stringify(qrData, null, 2));

    // Generate QR code image
    console.log('🔄 Generating QR code...');
    const qrString = JSON.stringify(qrData);
    const qrDataURL = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Save QR code to temp file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const qrFileName = `qr-test-${Date.now()}.png`;
    const qrFilePath = path.join(tempDir, qrFileName);
    
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(qrFilePath, buffer);
    
    console.log('✅ QR code saved to:', qrFilePath);

    // Send QR email
    console.log('📧 Sending QR email...');
    const result = await emailService.sendQRBookingConfirmation(
      'nguyennhathuybdi06@gmail.com', // Your email
      testBookingData,
      qrFilePath
    );

    console.log('📬 Email Result:', result);

    if (result.success) {
      console.log('🎉 QR Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📨 Sent to:', result.recipient);
    } else {
      console.error('❌ Failed to send QR email:', result.error);
    }

    // Clean up temp file
    try {
      fs.unlinkSync(qrFilePath);
      console.log('🧹 Temp file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup temp file:', cleanupError.message);
    }

  } catch (error) {
    console.error('💥 QR Email test failed:', error);
  }
}

// Run the test
console.log('🚀 Initializing QR Email Test...');
testQREmail()
  .then(() => {
    console.log('✅ QR Email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ QR Email test failed:', error);
    process.exit(1);
  });
