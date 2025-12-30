const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      console.log('🔧 Initializing email transporter with:');
      console.log('- SMTP Host:', process.env.SMTP_HOST);
      console.log('- SMTP Port:', process.env.SMTP_PORT);
      console.log('- SMTP User:', process.env.SMTP_USER);
      console.log('- SMTP Pass:', process.env.SMTP_PASS ? '[CONFIGURED]' : '[NOT SET]');
      
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
      });
      
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      console.log('📧 Testing email connection...');
      const result = await this.transporter.verify();
      console.log('✅ Email connection test successful:', result);
      return { success: true, verified: result };
    } catch (error) {
      console.error('❌ Email connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestEmail(to = process.env.SMTP_USER) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      
      const mailOptions = {
        from: {
          name: 'SWSpace Test',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER
        },
        to: to,
        subject: 'SWSpace Email Test - Success!',
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h2>🎉 Email Configuration Test</h2>
            <p>Congratulations! Your email service is working correctly.</p>
            <p><strong>Test sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>SMTP Server:</strong> ${process.env.SMTP_HOST}</p>
            <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
            <div style="background:#f0f8f0;padding:15px;border-radius:5px;margin:15px 0;">
              <p>✅ Email service is ready for booking confirmations!</p>
            </div>
          </div>
        `
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Test email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId, recipient: to };
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return { success: false, error: error.message };
    }
  }

  generateBookingConfirmationEmail(bookingData, userData) {
    const { bookingReference, serviceType, packageDuration, startDate, startTime, seatName, totalAmount } = bookingData;
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
    const serviceTypeName = serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk';
    const packageName = ({ daily: 'Daily Package', weekly: 'Weekly Package', monthly: 'Monthly Package', yearly: 'Yearly Package' }[packageDuration]) || packageDuration;
    
    return {
      subject: `🎉 Booking Confirmation - ${bookingReference} | SWSpace`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8f9fa;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #45bf55, #38a046);
              color: white;
              padding: 2rem;
              text-align: center;
            }
            
            .header h1 {
              font-size: 1.8rem;
              margin-bottom: 0.5rem;
            }
            
            .header .logo {
              font-size: 2rem;
              font-weight: bold;
              margin-bottom: 1rem;
            }
            
            .success-icon {
              width: 60px;
              height: 60px;
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
              font-size: 2rem;
            }
            
            .content {
              padding: 2rem;
            }
            
            .greeting {
              font-size: 1.1rem;
              margin-bottom: 1.5rem;
              color: #555;
            }
            
            .booking-details {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 1.5rem;
              margin: 1.5rem 0;
              border-left: 4px solid #45bf55;
            }
            
            .booking-details h3 {
              color: #45bf55;
              margin-bottom: 1rem;
              font-size: 1.2rem;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              border-bottom: 1px solid #e9ecef;
            }
            
            .detail-row:last-child {
              border-bottom: none;
            }
            
            .detail-label {
              font-weight: 500;
              color: #666;
            }
            
            .detail-value {
              font-weight: 600;
              color: #333;
            }
            
            .reference-number {
              background-color: #e8f5e8;
              border: 2px dashed #45bf55;
              border-radius: 8px;
              padding: 1rem;
              text-align: center;
              margin: 1.5rem 0;
            }
            
            .reference-number .label {
              font-size: 0.9rem;
              color: #666;
              margin-bottom: 0.5rem;
            }
            
            .reference-number .value {
              font-size: 1.3rem;
              font-weight: bold;
              color: #45bf55;
              letter-spacing: 1px;
            }
            
            .qr-section {
              background-color: #f0f8ff;
              border: 1px solid #b3d9ff;
              border-radius: 8px;
              padding: 1.5rem;
              margin: 1.5rem 0;
              text-align: center;
            }
            
            .qr-section h4 {
              color: #1976d2;
              margin-bottom: 1rem;
            }
            
            .qr-section .qr-image {
              margin: 1rem 0;
            }
            
            .next-steps {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 1.5rem;
              margin: 1.5rem 0;
            }
            
            .next-steps h4 {
              color: #856404;
              margin-bottom: 1rem;
            }
            
            .next-steps ul {
              list-style: none;
              padding-left: 0;
            }
            
            .next-steps li {
              padding: 0.3rem 0;
              color: #856404;
            }
            
            .next-steps li::before {
              content: "✓";
              color: #45bf55;
              font-weight: bold;
              margin-right: 0.5rem;
            }
            
            .contact-info {
              background-color: #e3f2fd;
              border-radius: 8px;
              padding: 1.5rem;
              margin: 1.5rem 0;
            }
            
            .contact-info h4 {
              color: #1976d2;
              margin-bottom: 1rem;
            }
            
            .contact-info p {
              margin: 0.5rem 0;
              color: #555;
            }
            
            .footer {
              background-color: #f8f9fa;
              padding: 1.5rem;
              text-align: center;
              color: #666;
              font-size: 0.9rem;
            }
            
            .footer a {
              color: #45bf55;
              text-decoration: none;
            }
            
            .social-links {
              margin-top: 1rem;
            }
            
            .social-links a {
              display: inline-block;
              margin: 0 0.5rem;
              padding: 0.5rem;
              background-color: #45bf55;
              color: white;
              text-decoration: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              line-height: 30px;
              text-align: center;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 0;
                border-radius: 0;
              }
              
              .header, .content {
                padding: 1.5rem 1rem;
              }
              
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
              }
              
              .detail-value {
                margin-top: 0.25rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">SW<strong>Space</strong></div>
              <div class="success-icon">✓</div>
              <h1>Booking Confirmed!</h1>
              <p>Your workspace reservation is confirmed</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <div class="greeting">
                Hello <strong>${userData.fullName}</strong>,
              </div>
              
              <p>Great news! Your workspace booking has been successfully confirmed. We're excited to welcome you to SWSpace!</p>
              
              <!-- Booking Reference -->
              <div class="reference-number">
                <div class="label">Booking Reference Number</div>
                <div class="value">${bookingReference}</div>
              </div>
              
              <!-- Booking Details -->
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Service Type:</span>
                  <span class="detail-value">${serviceTypeName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Package:</span>
                  <span class="detail-value">${packageName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${formatDate(startDate)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Seat:</span>
                  <span class="detail-value">${seatName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">Floor 1, SWSpace Coworking</span>
                </div>
                
                ${totalAmount ? `
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">${formatCurrency(totalAmount)}</span>
                </div>
                ` : ''}
              </div>
              
              <!-- Next Steps -->
              <div class="next-steps">
                <h4>🚀 What's Next?</h4>
                <ul>
                  <li>Arrive 10 minutes before your scheduled time</li>
                  <li>Bring a valid ID for check-in</li>
                  <li>Show this email or your booking reference to our receptionist</li>
                  <li>Use the QR code below for quick check-in</li>
                  <li>Enjoy your productive workspace experience!</li>
                </ul>
              </div>
              
              <!-- Contact Information -->
              <div class="contact-info">
                <h4>📞 Need Help?</h4>
                <p><strong>Address:</strong> 03 Quang Trung, Da Nang City</p>
                <p><strong>Phone:</strong> 0905965494</p>
                <p><strong>Email:</strong> info@swspace.com.vn</p>
                <p><strong>Hours:</strong> Monday - Sunday, 24/7</p>
              </div>
              
              <p>If you need to make any changes to your booking or have questions, please don't hesitate to contact us.</p>
              
              <p>Thank you for choosing SWSpace. We look forward to providing you with an excellent coworking experience!</p>
              
              <p style="margin-top: 2rem;">
                Best regards,<br>
                <strong>The SWSpace Team</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SWSpace. All rights reserved.</p>
              <p>03 Quang Trung, Da Nang City | <a href="mailto:info@swspace.com.vn">info@swspace.com.vn</a></p>
              
              <div class="social-links">
                <a href="#" title="Facebook">f</a>
                <a href="#" title="Twitter">t</a>
                <a href="#" title="LinkedIn">in</a>
                <a href="#" title="Instagram">ig</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  async sendBookingConfirmation(userEmail, bookingData, userData) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generateBookingConfirmationEmail(bookingData, userData);
      const mailOptions = { 
        from: { 
          name: 'SWSpace Coworking', 
          address: process.env.FROM_EMAIL || process.env.SMTP_USER 
        }, 
        to: userEmail, 
        subject: emailContent.subject, 
        html: emailContent.html 
      };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: userEmail };
    } catch (error) { return { success: false, error: error.message }; }
  }

  generateQRBookingEmail(bookingData, userData) {
    const { bookingReference, serviceType, packageDuration, startDate, seatName, totalAmount, manualCode } = bookingData;
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
    const serviceTypeName = serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk';
    const packageName = ({ daily: 'Daily Package', weekly: 'Weekly Package', monthly: 'Monthly Package', yearly: 'Yearly Package' }[packageDuration]) || packageDuration;
    const fallbackManual = manualCode || bookingReference;
    
    return {
      subject: `🎉 Booking Confirmed + QR Code - ${bookingReference} | SWSpace`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation with QR</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #45bf55, #38a046); color: white; padding: 2rem; text-align: center; }
            .header .logo { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
            .success-icon { width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem; }
            .content { padding: 2rem; }
            .qr-section { background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 1px solid #1976d2; border-radius: 12px; padding: 2rem; margin: 1.5rem 0; text-align: center; }
            .qr-section h3 { color: #1976d2; margin-bottom: 1rem; font-size: 1.3rem; }
            .qr-image { margin: 1.5rem 0; padding: 1rem; background: white; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .manual-code { margin-top: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; background: #f0f9ff; padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid #bae6fd; font-weight: 600; color: #0f172a; }
            .manual-code-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; }
            .manual-code-value { font-family: 'Courier New', Courier, monospace; background: #fffbe6; padding: 0.35rem 0.9rem; border-radius: 999px; border: 1px dashed #fbbf24; color: #92400e; }
            .qr-instructions { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
            .qr-instructions h4 { color: #856404; margin-bottom: 1rem; }
            .qr-instructions ul { list-style: none; padding-left: 0; }
            .qr-instructions li { padding: 0.3rem 0; color: #856404; }
            .qr-instructions li::before { content: "📱"; margin-right: 0.5rem; }
            .booking-details { background-color: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #45bf55; }
            .booking-details h3 { color: #45bf55; margin-bottom: 1rem; }
            .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 500; color: #666; }
            .detail-value { font-weight: 600; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SW<strong>Space</strong></div>
              <div class="success-icon">✓</div>
              <h1>Booking Confirmed!</h1>
              <p>Your QR check-in code is ready</p>
            </div>
            
            <div class="content">
              <div style="font-size: 1.1rem; margin-bottom: 1.5rem; color: #555;">
                Hello <strong>${userData.fullName}</strong>,
              </div>
              
              <p>Your workspace booking is confirmed! Use the QR code below for quick and easy check-in.</p>
              
              <!-- QR Code Section -->
              <div class="qr-section">
                <h3>📲 Your Check-in QR Code</h3>
                <div class="qr-image">
                  <img src="cid:qr-code-image" alt="Check-in QR Code" style="width: 200px; height: 200px;"/>
                </div>
                <p style="color: #1976d2; font-weight: 500;">Save this QR code for easy check-in!</p>
                <div class="manual-code">
                  <span class="manual-code-label">Can't scan?</span>
                  <span class="manual-code-value">${fallbackManual}</span>
                </div>
              </div>
              
              <!-- QR Instructions -->
              <div class="qr-instructions">
                <h4>📱 How to Use Your QR Code</h4>
                <ul>
                  <li>Save this email or take a screenshot of the QR code</li>
                  <li>Arrive at SWSpace and go to the reception</li>
                  <li>Show your QR code to our staff or scan it yourself</li>
                  <li>Or use our online check-in (button below)</li>
                  <li>Enjoy your workspace!</li>
                </ul>
              </div>
              
              <!-- Quick Check-in Button -->
              <div style="text-align: center; margin: 2rem 0;">
                <a href="http://localhost:3000/qr-checkin?ref=${bookingReference}" 
                   style="display: inline-block; background: linear-gradient(135deg, #1976d2, #42a5f5); 
                          color: white; text-decoration: none; padding: 12px 30px; 
                          border-radius: 25px; font-weight: 600; font-size: 1rem;
                          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
                          transition: transform 0.2s;">
                  🎯 Quick Check-In Online
                </a>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                  Click this button to check in without scanning the QR code
                </p>
              </div>
              
              <!-- Booking Details -->
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Reference:</span>
                  <span class="detail-value">${bookingReference}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${serviceTypeName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Package:</span>
                  <span class="detail-value">${packageName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${formatDate(startDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Seat:</span>
                  <span class="detail-value">${seatName}</span>
                </div>
                ${totalAmount ? `
                <div class="detail-row">
                  <span class="detail-label">Total:</span>
                  <span class="detail-value">${formatCurrency(totalAmount)}</span>
                </div>
                ` : ''}
              </div>
              
              <p>Thank you for choosing SWSpace!</p>
              <p style="margin-top: 1.5rem;"><strong>The SWSpace Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  generatePendingPaymentEmail(bookingData, userData = {}) {
    const formatDate = (dateString) => {
      if (!dateString) return 'To be scheduled';
      const parsed = new Date(dateString);
      return Number.isNaN(parsed.getTime())
        ? dateString
        : parsed.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return 'To be confirmed';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
    };
    const serviceLabel = bookingData.serviceType || bookingData.service_type || 'Workspace Service';
    const packageLabel = bookingData.packageDuration || bookingData.package_duration || 'Custom Duration';
    const seatLabel = bookingData.seatName || bookingData.seat_name || 'Assigned At Check-in';

    return {
      subject: 'Booking Pending Confirmation',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Booking Pending Confirmation</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
            .header { text-align: center; margin-bottom: 24px; }
            .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
            .status-pill { display: inline-block; padding: 6px 14px; border-radius: 999px; background: #fff7ed; color: #9a3412; font-weight: 600; font-size: 13px; }
            .details-grid { display: grid; gap: 12px; margin: 24px 0; }
            .detail-card { background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 16px 20px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04); }
            .detail-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; display: block; }
            .detail-value { font-size: 1rem; color: #0f172a; font-weight: 600; }
            .note { background: #ecfccb; border-left: 4px solid #65a30d; padding: 16px; border-radius: 8px; color: #3f6212; line-height: 1.5; }
            .footer { text-align: center; color: #64748b; font-size: 13px; margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="status-pill">Awaiting Admin Confirmation</div>
              <h1>Thank you, ${userData.fullName || 'Valued Customer'}!</h1>
              <p style="color:#475569; margin-top: 8px;">We have received your booking request and payment.</p>
            </div>

            <p style="color:#0f172a; line-height: 1.6;">Our admin team is reviewing your payment now. We will send another email with your QR code and manual check-in code as soon as the booking is approved.</p>

            <div class="details-grid">
              <div class="detail-card">
                <span class="detail-label">Service</span>
                <span class="detail-value">${serviceLabel}</span>
              </div>
              <div class="detail-card">
                <span class="detail-label">Package</span>
                <span class="detail-value">${packageLabel}</span>
              </div>
              <div class="detail-card">
                <span class="detail-label">Seat / Room</span>
                <span class="detail-value">${seatLabel}</span>
              </div>
              <div class="detail-card">
                <span class="detail-label">Schedule</span>
                <span class="detail-value">${formatDate(bookingData.startDate || bookingData.start_time)}${bookingData.endDate || bookingData.end_time ? ` → ${formatDate(bookingData.endDate || bookingData.end_time)}` : ''}</span>
              </div>
              <div class="detail-card">
                <span class="detail-label">Amount</span>
                <span class="detail-value">${formatCurrency(bookingData.totalAmount || bookingData.finalPrice || bookingData.final_price)}</span>
              </div>
            </div>

            <div class="note">
              <strong>Next step:</strong> Please wait for our confirmation email. That message will include the QR code and manual code required for check-in.
            </div>

            <p style="color:#0f172a; line-height: 1.6; margin-top: 24px;">If you need to update your booking or have any questions, simply reply to this email. We are happy to help.</p>

            <div class="footer">
              <p>— The SWSpace Team</p>
              <p>03 Quang Trung, Da Nang City • info@swspace.com.vn</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  async sendPendingPaymentNotification(userEmail, bookingData, userData = {}) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generatePendingPaymentEmail(bookingData, userData);
      const mailOptions = {
        from: {
          name: 'SWSpace Coworking',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER
        },
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html
      };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: userEmail };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendBookingWithQR(userEmail, bookingData, userData, qrImageBuffer, qrFilename) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generateQRBookingEmail(bookingData, userData);
      const mailOptions = { 
        from: { 
          name: 'SWSpace Coworking', 
          address: process.env.FROM_EMAIL || process.env.SMTP_USER 
        }, 
        to: userEmail, 
        subject: emailContent.subject, 
        html: emailContent.html, 
        attachments: [{ filename: qrFilename, content: qrImageBuffer, contentType: 'image/png', cid: 'qr-code-image' }]
      };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: userEmail, attachments: [qrFilename] };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async sendQRBookingConfirmation(to, bookingData, qrFilePath) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');
      const emailContent = this.generateQRBookingEmail(bookingData, { fullName: bookingData.userFullName || 'Valued Customer', email: to });
      const mailOptions = { 
        from: { 
          name: 'SWSpace Coworking', 
          address: process.env.FROM_EMAIL || process.env.SMTP_USER 
        }, 
        to, 
        subject: `Booking Confirmation - ${bookingData.bookingReference} | SWSpace`, 
        html: emailContent.html || emailContent, 
        attachments: [{ 
          filename: `QR-${bookingData.bookingReference}.png`, 
          path: qrFilePath, 
          cid: 'qr-code-image' 
        }] 
      };
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, recipient: to };
    } catch (error) { return { success: false, error: error.message }; }
  }

  // Send QR booking confirmation email with attachment
  async sendQRBookingEmail(userData, bookingData, qrImagePath) {
    try {
      const emailContent = this.generateQRBookingEmail(bookingData, userData);
      
      const mailOptions = {
        from: `"SWSpace" <${this.transporter.options.auth.user}>`,
        to: userData.email,
        subject: emailContent.subject,
        html: emailContent.html,
        attachments: [
          {
            filename: 'qr-code.png',
            path: qrImagePath,
            cid: 'qr-code-image' // Referenced in HTML as src="cid:qr-code-image"
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('QR Booking email sent successfully:', {
        to: userData.email,
        messageId: result.messageId,
        reference: bookingData.bookingReference
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending QR booking email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, userFullName = null) {
    try {
      if (!this.transporter) throw new Error('Email transporter not initialized');

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendBaseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}`;
      const displayName = userFullName || 'there';

      const mailOptions = {
        from: {
          name: 'SWSpace',
          address: process.env.FROM_EMAIL || (this.transporter.options?.auth?.user || process.env.SMTP_USER)
        },
        to: email,
        subject: 'Reset Password - SWSpace',
        html: `
          <div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:24px;">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08)">
              <div style="background:linear-gradient(135deg,#6f51c7,#4f6bd6);padding:22px 24px;text-align:center;color:#fff;">
                <h2 style="margin:0;font-size:22px;">Reset Password</h2>
              </div>
              <div style="padding:24px;">
                <p style="margin:0 0 12px;color:#333;">Hello <strong>${displayName}</strong>,</p>
                <p style="margin:0 0 16px;color:#555;">We received a request to reset your password. Please click the button below to reset your password:</p>

                <div style="text-align:center;margin:22px 0;">
                  <a href="${resetUrl}" style="display:inline-block;background:#4f6bd6;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">Reset Password</a>
                </div>

                <p style="margin:0 0 10px;color:#666;font-size:13px;">Or copy and paste the following link into your browser:</p>
                <p style="margin:0 0 18px;color:#2b6cb0;font-size:13px;word-break:break-all;">${resetUrl}</p>

                <div style="background:#fff7db;border:1px solid #f2d68b;border-left:4px solid #f0b429;border-radius:8px;padding:14px;">
                  <p style="margin:0 0 8px;color:#6b4f00;font-weight:600;">Important:</p>
                  <ul style="margin:0;padding-left:18px;color:#6b4f00;font-size:13px;">
                    <li>This link will expire in 1 hour.</li>
                    <li>If you did not request a password reset, please ignore this email.</li>
                    <li>For security, please do not share this link with anyone.</li>
                  </ul>
                </div>

                <p style="margin:18px 0 0;color:#333;">Best regards,<br/><strong>The SWSpace Team</strong></p>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', { to: email, messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
