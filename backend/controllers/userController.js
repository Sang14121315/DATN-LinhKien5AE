const UserService = require("../services/userService");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Reward = require('../models/Reward');

// Validation schemas
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow(""),
  address: Joi.string().allow(""),
  role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

exports.register = async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await UserService.create(req.body);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // đặt true nếu dùng HTTPS
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000, // 1 giờ
      })
      .status(201)
      .json({ user, token });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: error.message || "Error registering user" });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await UserService.getByEmail(email);
    if (user.isBlocked) {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
    }
    const token = await UserService.login(email, password);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000,
      })
      .json({ user: userData, token });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error logging in" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email } = req.body;
    const result = await UserService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Error processing request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { token, newPassword } = req.body;
    const result = await UserService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Error resetting password" });
  }
};

exports.validateToken = async (req, res) => {
  try {
    // Middleware auth đã validate token và set req.user
    const user = await UserService.getById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      valid: true,
      user: userData,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({
      valid: false,
      message: "Token is invalid or expired",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name, email, role } = req.query;
    const filters = {};
    if (name) filters.name = new RegExp(name, "i");
    if (email) filters.email = new RegExp(email, "i");
    if (role) filters.role = role;

    const users = await UserService.getAll(filters);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await UserService.getById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await UserService.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error updating user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await UserService.delete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting user" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { block } = req.body;
    if (typeof block !== "boolean") {
      return res.status(400).json({ message: "block must be boolean" });
    }
    const user = await UserService.blockUser(req.params.id, block);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error blocking user" });
  }
};

// Lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await UserService.getById(req.user.id);
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error fetching current user" });
  }
};

// Cập nhật profile user hiện tại
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Validation schema cho update profile
    const updateProfileSchema = Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().allow(""),
      address: Joi.string().allow(""),
    });

    const { error } = updateProfileSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await UserService.update(req.user.id, {
      name,
      phone,
      address,
    });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error updating profile" });
  }
};

// Đổi mật khẩu user hiện tại
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation schema cho change password
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required().messages({
        "any.required": "Mật khẩu hiện tại là bắt buộc",
        "string.empty": "Mật khẩu hiện tại không được để trống",
      }),
      newPassword: Joi.string()
        .min(6)
        .max(50)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
          "string.max": "Mật khẩu mới không được quá 50 ký tự",
          "string.pattern.base":
            "Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
          "any.required": "Mật khẩu mới là bắt buộc",
          "string.empty": "Mật khẩu mới không được để trống",
        }),
    });

    const { error } = changePasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const result = await UserService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error changing password" });
  }
};

// Lấy thông tin điểm, cấp bậc, tổng chi tiêu
exports.getLoyaltyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await require('../models/User').findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json({
      loyaltyPoints: user.loyaltyPoints || 0,
      totalSpent: user.totalSpent || 0,
      memberLevel: user.memberLevel || 'Bạc'
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi lấy thông tin khách hàng thân thiết' });
  }
};

// Lấy lịch sử giao dịch điểm
exports.getLoyaltyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await LoyaltyTransaction.find({ user_id: userId }).sort({ created_at: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi lấy lịch sử điểm' });
  }
};

// Quy đổi điểm lấy ưu đãi/quà tặng
exports.redeemLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { points, description } = req.body;
    if (!points || points <= 0) return res.status(400).json({ message: 'Số điểm quy đổi không hợp lệ' });
    const user = await require('../models/User').findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    if ((user.loyaltyPoints || 0) < points) return res.status(400).json({ message: 'Bạn không đủ điểm để quy đổi' });
    user.loyaltyPoints -= points;
    await user.save();
    await require('../models/LoyaltyTransaction').create({
      user_id: user._id,
      type: 'redeem',
      points: points,
      description: description || 'Quy đổi điểm lấy ưu đãi'
    });
    res.json({ success: true, message: 'Quy đổi điểm thành công', currentPoints: user.loyaltyPoints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi quy đổi điểm' });
  }
};

// Lấy danh sách ưu đãi/quà tặng
exports.getRewardList = async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true, $or: [ { quantity: 0 }, { quantity: { $gt: 0 } } ] });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi lấy danh sách ưu đãi/quà tặng' });
  }
};

// Đổi điểm lấy reward
exports.redeemReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;
    if (!rewardId) return res.status(400).json({ message: 'Thiếu rewardId' });
    const user = await require('../models/User').findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive || (reward.quantity > 0 && reward.quantity < 1)) {
      return res.status(400).json({ message: 'Ưu đãi/quà tặng không khả dụng' });
    }
    if ((user.loyaltyPoints || 0) < reward.pointsRequired) {
      return res.status(400).json({ message: 'Bạn không đủ điểm để đổi ưu đãi này' });
    }
    // Trừ điểm và giảm số lượng
    user.loyaltyPoints -= reward.pointsRequired;
    await user.save();
    if (reward.quantity > 0) {
      reward.quantity -= 1;
      await reward.save();
    }
    // Ghi lịch sử giao dịch điểm
    await require('../models/LoyaltyTransaction').create({
      user_id: user._id,
      type: 'redeem',
      points: reward.pointsRequired,
      description: `Đổi lấy: ${reward.name}`
    });
    res.json({ success: true, message: `Đã đổi thành công: ${reward.name}`, currentPoints: user.loyaltyPoints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi đổi điểm lấy ưu đãi' });
  }
};
