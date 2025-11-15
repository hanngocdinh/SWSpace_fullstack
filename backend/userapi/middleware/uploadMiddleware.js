const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/qr-images');
    try { await fs.access(uploadPath); } catch { await fs.mkdir(uploadPath, { recursive: true }); }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `qr-upload-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }
});

const uploadQRImage = upload.single('qrImage');

function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large. Maximum size is 10MB.' });
    if (error.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ success: false, message: 'Too many files. Only one file allowed.' });
    if (error.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ success: false, message: 'Unexpected field name. Use "qrImage" as field name.' });
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ success: false, message: 'Only image files (PNG, JPG, JPEG, GIF) are allowed.' });
  }
  console.error('Upload error:', error);
  return res.status(500).json({ success: false, message: 'File upload failed.' });
}

async function cleanupUploads(maxAge = 3600000) {
  try {
    const uploadPath = path.join(__dirname, '../uploads/qr-images');
    const files = await fs.readdir(uploadPath).catch(() => []);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(uploadPath, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log('Cleaned up old upload:', file);
      }
    }
  } catch (error) {
    console.error('Upload cleanup failed:', error);
  }
}

setInterval(cleanupUploads, 30 * 60 * 1000);

module.exports = { uploadQRImage, handleUploadError, cleanupUploads };
