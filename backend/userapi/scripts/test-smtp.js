#!/usr/bin/env node
/* Kiểm tra kết nối SMTP + gửi email test. */
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔍 Testing SMTP...');
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    console.log('📧 Config:', { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_FROM });
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT) || 587,
      secure: false,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      connectionTimeout: 5000,
      timeout: 5000
    });
    await transporter.verify();
    console.log('✅ SMTP verified');
    const info = await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: process.env.TEST_EMAIL || 'example@test.local',
      subject: 'SMTP Test ' + new Date().toISOString(),
      text: 'SMTP test email',
      html: '<strong>SMTP test email</strong>'
    });
    console.log('📤 Sent id:', info.messageId);
    console.log('🎉 Done');
  } catch (e) { console.error('❌ SMTP error', e.message); process.exitCode = 1; }
}
if (require.main === module) testSMTP();
module.exports = testSMTP;
