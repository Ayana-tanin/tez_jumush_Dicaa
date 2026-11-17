/**
 * Конфигурация приложения
 * Централизованное управление настройками из переменных окружения
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://backendapptj-production.up.railway.app',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  MAX_RETRY_ATTEMPTS: parseInt(process.env.EXPO_PUBLIC_MAX_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(process.env.EXPO_PUBLIC_RETRY_DELAY) || 1000,
};

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.EXPO_PUBLIC_APP_NAME || 'Tez Jumush',
  VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
};

// Feature Flags
export const FEATURES = {
  OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  GOOGLE_AUTH: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === 'true',
  SMS_VERIFICATION: process.env.EXPO_PUBLIC_ENABLE_SMS_VERIFICATION === 'true',
  GEOLOCATION: process.env.EXPO_PUBLIC_ENABLE_GEOLOCATION === 'true',
};

// Debug Settings
export const DEBUG = {
  API_CALLS: process.env.EXPO_PUBLIC_DEBUG_API_CALLS === 'true',
  STORAGE: process.env.EXPO_PUBLIC_DEBUG_STORAGE === 'true',
  NAVIGATION: process.env.EXPO_PUBLIC_DEBUG_NAVIGATION === 'true',
};

// Sync Configuration
export const SYNC_CONFIG = {
  INTERVAL: parseInt(process.env.EXPO_PUBLIC_SYNC_INTERVAL) || 30000,
};

// Validation functions
export const isGoogleAuthConfigured = () => {
  const { Platform } = require('react-native');
  const clientId = Platform.OS === 'android' ? GOOGLE_CONFIG.ANDROID_CLIENT_ID :
                   Platform.OS === 'ios' ? GOOGLE_CONFIG.IOS_CLIENT_ID :
                   GOOGLE_CONFIG.WEB_CLIENT_ID;
  
  return clientId && 
         !clientId.includes('YOUR_') && 
         clientId.includes('.apps.googleusercontent.com') &&
         clientId !== 'your-android-client-id.apps.googleusercontent.com' &&
         clientId !== 'your-ios-client-id.apps.googleusercontent.com' &&
         clientId !== 'your-web-client-id.apps.googleusercontent.com';
};

export const isDevelopment = () => {
  return APP_CONFIG.ENVIRONMENT === 'development' || __DEV__;
};

export const isProduction = () => {
  return APP_CONFIG.ENVIRONMENT === 'production' && !__DEV__;
};

// Logging helper
export const log = (message, ...args) => {
  if (isDevelopment()) {
    console.log(`[${APP_CONFIG.NAME}]`, message, ...args);
  }
};

export const logError = (message, error) => {
  if (isDevelopment()) {
    console.error(`[${APP_CONFIG.NAME}] ERROR:`, message, error);
  }
};

// Export all configs as default
export default {
  API_CONFIG,
  GOOGLE_CONFIG,
  APP_CONFIG,
  FEATURES,
  DEBUG,
  SYNC_CONFIG,
  isGoogleAuthConfigured,
  isDevelopment,
  isProduction,
  log,
  logError,
};