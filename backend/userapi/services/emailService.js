const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'your-email@gmail.com',
          pass: process.env.SMTP_PASS || 'your-app-password'
        },
        tls: { rejectUnauthorized: false }
      });
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  generateBookingConfirmationEmail(bookingData, userData) {
    const { bookingReference, serviceType, packageDuration, startDate, startTime, seatName, totalAmount } = bookingData;
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
    const serviceTypeName = serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk';
    const packageName = ({ daily: 'Daily Package', weekly: 'Weekly Package', monthly: 'Monthly Package', yearly: 'Yearly Package' }[packageDuration]) || packageDuration;
    return {
      subject: `Booking Confirmation - ${bookingReference} | SWSpace`,
      html: `<div style="font-family:Arial,sans-serif"><h2>Booking Confirmed</h2><p>Hello <b>${userData.fullName}</b>,</p><p>Your booking has been confirmed.</p><ul><li>Service: ${serviceTypeName}</li><li>Package: ${packageName}</li><li>Date & Time: ${formatDate(startDate)}</li><li>Seat: ${seatName}</li>${totalAmount ? `<li>Total: ${formatCurrency(totalAmount)}</li>` : ''}</ul><p>Reference: <b>${bookingReference}</b></p></div>`
    };
  }

  async sendBookingConfirmation(userEmail, bookingData, userData) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generateBookingConfirmationEmail(bookingData, userData);
      const mailOptions = { from: { name: 'SWSpace Coworking', address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@swspace.com.vn' }, to: userEmail, subject: emailContent.subject, html: emailContent.html };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: userEmail };
    } catch (error) { return { success: false, error: error.message }; }
  }

  generateQRBookingEmail(bookingData, userData) {
    const { bookingReference, serviceType, packageDuration, startDate, seatName, totalAmount } = bookingData;
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
    const serviceTypeName = serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk';
    const packageName = ({ daily: 'Daily Package', weekly: 'Weekly Package', monthly: 'Monthly Package', yearly: 'Yearly Package' }[packageDuration]) || packageDuration;
    return {
      subject: `Booking Confirmed + QR - ${bookingReference} | SWSpace`,
      html: `<div style="font-family:Arial,sans-serif"><h2>Booking Confirmed + QR</h2><p>Hello <b>${userData.fullName}</b>,</p><p>Your QR check-in code is attached.</p><ul><li>Service: ${serviceTypeName}</li><li>Package: ${packageName}</li><li>Date & Time: ${formatDate(startDate)}</li><li>Seat: ${seatName}</li>${totalAmount ? `<li>Total: ${formatCurrency(totalAmount)}</li>` : ''}</ul><p>Reference: <b>${bookingReference}</b></p><img src="cid:qrcode" alt="QR" /></div>`
    };
  }

  async sendBookingWithQR(userEmail, bookingData, userData, qrImageBuffer, qrFilename) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generateQRBookingEmail(bookingData, userData);
      const mailOptions = { from: { name: 'SWSpace Coworking', address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@swspace.com.vn' }, to: userEmail, subject: emailContent.subject, html: emailContent.html, attachments: [{ filename: qrFilename, content: qrImageBuffer, contentType: 'image/png', cid: 'qrcode' }] };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: userEmail, attachments: [qrFilename] };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async sendQRBookingConfirmation(to, bookingData, qrFilePath) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generateQRBookingEmail(bookingData, { fullName: bookingData.userFullName || 'Valued Customer', email: to });
      const mailOptions = { from: { name: 'SWSpace Coworking', address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@swspace.com.vn' }, to, subject: `Booking Confirmation - ${bookingData.bookingReference} | SWSpace`, html: emailContent.html || emailContent, attachments: [{ filename: `QR-${bookingData.bookingReference}.png`, path: qrFilePath, cid: 'qr-code-image' }] };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: to };
    } catch (error) { return { success: false, error: error.message }; }
  }
}

module.exports = new EmailService();
