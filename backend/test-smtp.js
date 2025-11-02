const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🔍 Testing SMTP Connection...');
  
  try {
    // Check env variables
    console.log('📧 SMTP Settings:');
    console.log('- Host:', process.env.SMTP_HOST);
    console.log('- Port:', process.env.SMTP_PORT);
    console.log('- User:', process.env.SMTP_USER);
    console.log('- From:', process.env.SMTP_FROM);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      timeout: 5000, // 5 second timeout
      connectionTimeout: 5000
    });

    console.log('🔄 Testing connection...');
    
    // Test connection with timeout
    const connectionTest = await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    if (connectionTest) {
      console.log('✅ SMTP connection successful!');
      
      // Send simple test email
      console.log('📤 Sending test email...');
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: 'nguyennhathuybdi06@gmail.com',
        subject: '🧪 SMTP Test - ' + new Date().toLocaleString(),
        text: 'This is a simple SMTP test email.',
        html: '<h2>🧪 SMTP Test</h2><p>This is a simple SMTP test email.</p>'
      });
      
      console.log('✅ Test email sent!', info.messageId);
      return true;
    }
    
  } catch (error) {
    console.error('❌ SMTP test failed:', error.message);
    return false;
  }
}

testSMTP()
  .then(success => {
    console.log('🎯 SMTP Test Result:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 SMTP test crashed:', error);
    process.exit(1);
  });
