const Joi = require("joi");
const UserService = require("../services/userService");

// Schema validation cho forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email không hợp lệ",
      "any.required": "Email là bắt buộc",
      "string.empty": "Email không được để trống",
    }),
});

// Schema validation cho reset password với OTP
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Token là bắt buộc",
    "string.empty": "Token không được để trống",
  }),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.length": "Mã OTP phải có đúng 6 số",
      "string.pattern.base": "Mã OTP chỉ được chứa số",
      "any.required": "Mã OTP là bắt buộc",
      "string.empty": "Mã OTP không được để trống",
    }),
  newPassword: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
      "string.max": "Mật khẩu không được quá 50 ký tự",
      "string.pattern.base":
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      "any.required": "Mật khẩu mới là bắt buộc",
      "string.empty": "Mật khẩu mới không được để trống",
    }),
});

// Gửi email forgot password
exports.sendForgotPasswordEmail = async (req, res) => {
  try {
    console.log("📧 Forgot password request received:", req.body);

    // Validate input
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email } = req.body;

    // Gọi service để xử lý
    const result = await UserService.forgotPassword(email);

    console.log("✅ Forgot password email sent successfully");

    res.json({
      success: true,
      message: result.message,
      resetToken: result.resetToken,
      otp: result.otp, // Chỉ trả về trong development
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);

    // Xử lý các loại lỗi khác nhau
    if (error.message.includes("Email không tồn tại")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("gửi email")) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    });
  }
};

// Reset password với OTP
exports.resetPassword = async (req, res) => {
  try {
    console.log("🔐 Reset password request received");

    // Validate input
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { token, otp, newPassword } = req.body;

    // Gọi service để xử lý
    const result = await UserService.resetPassword(token, otp, newPassword);

    console.log("✅ Password reset successfully");

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);

    // Xử lý các loại lỗi khác nhau
    if (error.message.includes("OTP")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Token") || error.message.includes("hết hạn")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Người dùng không tồn tại")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    });
  }
};
