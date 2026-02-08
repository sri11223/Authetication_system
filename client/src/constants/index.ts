export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ACCESS_TOKEN_KEY = 'accessToken';

export const PASSWORD_REQUIREMENTS = [
  'At least 8 characters long',
  'Contains at least 1 uppercase letter',
  'Contains at least 1 lowercase letter',
  'Contains at least 1 number',
  'Contains at least 1 special character (@$!%*?&#)',
];

export const SESSION_DEVICE_ICONS: Record<string, string> = {
  Desktop: '🖥️',
  Mobile: '📱',
  Tablet: '📱',
  Unknown: '💻',
};

export const MAX_SESSIONS_DISPLAY = 10;
