const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sử dụng disk storage để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('=== MULTER DEBUG ===');
    console.log('Destination called for file:', file.originalname);
    console.log('Uploads directory:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    console.log('Original filename:', file.originalname);
    console.log('Field name:', file.fieldname);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép upload ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  }
});

module.exports = upload;