interface Currency {
  name: string;
  code: string;
  symbol: string;
  rate: number;
}

interface Country {
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  referralCode: string;
  isVerified: boolean;
  status: string;
  country?: Country;
  currency?: Currency;
  token: string; // Changed from optional to required since it's always present in login response
  walletAddress?: string;
}

export interface AuthResponse {
  data: {
    user: User;
  };
  message: string;
  status: "success" | "error";
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  referral?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  verify_token: string;
}

export interface ResendVerificationResponse {
  status: "success" | "error";
  message: string;
}
