const QRCode = require('qrcode');
const JimpModule = require('jimp');
const Jimp = JimpModule?.Jimp || JimpModule;
const jsQR = require('jsqr');
let ZXing = null;
try {
  ZXing = require('@zxing/library');
} catch (error) {
  console.warn('[qrImageService] @zxing/library not available, falling back to jsQR only:', error.message);
}
let createCanvas, loadImage; // Optional (node-canvas may fail to build on Windows without build tools)
try {
  ({ createCanvas, loadImage } = require('canvas'));
} catch (e) {
  console.warn('[qrImageService] canvas module not available, using lightweight fallback:', e.message);
}
const fs = require('fs').promises;
const path = require('path');

function resizeImage(instance, width) {
  if (!instance || typeof instance.resize !== 'function') return instance;
  const targetWidth = Math.max(1, Math.round(width || instance.bitmap?.width || 1));
  try {
    return instance.resize({ w: targetWidth });
  } catch (error) {
    try {
      const auto = typeof Jimp.AUTO !== 'undefined' ? Jimp.AUTO : undefined;
      return instance.resize(targetWidth, auto);
    } catch (_) {
      return instance;
    }
  }
}

function cropImage(instance, x, y, w, h) {
  if (!instance || typeof instance.crop !== 'function') return instance;
  try {
    return instance.crop({ x, y, w, h });
  } catch (error) {
    try {
      return instance.crop(x, y, w, h);
    } catch (_) {
      return instance;
    }
  }
}

function normalizeImageDimensions(image) {
  if (!image || !image.bitmap) return image;
  const { width, height } = image.bitmap;
  const maxSide = Math.max(width, height);
  if (maxSide > 2600) {
    return resizeImage(image, 1800);
  }
  if (maxSide > 1800) {
    return resizeImage(image, 1400);
  }
  if (maxSide < 550) {
    const scaleFactor = Math.min(3, Math.ceil(900 / (maxSide || 1)));
    return resizeImage(image, width * scaleFactor);
  }
  return image;
}

function attemptAutoCrop(source) {
  try {
    const candidate = source.clone();
    const cropped = candidate.autocrop({ tolerance: 0.002, cropSymmetric: true, leaveBorder: 10 });
    if (cropped.bitmap.width > 80 && cropped.bitmap.height > 80) {
      return resizeImage(cropped, Math.max(cropped.bitmap.width, 900));
    }
  } catch (_) {
    /* ignore autocrop failures */
  }
  return null;
}

function createStrategicCrops(source) {
  if (!source || !source.bitmap) return [];
  const crops = [];
  const minDimension = Math.min(source.bitmap.width, source.bitmap.height);
  if (minDimension < 120) return crops;
  const coverageOptions = minDimension > 900 ? [0.85, 0.7] : [0.92, 0.78];
  const anchors = [
    { ax: 0.5, ay: 0.5 },
    { ax: 0.0, ay: 0.0 },
    { ax: 1.0, ay: 0.0 },
    { ax: 0.0, ay: 1.0 },
    { ax: 1.0, ay: 1.0 },
    { ax: 0.5, ay: 0.0 },
    { ax: 0.5, ay: 1.0 },
    { ax: 0.0, ay: 0.5 },
    { ax: 1.0, ay: 0.5 }
  ];
  for (const coverage of coverageOptions) {
    const size = Math.max(120, Math.floor(minDimension * coverage));
    if (size <= 0) continue;
    const maxX = Math.max(0, source.bitmap.width - size);
    const maxY = Math.max(0, source.bitmap.height - size);
    for (const anchor of anchors) {
      const x = Math.max(0, Math.min(maxX, Math.round(maxX * anchor.ax)));
      const y = Math.max(0, Math.min(maxY, Math.round(maxY * anchor.ay)));
      const cropped = cropImage(source.clone(), x, y, size, size);
      crops.push(resizeImage(cropped, Math.max(size, 900)));
    }
  }
  return crops;
}

class QRImageService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.zxingLib = ZXing;
    this.zxingReader = ZXing ? new ZXing.MultiFormatReader() : null;
    this.zxingHints = ZXing ? new Map([
      [ZXing.DecodeHintType.TRY_HARDER, true],
      [ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.QR_CODE]],
      [ZXing.DecodeHintType.ASSUME_GS1, false]
    ]) : null;
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
    try {
      let image = await Jimp.read(imagePath);
      image = normalizeImageDimensions(image);

      const original = image.clone();
      const grayscale = original.clone().greyscale();
      const highContrast = grayscale.clone().contrast(0.85);
      const normalized = grayscale.clone().normalize();
      const threshold = grayscale.clone().contrast(1).posterize(2);
      const boosted = grayscale.clone().contrast(0.4).normalize();
      const autoCropped = attemptAutoCrop(original);

      const variants = [
        original,
        grayscale,
        highContrast,
        normalized,
        threshold,
        boosted
      ];

      if (autoCropped) {
        variants.push(autoCropped, autoCropped.clone().contrast(0.6));
      }

      const cropSources = [original, highContrast, normalized, boosted];
      for (const source of cropSources) {
        createStrategicCrops(source).forEach((crop) => variants.push(crop));
      }

      for (const variant of variants) {
        const { data, width, height } = variant.bitmap;
        const clampedData = new Uint8ClampedArray(data);

        const jsqrResult = this.decodeWithJsQR(clampedData, width, height);
        if (jsqrResult) {
          return { success: true, qrString: jsqrResult.qrString, location: jsqrResult.location };
        }

        const zxingResult = this.decodeWithZXing(clampedData, width, height);
        if (zxingResult) {
          return { success: true, qrString: zxingResult.qrString, location: zxingResult.location };
        }
      }

      return { success: false, message: 'No QR code detected in the uploaded image. Please try another image.' };
    } catch (error) {
      console.error('QR extraction failed:', error);
      return { success: false, error: error.message || 'Unable to parse QR image' };
    }
  }

  decodeWithJsQR(pixelData, width, height) {
    const result = jsQR(pixelData, width, height, {
      inversionAttempts: 'attemptBoth',
      tryHarder: true
    });
    if (!result) return null;
    return {
      qrString: result.data,
      location: result.location
    };
  }

  decodeWithZXing(pixelData, width, height) {
    if (!this.zxingReader || !this.zxingLib) return null;
    try {
      const rgbBuffer = this.toZXingRGBBuffer(pixelData, width, height);
      const luminanceSource = new this.zxingLib.RGBLuminanceSource(rgbBuffer, width, height);
      const binaryBitmap = new this.zxingLib.BinaryBitmap(new this.zxingLib.HybridBinarizer(luminanceSource));
      const decodeResult = this.zxingReader.decode(binaryBitmap, this.zxingHints);
      if (!decodeResult) return null;
      const text = typeof decodeResult.getText === 'function' ? decodeResult.getText() : decodeResult.text;
      const points = typeof decodeResult.getResultPoints === 'function'
        ? decodeResult.getResultPoints().map(point => ({ x: point.getX(), y: point.getY() }))
        : null;
      return { qrString: text, location: points };
    } catch (error) {
      return null;
    } finally {
      try {
        this.zxingReader.reset();
      } catch {
        /* ignore reset errors */
      }
    }
  }

  toZXingRGBBuffer(pixelData, width, height) {
    const pixelCount = width * height;
    const rgbBuffer = new Int32Array(pixelCount);
    if (pixelData.length === pixelCount * 4) {
      for (let i = 0, j = 0; i < pixelCount; i += 1, j += 4) {
        const r = pixelData[j] & 0xff;
        const g = pixelData[j + 1] & 0xff;
        const b = pixelData[j + 2] & 0xff;
        rgbBuffer[i] = (r << 16) | (g << 8) | b;
      }
    } else {
      for (let i = 0; i < pixelCount && i < pixelData.length; i += 1) {
        const val = pixelData[i] & 0xff;
        rgbBuffer[i] = (val << 16) | (val << 8) | val;
      }
    }
    return rgbBuffer;
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
