const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

class UserService {
  static async getAll(filters = {}) {
    return await User.find(filters).select('-password');
  }

  static async getById(id) {
    const user = await User.findById(id).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async getByEmail(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    return user;
  }

  static async create({ name, email, password, phone, address, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name, email, password: hashedPassword, phone, address, role
    });

    const userObj = newUser.toObject();
    delete userObj.password;
    return userObj;
  }

  static async update(id, data) {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async delete(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error('User not found');
    return true;
  }

  static async login(email, password) {
    if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET');

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email not found');

    // Tạo token đặt lại mật khẩu
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại cửa hàng laptop.</p>
        <p>Vui lòng nhấn vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Liên kết sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br/>Đội ngũ cửa hàng laptop</p>
      `
    });

    return { message: 'Đường dẫn đặt lại mật khẩu đã được gửi đến email của bạn' };
  }

  static async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) throw new Error('User not found');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      return { message: 'Mật khẩu đã được đặt lại thành công' };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async blockUser(id, block) {
    const user = await User.findByIdAndUpdate(id, { isBlocked: block }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }
}

module.exports = UserService;