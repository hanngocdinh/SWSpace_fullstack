const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Cấu hình SMTP transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || 'your-email@gmail.com',
          pass: process.env.SMTP_PASS || 'your-app-password'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  // Template email xác nhận booking
  generateBookingConfirmationEmail(bookingData, userData) {
    const { 
      bookingReference, 
      serviceType, 
      packageDuration, 
      startDate, 
      startTime,
      seatName,
      totalAmount 
    } = bookingData;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const serviceTypeName = serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk';
    const packageName = {
      'daily': 'Daily Package',
      'weekly': 'Weekly Package', 
      'monthly': 'Monthly Package',
      'yearly': 'Yearly Package'
    }[packageDuration] || packageDuration;

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

  // Gửi email xác nhận booking
  async sendBookingConfirmation(userEmail, bookingData, userData) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const emailContent = this.generateBookingConfirmationEmail(bookingData, userData);

      const mailOptions = {
        from: {
          name: 'SWSpace Coworking',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@swspace.com.vn'
        },
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html
      };

      console.log('📧 Sending booking confirmation email to:', userEmail);
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: userEmail
      };
    } catch (error) {
      console.error('❌ Failed to send booking confirmation email:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gửi email với QR code attachment
  async sendBookingWithQR(userEmail, bookingData, userData, qrImageBuffer, qrFilename) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // Generate enhanced email content with QR info
      const emailContent = this.generateQRBookingEmail(bookingData, userData);

      const mailOptions = {
        from: {
          name: 'SWSpace Coworking',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@swspace.com.vn'
        },
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        attachments: [
          {
            filename: qrFilename,
            content: qrImageBuffer,
            contentType: 'image/png',
            cid: 'qrcode' // Content ID for inline embedding
          }
        ]
      };

      console.log('📧 Sending booking confirmation with QR code to:', userEmail);
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email with QR code sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: userEmail,
        attachments: [qrFilename]
      };
    } catch (error) {
      console.error('❌ Failed to send booking email with QR:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Template email xác nhận booking với QR code
  generateQRBookingEmail(bookingData, userData) {
    const { 
      bookingReference, 
      serviceType, 
      packageDuration, 
      startDate, 
      startTime,
      seatName,
      totalAmount 
    } = bookingData;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const serviceTypeName = serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk';
    const packageName = {
      'daily': 'Daily Package',
      'weekly': 'Weekly Package', 
      'monthly': 'Monthly Package',
      'yearly': 'Yearly Package'
    }[packageDuration] || packageDuration;

    return {
      subject: `🎉 Booking Confirmed + QR Check-in Code - ${bookingReference} | SWSpace`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation with QR Code</title>
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
              max-width: 650px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5a67d8 100%);
              color: white;
              padding: 3rem;
              text-align: center;
              position: relative;
              overflow: hidden;
              border-bottom: 5px solid #FFD700;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255,215,0,0.2), transparent, rgba(255,255,255,0.1), transparent);
              transform: rotate(45deg);
              animation: shimmer 4s ease-in-out infinite;
            }
            
            .header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FECA57);
              animation: rainbow 3s linear infinite;
            }
            
            @keyframes shimmer {
              0%, 100% { 
                transform: translateX(-150%) translateY(-150%) rotate(45deg);
                opacity: 0;
              }
              50% { 
                transform: translateX(150%) translateY(150%) rotate(45deg);
                opacity: 1;
              }
            }
            
            @keyframes rainbow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            
            .header h1 {
              font-size: 2rem;
              margin-bottom: 0.5rem;
              position: relative;
              z-index: 1;
            }
            
            .header .logo {
              font-size: 2.2rem;
              font-weight: bold;
              margin-bottom: 1rem;
              position: relative;
              z-index: 1;
            }
            
            .success-icon {
              width: 70px;
              height: 70px;
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
              font-size: 2.5rem;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 2.5rem;
            }
            
            .greeting {
              font-size: 1.2rem;
              margin-bottom: 1.5rem;
              color: #555;
              text-align: center;
            }
            
            .thank-you-banner {
              background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%);
              color: white;
              padding: 2.5rem;
              border-radius: 20px;
              text-align: center;
              margin: 2rem 0;
              box-shadow: 0 15px 35px rgba(76, 175, 80, 0.4);
              position: relative;
              overflow: hidden;
              border: 2px solid #FFD700;
            }
            
            .thank-you-banner::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent);
              animation: rotate 6s linear infinite;
            }
            
            .thank-you-banner::after {
              content: '✨';
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 24px;
              animation: sparkle 2s ease-in-out infinite;
            }
            
            @keyframes rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes sparkle {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            
            .thank-you-banner h2 {
              font-size: 1.8rem;
              margin-bottom: 0.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
            }
            
            .thank-you-banner p {
              font-size: 1.1rem;
              opacity: 0.95;
            }
            
            .qr-section {
              background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
              border: 2px solid #2196F3;
              border-radius: 15px;
              padding: 2rem;
              margin: 2rem 0;
              text-align: center;
            }
            
            .qr-section h3 {
              color: #1976d2;
              font-size: 1.5rem;
              margin-bottom: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              position: relative;
              z-index: 1;
            }
            
            .qr-instructions {
              color: #2c5aa0;
              font-size: 1rem;
              margin-bottom: 1.5rem;
              position: relative;
              z-index: 1;
            }
            
            .qr-image-container {
              background: white;
              padding: 1rem;
              border-radius: 10px;
              display: inline-block;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .qr-options {
              background: rgba(255, 193, 7, 0.1);
              border: 1px solid #FFC107;
              border-radius: 10px;
              padding: 1.5rem;
              margin: 1.5rem 0;
              position: relative;
              z-index: 1;
            }
            
            .qr-options h4 {
              color: #F57F17;
              margin-bottom: 1rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .qr-options ul {
              list-style: none;
              padding-left: 0;
            }
            
            .qr-options li {
              padding: 0.5rem 0;
              color: #F57F17;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .qr-options li::before {
              content: "📱";
              font-size: 1.2rem;
            }
            
            .booking-details {
              background-color: #f8f9fa;
              border-radius: 12px;
              padding: 2rem;
              margin: 2rem 0;
              border-left: 5px solid #667eea;
            }
            
            .booking-details h3 {
              color: #667eea;
              margin-bottom: 1.5rem;
              font-size: 1.3rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.8rem 0;
              border-bottom: 1px solid #e9ecef;
            }
            
            .detail-row:last-child {
              border-bottom: none;
            }
            
            .detail-label {
              font-weight: 600;
              color: #555;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .detail-value {
              font-weight: 700;
              color: #333;
            }
            
            .reference-number {
              background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
              border: 3px dashed #4CAF50;
              border-radius: 12px;
              padding: 1.5rem;
              text-align: center;
              margin: 2rem 0;
            }
            
            .reference-number .label {
              font-size: 1rem;
              color: #2d5a2d;
              margin-bottom: 0.5rem;
              font-weight: 600;
            }
            
            .reference-number .value {
              font-size: 1.6rem;
              font-weight: bold;
              color: #4CAF50;
              letter-spacing: 2px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .contact-info {
              background: linear-gradient(135deg, #f3e5f5, #fce4ec);
              border-radius: 12px;
              padding: 2rem;
              margin: 2rem 0;
              border: 1px solid #e1bee7;
            }
            
            .contact-info h4 {
              color: #7b1fa2;
              margin-bottom: 1rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .contact-info p {
              margin: 0.8rem 0;
              color: #6a1b99;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .footer {
              background: linear-gradient(135deg, #37474f, #546e7a);
              padding: 2rem;
              text-align: center;
              color: #cfd8dc;
            }
            
            .footer .logo {
              font-size: 1.5rem;
              font-weight: bold;
              color: #ffffff;
              margin-bottom: 1rem;
            }
            
            .social-links {
              margin-top: 1.5rem;
            }
            
            .social-links a {
              display: inline-block;
              margin: 0 0.5rem;
              padding: 0.8rem;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 50%;
              width: 45px;
              height: 45px;
              line-height: 29px;
              text-align: center;
              transition: all 0.3s ease;
            }
            
            .social-links a:hover {
              background-color: #5a67d7;
              transform: translateY(-2px);
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 0;
                border-radius: 0;
              }
              
              .header, .content {
                padding: 2rem 1rem;
              }
              
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
              }
              
              .detail-value {
                margin-top: 0.5rem;
              }
              
              .reference-number .value {
                font-size: 1.3rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">🏢 SW<strong>Space</strong></div>
              <div class="success-icon">✓</div>
              <h1>Booking Confirmed!</h1>
              <p>Your QR check-in code is ready</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <div class="greeting">
                Xin chào <strong>${userData.fullName}</strong>! 👋
              </div>
              
              <!-- Thank You Banner -->
              <div class="thank-you-banner">
                <h2>🙏 Cảm ơn bạn đã lựa chọn SWSpace!</h2>
                <p>Chúng tôi rất vui được phục vụ bạn và mang đến trải nghiệm workspace tuyệt vời nhất.</p>
              </div>
              
              <!-- QR Code Section -->
              <div class="qr-section">
                <h3>📱 Mã QR Check-in Của Bạn</h3>
                <div class="qr-instructions">
                  Sử dụng mã QR này để check-in nhanh chóng khi đến workspace
                </div>
                
                <div class="qr-image-container">
                  <img src="cid:qrcode" alt="QR Check-in Code" style="max-width: 250px; height: auto; border-radius: 8px;" />
                </div>
                
                <div class="qr-options">
                  <h4>💡 2 Cách Sử dụng QR Code:</h4>
                  <ul>
                    <li><strong>Quét trực tiếp:</strong> Mở app SWSpace → QR Check-in → Quét camera</li>
                    <li><strong>Tải ảnh lên:</strong> Tải ảnh QR này lên app để check-in</li>
                  </ul>
                </div>
              </div>
              
              <!-- Booking Reference -->
              <div class="reference-number">
                <div class="label">🆔 Mã Đặt Chỗ</div>
                <div class="value">${bookingReference}</div>
              </div>
              
              <!-- Booking Details -->
              <div class="booking-details">
                <h3>📋 Chi Tiết Đặt Chỗ</h3>
                
                <div class="detail-row">
                  <span class="detail-label">📍 Loại chỗ:</span>
                  <span class="detail-value">${serviceTypeName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📦 Gói:</span>
                  <span class="detail-value">${packageName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📅 Ngày & Giờ:</span>
                  <span class="detail-value">${formatDate(startDate)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">🪑 Chỗ ngồi:</span>
                  <span class="detail-value">${seatName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">🏢 Địa điểm:</span>
                  <span class="detail-value">Tầng 1, SWSpace Coworking</span>
                </div>
                
                ${totalAmount ? `
                <div class="detail-row">
                  <span class="detail-label">💰 Tổng tiền:</span>
                  <span class="detail-value">${formatCurrency(totalAmount)}</span>
                </div>
                ` : ''}
              </div>
              
              <!-- Contact Information -->
              <div class="contact-info">
                <h4>📞 Cần Hỗ Trợ?</h4>
                <p>📍 <strong>Địa chỉ:</strong> 03 Quang Trung, Thành phố Đà Nẵng</p>
                <p>📞 <strong>Phone:</strong> 0905965494</p>
                <p>📧 <strong>Email:</strong> info@swspace.com.vn</p>
                <p>🕒 <strong>Giờ mở:</strong> Thứ 2 - Chủ nhật, 24/7</p>
              </div>
              
              <p style="text-align: center; font-size: 1.1rem; margin: 2rem 0; color: #667eea; font-weight: 600;">
                🎯 Hãy đến sớm 10 phút để check-in thuận tiện nhất!
              </p>
              
              <p style="margin-top: 2rem; text-align: center;">
                Trân trọng,<br>
                <strong>🏢 Đội ngũ SWSpace</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="logo">SWSpace</div>
              <p>&copy; ${new Date().getFullYear()} SWSpace. All rights reserved.</p>
              <p>03 Quang Trung, Đà Nẵng | <a href="mailto:info@swspace.com.vn" style="color: #64b5f6;">info@swspace.com.vn</a></p>
              
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

  // Test email connection
  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      console.log('✅ Email service connection test successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Gửi email test
  async sendTestEmail(to) {
    try {
      const mailOptions = {
        from: {
          name: 'SWSpace Coworking',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@swspace.com.vn'
        },
        to: to,
        subject: '🧪 SWSpace Email Service Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h2 style="color: #45bf55;">Email Service Test</h2>
            <p>This is a test email from SWSpace booking system.</p>
            <p>If you receive this email, the email service is working correctly!</p>
            <p style="margin-top: 2rem;">
              Best regards,<br>
              <strong>SWSpace Team</strong>
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: to
      };
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send booking confirmation email with QR code attachment
  async sendQRBookingConfirmation(to, bookingData, qrFilePath) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      console.log('📧 Sending booking confirmation email with QR code to:', to);

      const emailContent = this.generateQRBookingEmail(bookingData, { 
        fullName: bookingData.userFullName || 'Valued Customer',
        email: to 
      });

      const mailOptions = {
        from: {
          name: 'SWSpace Coworking',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'nguyennhathuybdi06@gmail.com'
        },
        to: to,
        subject: `🎉 Booking Confirmation - ${bookingData.bookingReference} | SWSpace`,
        html: emailContent,
        attachments: [
          {
            filename: `QR-${bookingData.bookingReference}.png`,
            path: qrFilePath,
            cid: 'qr-code-image' // For embedding in HTML if needed
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: to
      };
    } catch (error) {
      console.error('❌ Failed to send QR booking email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();
