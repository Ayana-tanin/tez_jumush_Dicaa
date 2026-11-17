// PWA Configuration
const PWA_CONFIG = {
  // Backend API URL
  API_BASE_URL: 'https://backendapptj-production.up.railway.app',
  
  // Google OAuth URLs
  GOOGLE: {
    CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1082726228928-jpcqcu5t3j87kf0qvlo4og6gotrje6q0.apps.googleusercontent.com',
    REDIRECT_URI: 'https://backendapptj-production.up.railway.app/auth/google/callback',
    SCOPE: 'openid email profile',
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },
  
  // PWA Settings
  PWA: {
    NAME: 'Tez Jumush',
    SHORT_NAME: 'Tez Jumush',
    DESCRIPTION: 'Быстрая работа - мобильное приложение для поиска и выполнения задач',
    THEME_COLOR: '#007AFF',
    BACKGROUND_COLOR: '#ffffff',
    DISPLAY: 'standalone',
    ORIENTATION: 'portrait'
  },
  
  // Service Worker
  SW: {
    CACHE_NAME: 'tez-jumush-v1',
    STATIC_CACHE: 'static-v1',
    DYNAMIC_CACHE: 'dynamic-v1'
  },
  
  // API Endpoints
  ENDPOINTS: {
    GOOGLE_AUTH: '/api/google-auth',
    TASKS: '/api/tasks',
    USERS: '/api/users',
    AUTH: '/api/auth'
  }
};

// Helper functions
export const getApiUrl = (endpoint) => {
  return `${PWA_CONFIG.API_BASE_URL}${endpoint}`;
};

export const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: PWA_CONFIG.GOOGLE.CLIENT_ID,
    redirect_uri: PWA_CONFIG.GOOGLE.REDIRECT_URI,
    response_type: 'code',
    scope: PWA_CONFIG.GOOGLE.SCOPE,
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `${PWA_CONFIG.GOOGLE.AUTH_URL}?${params.toString()}`;
};

export const getTokenExchangeUrl = () => {
  return PWA_CONFIG.GOOGLE.TOKEN_URL;
};

export const getUserInfoUrl = (accessToken) => {
  return `${PWA_CONFIG.GOOGLE.USER_INFO_URL}?access_token=${accessToken}`;
};

export default PWA_CONFIG;
