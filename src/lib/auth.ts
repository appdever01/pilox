import type {
  User,
  SignUpPayload,
  LoginPayload,
  VerifyEmailPayload,
} from "@/types/auth";
import AuthApiClient from "@/lib/auth-api-client";
import { API_BASE_URL, API_ROUTES } from "./config";

const TOKEN_KEY = "pilox_token";
const FIRST_VISIT_KEY = "first_visit";
const USER_KEY = "pilox_user";
const API_URL = API_BASE_URL;
const RESEND_COOLDOWN_KEY = "resend_cooldown";

interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: {
    user: User;
    token?: string;
  };
}

interface UserDetailsResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token?: string;
  };
}

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = auth.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await response.json();

    if (response.status === 401) {
      auth.removeToken();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error: any) {
    if (error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
};

export const auth = {
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(RESEND_COOLDOWN_KEY);
    }
  },

  setUser(userData: any) {
    if (typeof window === "undefined") return;
    if (!userData) {
      console.error("No userData provided to setUser");
      return;
    }
    try {
      // Extract token from userData and store it
      if (userData.token) {
        this.setToken(userData.token);
      }
      
      // Store user data without token to avoid duplication
      const { token, ...userWithoutToken } = userData;
      localStorage.setItem(USER_KEY, JSON.stringify(userWithoutToken));
    } catch (error) {
      console.error("Error storing user data:", error);
      this.removeToken();
    }
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;

    try {
      const userStr = localStorage.getItem(USER_KEY);
      const token = this.getToken();
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return token ? { ...user, token } : user;
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.removeToken();
      return null;
    }
  },

  setCooldownTime() {
    if (typeof window === "undefined") return;

    const now = new Date();
    const cooldownEnd = now.getTime() + 2 * 60 * 1000; // 2 minutes from now
    localStorage.setItem(RESEND_COOLDOWN_KEY, cooldownEnd.toString());
  },

  getCooldownRemaining(): number {
    if (typeof window === "undefined") return 0;

    try {
      const cooldownStr = localStorage.getItem(RESEND_COOLDOWN_KEY);
      if (!cooldownStr) return 0;

      const cooldownEnd = parseInt(cooldownStr);
      const now = new Date().getTime();
      const remaining = Math.max(0, cooldownEnd - now);

      if (remaining === 0) {
        localStorage.removeItem(RESEND_COOLDOWN_KEY);
      }

      return Math.ceil(remaining / 1000); // Convert to seconds
    } catch (error) {
      console.error("Error calculating cooldown:", error);
      return 0;
    }
  },

  async verifyAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      this.removeToken();
      return false;
    }

    try {
      const response = await AuthApiClient.get<UserDetailsResponse>(
        API_ROUTES.USER_DETAILS
      );
      
      if (response.status === "success" && response.data?.user) {
        // Keep the current token if the verification was successful
        const userData = { ...response.data.user, token };
        this.setUser(userData);
        return true;
      }
      
      // If verification failed, clean up auth data
      this.removeToken();
      return false;
    } catch (error: any) {
      // If there's a 401 error, it means the token is invalid
      if (error.status === 401) {
        this.removeToken();
      }
      console.error("Error verifying auth:", error);
      return false;
    }
  },

  async signup(payload: SignUpPayload, router: any) {
    const response = await apiCall<UserDetailsResponse>(API_ROUTES.SIGNUP, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (response.status === "success" && response.data) {
      const { user, token } = response.data;
      this.setUser({ ...user, token });
      this.setCooldownTime();
      router.push("/verify-email");
    } else {
      throw new Error(response.message);
    }
  },

  async verifyEmail(token: string) {
    const payload: VerifyEmailPayload = { verify_token: token };
    return await apiCall("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resendVerificationEmail() {
    const token = this.getToken();
    if (!token) throw new Error("No auth token found");
    
    const cooldownRemaining = this.getCooldownRemaining();
    if (cooldownRemaining > 0) {
      const minutes = Math.floor(cooldownRemaining / 60);
      const seconds = cooldownRemaining % 60;
      throw new Error(
        `Please wait ${minutes}:${seconds.toString().padStart(2, "0")} minutes before requesting another verification email`
      );
    }

    const response = await apiCall(API_ROUTES.RESEND_VERIFICATION_EMAIL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === "success") {
      this.setCooldownTime();
    } else {
      throw new Error(response.message);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isFirstVisit(): boolean {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(FIRST_VISIT_KEY);
  },

  markVisited() {
    if (typeof window !== "undefined") {
      localStorage.setItem(FIRST_VISIT_KEY, "true");
    }
  },

  updateUser(userData: Partial<User>) {
    if (typeof window === "undefined") return;
    try {
      const currentUser = this.getUser();
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  },

  isUserVerified(): boolean {
    const user = this.getUser();
    return user?.isVerified ?? false;
  },

  requireVerification(router: any) {
    const user = this.getUser();
    if (user && !user.isVerified) {
      router.push("/verify-email");
    }
  },
};
