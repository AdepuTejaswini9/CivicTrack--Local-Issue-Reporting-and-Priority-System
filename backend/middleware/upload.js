// middleware/upload.js
// Handles file uploads using Multer

const multer = require('multer');
const path = require('path');

// Configure storage: where and how to save files
const storage = multer.diskStorage({
  // Destination folder for uploads
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files saved in backend/uploads/
  },
  // Generate a unique filename to avoid conflicts
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `issue-${uniqueSuffix}${extension}`);
  },
});

// File filter: only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Create the multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max file size: 5MB
  },
});

module.exports = upload;
