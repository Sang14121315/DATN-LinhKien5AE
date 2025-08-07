const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendOTPEmail,
  sendResetSuccessEmail,
  verifyResetToken,
} = require("../utils/forgotPasswordEmailService");

class UserService {
  static async getAll(filters = {}) {
    return await User.find(filters).select("-password");
  }

  static async getById(id) {
    const user = await User.findById(id).select("-password");
    if (!user) throw new Error("User not found");
    return user;
  }

  static async getByEmail(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    return user;
  }

  static async create({ name, email, password, phone, address, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err = new Error("User already exists");
      err.status = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
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

    const user = await User.findByIdAndUpdate(id, data, { new: true }).select(
      "-password"
    );
    if (!user) throw new Error("User not found");
    return user;
  }

  static async delete(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error("User not found");
    return true;
  }

  static async login(email, password) {
    if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email không tồn tại trong hệ thống");

    try {
      // Gửi email OTP sử dụng service mới
      const result = await sendOTPEmail(user);

      return {
        success: true,
        message:
          "Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã 6 số.",
        resetToken: result.resetToken,
        otp: result.otp, // Chỉ trả về trong development
      };
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }
  }

  static async resetPassword(token, otp, newPassword) {
    try {
      // Verify token với OTP sử dụng service mới
      const decoded = verifyResetToken(token, otp);
      const user = await User.findById(decoded.id);
      if (!user) throw new Error("Người dùng không tồn tại");

      // Hash password mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      // Gửi email thông báo reset password thành công
      try {
        await sendResetSuccessEmail(user);
      } catch (emailError) {
        console.error("Error sending reset success email:", emailError);
        // Không throw error vì đây chỉ là email thông báo
      }

      return {
        success: true,
        message:
          "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.",
      };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      if (error.message.includes("OTP")) {
        throw new Error(error.message);
      }
      if (error.message.includes("Token")) {
        throw new Error(
          "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại."
        );
      }
      throw new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
    }
  }

  static async blockUser(id, block) {
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: block },
      { new: true }
    ).select("-password");
    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = UserService;
