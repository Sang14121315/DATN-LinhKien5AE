const googleOAuthService = require("../services/googleOAuthService");

class GoogleOAuthController {
  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "Google ID token is required",
        });
      }

      // Verify Google token
      const googleUserData = await googleOAuthService.verifyGoogleToken(
        idToken
      );

      // Find or create user
      const user = await googleOAuthService.findOrCreateUser(googleUserData);

      // Generate JWT token
      const token = googleOAuthService.generateJWT(user);

      // Return user data and token
      res.status(200).json({
        success: true,
        message: "Google login successful",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role || "user",
          },
          token,
        },
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({
        success: false,
        message: "Google authentication failed",
        error: error.message,
      });
    }
  }

  async getGoogleAuthUrl(req, res) {
    try {
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${
          process.env.GOOGLE_CLIENT_ID ||
          "646853606141-qlecimj57veel2jusatnn6er8cpmore5.apps.googleusercontent.com"
        }&` +
        `redirect_uri=${
          process.env.GOOGLE_REDIRECT_URI ||
          "http://localhost:5173/auth/google/callback"
        }&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `access_type=offline&` +
        `prompt=consent`;

      res.status(200).json({
        success: true,
        authUrl,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error generating auth URL",
        error: error.message,
      });
    }
  }

  async googleCallback(req, res) {
    try {
      const { code } = req.body;
      console.log("Google callback received code:", code);

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Authorization code is required",
        });
      }

      // Đổi authorization code lấy access token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id:
            process.env.GOOGLE_CLIENT_ID ||
            "646853606141-qlecimj57veel2jusatnn6er8cpmore5.apps.googleusercontent.com",
          client_secret:
            process.env.GOOGLE_CLIENT_SECRET ||
            "your_google_client_secret_here",
          code: code,
          grant_type: "authorization_code",
          redirect_uri:
            process.env.GOOGLE_REDIRECT_URI ||
            "http://localhost:5173/auth/google/callback",
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log("Token response:", tokenData);

      if (tokenData.error) {
        console.error("Token error:", tokenData.error);
        throw new Error(
          tokenData.error_description || "Failed to get access token"
        );
      }

      // Lấy thông tin user từ Google
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      const userData = await userResponse.json();
      console.log("User data from Google:", userData);

      if (userData.error) {
        console.error("User data error:", userData.error);
        throw new Error("Failed to get user info");
      }

      // Tạo hoặc tìm user
      const googleUserData = {
        googleId: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        verified: userData.verified_email,
      };

      const user = await googleOAuthService.findOrCreateUser(googleUserData);
      const token = googleOAuthService.generateJWT(user);

      res.status(200).json({
        success: true,
        message: "Google login successful",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role || "user",
          },
          token,
        },
      });
    } catch (error) {
      console.error("Google callback error:", error);
      res.status(500).json({
        success: false,
        message: "Google authentication failed",
        error: error.message,
      });
    }
  }
}

module.exports = new GoogleOAuthController();
