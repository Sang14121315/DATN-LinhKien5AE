import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { googleOAuthAPI } from "../../api/user/googleOAuthAPI";
import "./GoogleLoginButton.scss";

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  className = "",
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Sử dụng Google OAuth flow truyền thống
      const clientId =
        "646853606141-qlecimj57veel2jusatnn6er8cpmore5.apps.googleusercontent.com";
      const redirectUri = encodeURIComponent(
        window.location.origin + "/auth/google/callback"
      );
      const scope = encodeURIComponent("openid email profile");
      const responseType = "code";

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Redirect đến Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Google login error:", error);
      onError?.("Google login failed");
    }
  };

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "646853606141-qlecimj57veel2jusatnn6er8cpmore5.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        prompt_parent_id: "google-signin-button", // Chỉ hiển thị trong container này
        itp_support: false, // Tắt Google One Tap
        context: "signin", // Thêm context để tắt One Tap
        ux_mode: "redirect", // Sử dụng redirect thay vì popup
        login_uri: window.location.origin + "/login", // Redirect về trang login
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      const idToken = response.credential;

      // Gọi API backend để xác thực
      const data = await googleOAuthAPI.login(idToken);

      if (data.success) {
        // Login thành công
        await login(data.data.token, data.data.user);
        onSuccess?.(data.data.user);
        navigate("/");
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      onError?.(error.message || "Google login failed");
    }
  };

  return (
    <div className={`google-login-container ${className}`}>
      <div id="google-signin-button"></div>
      <button
        className="google-login-fallback"
        onClick={handleGoogleLogin}
        type="button"
      >
        <svg className="google-icon" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Đăng nhập bằng Google
      </button>
    </div>
  );
};

export default GoogleLoginButton;
