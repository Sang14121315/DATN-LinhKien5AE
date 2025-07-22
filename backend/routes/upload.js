// ✅ Sửa ở backend: routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/brands');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.originalname.split('.')[0].replace(/\s+/g, '-').toLowerCase();
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/upload/brand
router.post('/brand', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  return res.json({ filename: req.file.filename });
});

module.exports = router;