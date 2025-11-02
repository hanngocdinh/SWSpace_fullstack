const QRCode = require('qrcode');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

class QRImageService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate beautiful QR code image with branding
   */
  async generateQRImage(qrString, bookingDetails) {
    try {
      console.log('🎨 Generating branded QR image for:', bookingDetails);

      // Canvas dimensions
      const canvasWidth = 600;
      const canvasHeight = 800;
      const qrSize = 300;
      
      // Create canvas
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // White container
      const containerPadding = 40;
      const containerY = 80;
      const containerHeight = canvasHeight - containerY - 40;
      
      ctx.fillStyle = 'white';
      ctx.roundRect(containerPadding, containerY, canvasWidth - (containerPadding * 2), containerHeight, 20);
      ctx.fill();

      // Header section
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏢 SWSpace Check-in', canvasWidth / 2, containerY + 60);

      // Divider line
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(containerPadding + 40, containerY + 90);
      ctx.lineTo(canvasWidth - containerPadding - 40, containerY + 90);
      ctx.stroke();

      // Generate QR code
      const qrCanvas = createCanvas(qrSize, qrSize);
      await QRCode.toCanvas(qrCanvas, qrString, {
        width: qrSize,
        margin: 1,
        color: {
          dark: '#2C3E50',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Draw QR code
      const qrX = (canvasWidth - qrSize) / 2;
      const qrY = containerY + 120;
      ctx.drawImage(qrCanvas, qrX, qrY);

      // QR border
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6);

      // Booking details section
      const detailsY = qrY + qrSize + 40;
      
      ctx.fillStyle = '#f8f9fa';
      ctx.roundRect(containerPadding + 20, detailsY, canvasWidth - (containerPadding * 2) - 40, 120, 10);
      ctx.fill();

      // Booking info
      ctx.fillStyle = '#555555';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      
      const leftX = containerPadding + 40;
      const rightX = canvasWidth - containerPadding - 40;
      
      ctx.fillText('📍 Loại chỗ:', leftX, detailsY + 30);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'right';
      ctx.fillText(bookingDetails.spaceType || 'Hot Desk', rightX, detailsY + 30);

      ctx.fillStyle = '#555555';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📅 Ngày đặt:', leftX, detailsY + 55);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'right';
      const bookingDate = new Date(bookingDetails.date).toLocaleDateString('vi-VN');
      ctx.fillText(bookingDate, rightX, detailsY + 55);

      ctx.fillStyle = '#555555';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('👤 Khách hàng:', leftX, detailsY + 80);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'right';
      ctx.fillText(bookingDetails.customerName || 'Valued Customer', rightX, detailsY + 80);

      ctx.fillStyle = '#555555';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🆔 Mã booking:', leftX, detailsY + 105);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'right';
      const shortId = bookingDetails._id ? bookingDetails._id.slice(-8).toUpperCase() : 'N/A';
      ctx.fillText(`#${shortId}`, rightX, detailsY + 105);

      // Thank you message
      const thanksY = detailsY + 160;
      
      ctx.fillStyle = '#667eea';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🙏 Cảm ơn bạn đã lựa chọn SWSpace!', canvasWidth / 2, thanksY);
      
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.fillText('Hãy quét mã QR này khi check-in tại workspace', canvasWidth / 2, thanksY + 30);

      // Instructions
      const instructY = thanksY + 70;
      ctx.fillStyle = '#f0f8ff';
      ctx.roundRect(containerPadding + 20, instructY, canvasWidth - (containerPadding * 2) - 40, 60, 8);
      ctx.fill();

      ctx.fillStyle = '#2c5aa0';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💡 Hướng dẫn: Mở app SWSpace → QR Check-in → Quét mã hoặc tải ảnh lên', canvasWidth / 2, instructY + 25);
      ctx.fillText('⏰ Vui lòng đến sớm 10 phút để check-in thuận tiện', canvasWidth / 2, instructY + 45);

      // Footer
      ctx.fillStyle = '#999999';
      ctx.font = '12px Arial';
      ctx.fillText('📧 info@swspace.com.vn • 📞 0905965494 • 📍 03 Quang Trung, Đà Nẵng', canvasWidth / 2, canvasHeight - 30);

      // Generate filename
      const timestamp = Date.now();
      const filename = `qr-checkin-${shortId}-${timestamp}.png`;
      const filepath = path.join(this.tempDir, filename);

      // Save to file
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(filepath, buffer);

      console.log('✅ QR image generated successfully:', filepath);

      return {
        success: true,
        filepath,
        filename,
        buffer,
        size: buffer.length
      };

    } catch (error) {
      console.error('💥 QR image generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract QR code from uploaded image
   */
  async extractQRFromImage(imagePath) {
    try {
      console.log('🔍 Extracting QR from image:', imagePath);

      // Load image
      const image = await loadImage(imagePath);
      
      // Create canvas for processing
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Here you would normally use a QR detection library like jsQR
      // For now, we'll simulate QR detection
      // In production, you should use: const jsQR = require('jsqr');
      
      // Mock QR detection result
      // const qrResult = jsQR(imageData.data, imageData.width, imageData.height);
      
      // For now, return a mock result
      // In real implementation, you would return qrResult.data
      
      console.log('📷 QR extraction completed');
      
      return {
        success: true,
        // qrString: qrResult ? qrResult.data : null,
        qrString: null, // Will be null until jsQR is implemented
        message: 'QR detection requires jsQR library integration'
      };

    } catch (error) {
      console.error('💥 QR extraction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(maxAge = 3600000) { // 1 hour default
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log('🗑️ Cleaned up old file:', file);
        }
      }
    } catch (error) {
      console.error('🚨 Cleanup failed:', error);
    }
  }

  /**
   * Get file buffer for email attachment
   */
  async getImageBuffer(filepath) {
    try {
      const buffer = await fs.readFile(filepath);
      return buffer;
    } catch (error) {
      console.error('📁 Failed to read file:', error);
      return null;
    }
  }
}

// Extension for canvas roundRect if not available
function addRoundRectPolyfill() {
  const { CanvasRenderingContext2D } = require('canvas');
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    };
  }
}

// Initialize polyfill
addRoundRectPolyfill();

module.exports = new QRImageService();
