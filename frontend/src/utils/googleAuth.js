import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from './api';

// Завершаем веб-браузер для корректной работы
WebBrowser.maybeCompleteAuthSession();

// Конфигурация Google OAuth из переменных окружения
const GOOGLE_CONFIG = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

// Проверяем, настроены ли Google Client ID
const isGoogleAuthConfigured = () => {
  const { Platform } = require('react-native');
  const clientId = Platform.OS === 'android' ? GOOGLE_CONFIG.androidClientId :
                   Platform.OS === 'ios' ? GOOGLE_CONFIG.iosClientId :
                   GOOGLE_CONFIG.webClientId;
  
  return clientId && !clientId.includes('YOUR_');
};

// Статическое описание endpoints Google (discovery)
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

class GoogleAuthService {
  constructor() {
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: 'tezjumush',
      path: 'redirect',
    });
  }

  // Получение конфигурации для текущей платформы
  getClientId() {
    const { Platform } = require('react-native');
    
    if (Platform.OS === 'android') {
      return GOOGLE_CONFIG.androidClientId;
    } else if (Platform.OS === 'ios') {
      return GOOGLE_CONFIG.iosClientId;
    } else {
      return GOOGLE_CONFIG.webClientId;
    }
  }

  // Создание AuthRequest (современный API expo-auth-session)
  createAuthRequest() {
    const clientId = this.getClientId();
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: this.redirectUri,
      extraParams: { nonce: this.generateNonce() },
    });
    return request;
  }

  // Генерация nonce для безопасности
  generateNonce() {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  // Основная функция входа через Google
  async signInWithGoogle() {
    try {
      console.log('🔐 Starting Google Sign In...');
      
      // Проверяем, настроен ли Google Auth
      if (!isGoogleAuthConfigured()) {
        console.warn('⚠️ Google Auth not configured properly');
        return {
          success: false,
          error: 'Google Auth не настроен. Проверьте переменные окружения EXPO_PUBLIC_GOOGLE_*_CLIENT_ID',
        };
      }
      
      // Создаем запрос авторизации
      const request = this.createAuthRequest();
      if (!request) throw new Error('Failed to create auth request');

      console.log('📱 Opening Google Auth...');

      // Показываем браузер авторизации
      const result = await request.promptAsync(GOOGLE_DISCOVERY);
      
      console.log('📥 Auth result:', result.type);
      
      if (result.type === 'success' && result.params && result.params.id_token) {
        console.log('✅ Google Auth successful');
        
        // Обмениваем Google ID токен на JWT нашего backend
        const backendResponse = await Api.makeRequest('/auth/google-auth', {
          method: 'POST',
          body: JSON.stringify({ token: result.params.id_token }),
        });

        const { access_token, user } = backendResponse;

        if (!access_token || !user) {
          throw new Error('Некорректный ответ сервера аутентификации');
        }

        // Сохраняем JWT и данные пользователя из backend
        await AsyncStorage.multiSet([
          ['userToken', access_token],
          ['userData', JSON.stringify(user)],
          ['loginMethod', 'google'],
        ]);

        return {
          success: true,
          user,
          token: access_token,
        };
      } else if (result.type === 'cancel') {
        console.log('❌ User cancelled Google Auth');
        return {
          success: false,
          error: 'User cancelled authentication',
        };
      } else {
        console.log('❌ Google Auth failed:', result.error || result.type);
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('❌ Google Sign In Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  // Парсинг ID токена для получения информации о пользователе
  parseIdToken(idToken) {
    try {
      // Декодируем JWT токен (простая реализация)
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Декодируем payload
      const payload = parts[1];
      const decoded = JSON.parse(
        Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      );

      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        givenName: decoded.given_name,
        familyName: decoded.family_name,
        emailVerified: decoded.email_verified,
      };
    } catch (error) {
      console.error('Error parsing ID token:', error);
      return null;
    }
  }

  // Сохранение данных пользователя
  async saveUserData(userInfo, token) {
    try {
      const userData = {
        ...userInfo,
        loginMethod: userInfo.isGuest ? 'guest' : 'google',
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userData', JSON.stringify(userData)],
        ['loginMethod', userInfo.isGuest ? 'guest' : 'google'],
      ]);

      console.log('💾 User data saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  // Получение сохраненных данных пользователя
  async getUserData() {
    try {
      const [token, userData] = await AsyncStorage.multiGet([
        'userToken',
        'userData',
      ]);

      if (token[1] && userData[1]) {
        return {
          token: token[1],
          user: JSON.parse(userData[1]),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Выход из аккаунта
  async signOut() {
    try {
      console.log('🚪 Signing out...');
      
      await AsyncStorage.multiRemove([
        'userToken',
        'userData',
        'loginMethod',
      ]);

      console.log('✅ Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  // Проверка статуса авторизации
  async checkAuthStatus() {
    try {
      const userData = await this.getUserData();
      
      if (userData && userData.token) {
        // Здесь можно добавить проверку валидности токена
        console.log('✅ User is authenticated:', userData.user.email || userData.user.name || 'Guest');
        return {
          isAuthenticated: true,
          user: userData.user,
          token: userData.token,
        };
      }

      console.log('❌ User is not authenticated');
      return {
        isAuthenticated: false,
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return {
        isAuthenticated: false,
        error: error.message,
      };
    }
  }

  // Обновление профиля пользователя
  async updateProfile(updates) {
    try {
      const userData = await this.getUserData();
      
      if (userData) {
        const updatedUser = {
          ...userData.user,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        console.log('✅ Profile updated successfully');
        return { success: true, user: updatedUser };
      }

      throw new Error('No user data found');
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }
}

// Экспортируем singleton
export default new GoogleAuthService();