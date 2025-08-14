const { OAuth2Client } = require("google-auth-library");
const GoogleOAuthConfig = require("../config/googleOAuth");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

class GoogleOAuthService {
  constructor() {
    this.client = new OAuth2Client(GoogleOAuthConfig.clientID);
  }

  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: GoogleOAuthConfig.clientID,
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified: payload.email_verified,
      };
    } catch (error) {
      throw new Error("Invalid Google token");
    }
  }

  async findOrCreateUser(googleUserData) {
    try {
      // Tìm user theo Google ID
      let user = await User.findOne({ googleId: googleUserData.googleId });

      if (!user) {
        // Tìm user theo email
        user = await User.findOne({ email: googleUserData.email });

        if (user) {
          // Cập nhật Google ID cho user hiện tại
          user.googleId = googleUserData.googleId;
          await user.save();
        } else {
          // Tạo user mới
          user = new User({
            email: googleUserData.email,
            name: googleUserData.name,
            googleId: googleUserData.googleId,
            avatar: googleUserData.picture,
            isVerified: googleUserData.verified,
            password:
              "google_oauth_user_" + Math.random().toString(36).substr(2, 9),
          });
          await user.save();
        }
      }

      return user;
    } catch (error) {
      throw new Error("Error creating/finding user");
    }
  }

  generateJWT(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role || "user",
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    });
  }
}

module.exports = new GoogleOAuthService();
