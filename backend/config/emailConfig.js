// Cấu hình email service
const emailConfig = {
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true" || false,
    auth: {
      user: process.env.SMTP_USER || "ngtien.2610@gmail.com",
      pass: process.env.SMTP_PASS || "chhz oftf ymsd vlxp",
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  // Email settings
  from: {
    name: process.env.EMAIL_FROM_NAME || "5AELINHKIEN System",
    email: process.env.EMAIL_FROM_EMAIL || "ngtien.2610@gmail.com",
  },

  // URLs
  urls: {
    frontend: process.env.FRONTEND_URL || "http://localhost:5173",
    admin: process.env.ADMIN_URL || "http://localhost:5173/admin",
  },

  // Retry settings
  retry: {
    maxAttempts: parseInt(process.env.EMAIL_MAX_RETRIES) || 2,
    delayMs: parseInt(process.env.EMAIL_RETRY_DELAY) || 1000,
  },

  // Timeout settings
  timeout: {
    connection: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT) || 10000,
    send: parseInt(process.env.EMAIL_SEND_TIMEOUT) || 30000,
  },

  // Logging
  logging: {
    enabled: process.env.EMAIL_LOGGING !== "false",
    level: process.env.EMAIL_LOG_LEVEL || "info",
  },
};

// Validation function
const validateEmailConfig = () => {
  const requiredFields = ["SMTP_USER", "SMTP_PASS"];
  const missingFields = requiredFields.filter((field) => !process.env[field]);

  if (missingFields.length > 0) {
    console.warn(
      `⚠️ Missing email environment variables: ${missingFields.join(", ")}`
    );
    console.warn("📧 Using default email configuration");
  }

  return true;
};

// Test configuration
const testEmailConfig = async () => {
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport(emailConfig.smtp);

    await transporter.verify();
    console.log("✅ Email configuration is valid");
    transporter.close();
    return true;
  } catch (error) {
    console.error("❌ Email configuration test failed:", error.message);
    return false;
  }
};

module.exports = {
  emailConfig,
  validateEmailConfig,
  testEmailConfig,
};
