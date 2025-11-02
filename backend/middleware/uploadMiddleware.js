const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/qr-images');
    
    // Ensure upload directory exists
    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `qr-upload-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for single file upload
const uploadQRImage = upload.single('qrImage');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "qrImage" as field name.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files (PNG, JPG, JPEG, GIF) are allowed.'
    });
  }
  
  console.error('Upload error:', error);
  res.status(500).json({
    success: false,
    message: 'File upload failed.'
  });
};

// Cleanup old uploaded files
const cleanupUploads = async (maxAge = 3600000) => { // 1 hour default
  try {
    const uploadPath = path.join(__dirname, '../uploads/qr-images');
    
    try {
      const files = await fs.readdir(uploadPath);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(uploadPath, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log('🗑️ Cleaned up old upload:', file);
        }
      }
    } catch (err) {
      // Directory might not exist yet, ignore
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  } catch (error) {
    console.error('🚨 Upload cleanup failed:', error);
  }
};

// Schedule periodic cleanup
setInterval(cleanupUploads, 30 * 60 * 1000); // Every 30 minutes

module.exports = {
  uploadQRImage,
  handleUploadError,
  cleanupUploads
};
