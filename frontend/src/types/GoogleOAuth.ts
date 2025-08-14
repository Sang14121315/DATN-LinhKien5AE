// Google OAuth types
export interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  verified: boolean;
}

export interface GoogleLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar: string;
      role: string;
    };
    token: string;
  };
}

export interface GoogleAuthUrlResponse {
  success: boolean;
  authUrl: string;
}

// Google Identity API types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleIdentityConfig) => void;
          renderButton: (
            element: HTMLElement | string,
            options: GoogleButtonOptions
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface GoogleIdentityConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
  itp_support?: boolean;
  login_uri?: string;
  native_callback?: () => void;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface GoogleButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "rounded" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string;
  locale?: string;
}
