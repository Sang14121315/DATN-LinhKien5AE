const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  console.log('🔍 Auth middleware - Cookies:', req.cookies);
  console.log('🔍 Auth middleware - Authorization header:', req.header('Authorization'));
  
  const token =
    req.header('Authorization')?.replace('Bearer ', '') || // ưu tiên lấy từ header
    req.cookies?.token;                                    // fallback: lấy từ cookie

  console.log('🔍 Auth middleware - Final token:', token);

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('🔍 Auth middleware - Decoded user:', decoded);
    next();
  } catch (error) {
    console.error('❌ Auth middleware - Token verification failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
  
module.exports = auth;
