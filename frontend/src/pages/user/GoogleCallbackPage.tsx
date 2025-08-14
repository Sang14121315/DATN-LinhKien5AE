import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { googleOAuthAPI } from "../../api/user/googleOAuthAPI";
import "./GoogleCallbackPage.scss";

const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          if (isMounted) {
            setError("Google authentication failed: " + error);
            setIsLoading(false);
          }
          return;
        }

        if (!code) {
          if (isMounted) {
            setError("No authorization code received");
            setIsLoading(false);
          }
          return;
        }

        // Gọi API backend để đổi code lấy token
        const response = await fetch(
          "http://localhost:5000/api/google/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
            credentials: "include",
          }
        );

        console.log("Google callback response:", response);
        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("Google callback data:", data);

        if (data.success && isMounted) {
          // Login thành công
          await login(data.data.token, data.data.user);
          navigate("/", { replace: true });
        } else if (isMounted) {
          throw new Error(data.message || "Login failed");
        }
      } catch (error: any) {
        console.error("Google callback error:", error);
        if (isMounted) {
          setError(error.message || "Google authentication failed");
          setIsLoading(false);
        }
      }
    };

    handleGoogleCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, login]);

  if (isLoading) {
    return (
      <div className="google-callback-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Đang xử lý đăng nhập...</h2>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="google-callback-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Đăng nhập thất bại</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => navigate("/login")}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallbackPage;
