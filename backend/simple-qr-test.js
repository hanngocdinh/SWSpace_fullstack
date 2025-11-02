const emailService = require('./services/emailService');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function simpleQRTest() {
  console.log('🧪 Simple QR Email Test Starting...');
  
  try {
    // Create simple QR data
    const qrData = {
      bookingReference: 'SWS-NHATHUY-QR',
      userFullName: 'nguyen nhat huy',
      username: 'nhathuy',
      seatName: 'A1',
      timestamp: new Date().toISOString()
    };

    console.log('📊 QR Data:', qrData);

    // Generate QR code
    const qrString = JSON.stringify(qrData);
    const qrDataURL = await QRCode.toDataURL(qrString, { width: 256 });
    
    // Save to temp file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const qrPath = path.join(tempDir, 'simple-qr-test.png');
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(qrPath, Buffer.from(base64Data, 'base64'));
    
    console.log('✅ QR saved to:', qrPath);

    // Simple booking data
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

    // Send email with timeout
    console.log('📧 Sending email with 10 second timeout...');
    
    const emailPromise = emailService.sendQRBookingConfirmation(
      'nguyennhathuybdi06@gmail.com',
      bookingData,
      qrPath
    );
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout after 10 seconds')), 10000)
    );
    
    const result = await Promise.race([emailPromise, timeoutPromise]);
    
    console.log('📬 Result:', result);
    
    // Cleanup
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    
    return result;
    
  } catch (error) {
    console.error('❌ Simple QR test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run test
simpleQRTest()
  .then(result => {
    console.log('🎯 Final result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });
