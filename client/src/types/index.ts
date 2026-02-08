export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  platform: string;
  device: string;
  ip: string;
  userAgentString: string;
}

export interface Session {
  _id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}
