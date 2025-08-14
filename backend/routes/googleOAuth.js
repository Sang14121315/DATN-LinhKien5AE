const express = require("express");
const router = express.Router();
const googleOAuthController = require("../controllers/googleOAuthController");

// Google OAuth login
router.post("/login", googleOAuthController.googleLogin);

// Get Google auth URL
router.get("/auth-url", googleOAuthController.getGoogleAuthUrl);

// Google OAuth callback
router.post("/callback", googleOAuthController.googleCallback);

module.exports = router;
