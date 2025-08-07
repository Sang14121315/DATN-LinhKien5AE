const UserService = require("../services/userService");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

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
    const token = await UserService.login(email, password);
    const user = await UserService.getByEmail(email);

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
      return res.status(401).json({ message: 'User not found' });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({ 
      valid: true, 
      user: userData,
      message: 'Token is valid' 
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ 
      valid: false, 
      message: 'Token is invalid or expired' 
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
