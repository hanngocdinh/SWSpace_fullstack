const QRCode = require('qrcode');
let createCanvas, loadImage; // Optional (node-canvas may fail to build on Windows without build tools)
try {
  ({ createCanvas, loadImage } = require('canvas'));
} catch (e) {
  console.warn('[qrImageService] canvas module not available, using lightweight fallback:', e.message);
}
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

  async generateQRImage(qrString, bookingDetails) {
    // Fallback mode if canvas is unavailable
    if (!createCanvas) {
      try {
        const dataUrl = await QRCode.toDataURL(qrString, { width: 300, margin: 2 });
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        const shortId = bookingDetails && bookingDetails._id ? String(bookingDetails._id).slice(-8).toUpperCase() : 'QR';
        const filename = `qr-${shortId}-${Date.now()}.png`;
        const filepath = path.join(this.tempDir, filename);
        await fs.writeFile(filepath, buffer);
        return { success: true, filepath, filename, buffer, size: buffer.length, fallback: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    try {
      const canvasWidth = 600;
      const canvasHeight = 800;
      const qrSize = 300;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const containerPadding = 40; const containerY = 80; const containerHeight = canvasHeight - containerY - 40;
      ctx.fillStyle = 'white'; if (!ctx.roundRect) addRoundRectPolyfill(ctx); ctx.roundRect(containerPadding, containerY, canvasWidth - (containerPadding * 2), containerHeight, 20); ctx.fill();
      ctx.fillStyle = '#333'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.fillText('SWSpace Check-in', canvasWidth / 2, containerY + 60);
      const qrCanvas = createCanvas(qrSize, qrSize);
      await QRCode.toCanvas(qrCanvas, qrString, { width: qrSize, margin: 1, color: { dark: '#2C3E50', light: '#FFFFFF' }, errorCorrectionLevel: 'M' });
      const qrX = (canvasWidth - qrSize) / 2; const qrY = containerY + 120; ctx.drawImage(qrCanvas, qrX, qrY);
      const shortId = bookingDetails && bookingDetails._id ? String(bookingDetails._id).slice(-8).toUpperCase() : 'QR';
      ctx.fillStyle = '#555'; ctx.font = '16px Arial'; ctx.fillText(`#${shortId}`, canvasWidth / 2, qrY + qrSize + 30);
      const filename = `qr-checkin-${shortId}-${Date.now()}.png`; const filepath = path.join(this.tempDir, filename);
      const buffer = canvas.toBuffer('image/png'); await fs.writeFile(filepath, buffer);
      return { success: true, filepath, filename, buffer, size: buffer.length };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async extractQRFromImage(imagePath) {
    if (!loadImage) {
      return { success: false, error: 'Image processing unavailable (canvas not installed)' };
    }
    try {
      const image = await loadImage(imagePath);
      // TODO: integrate jsQR; currently returns placeholder
      return { success: true, qrString: null, message: 'QR detection requires jsQR integration' };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async cleanupTempFiles(maxAge = 3600000) {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('QR image cleanup failed:', error);
    }
  }

  async getImageBuffer(filepath) {
    try {
      return await fs.readFile(filepath);
    } catch (error) {
      console.error('Failed to read QR image file:', error);
      return null;
    }
  }
}

function addRoundRectPolyfill(ctx) {
  if (!ctx.roundRect) {
    ctx.roundRect = function (x, y, w, h, r) {
      const minSize = Math.min(w, h);
      if (r > minSize / 2) r = minSize / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      return ctx;
    };
  }
}

module.exports = new QRImageService();
