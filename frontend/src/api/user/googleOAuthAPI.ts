import axios from "../axios";
import {
  GoogleLoginResponse,
  GoogleAuthUrlResponse,
} from "../../types/GoogleOAuth";

const GOOGLE_API_BASE = "/google";

export const googleOAuthAPI = {
  // Google OAuth login
  login: async (idToken: string): Promise<GoogleLoginResponse> => {
    try {
      const response = await axios.post(`${GOOGLE_API_BASE}/login`, {
        idToken,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Google login failed");
    }
  },

  // Get Google auth URL
  getAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
    try {
      const response = await axios.get(`${GOOGLE_API_BASE}/auth-url`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get auth URL"
      );
    }
  },

  // Verify Google token
  verifyToken: async (idToken: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${GOOGLE_API_BASE}/verify`, {
        idToken,
      });
      return response.data.success;
    } catch (error: any) {
      return false;
    }
  },
};
