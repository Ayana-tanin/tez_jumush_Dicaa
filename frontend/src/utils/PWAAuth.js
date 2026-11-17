// PWA Authentication utilities
import { PWA_CONFIG, getApiUrl } from '../config/pwa';

class PWAAuth {
  constructor() {
    this.isInitialized = false;
    this.googleAuth = null;
  }

  // Инициализация Google Auth для PWA
  async initializeGoogleAuth() {
    if (this.isInitialized) {
      return this.googleAuth;
    }

    try {
      // Загружаем Google API если не загружен
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Инициализируем Google Auth
      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: PWA_CONFIG.GOOGLE.CLIENT_ID,
          scope: PWA_CONFIG.GOOGLE.SCOPE
        }).then((authInstance) => {
            this.googleAuth = authInstance;
            this.isInitialized = true;
            resolve(authInstance);
          }).catch(reject);
        });
      });

      return this.googleAuth;
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      throw error;
    }
  }

  // Загрузка Google API
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Вход через Google с всплывающим окном
  async signInWithGoogle() {
    try {
      const authInstance = await this.initializeGoogleAuth();
      
      const googleUser = await authInstance.signIn({
        ux_mode: 'popup',
        scope: PWA_CONFIG.GOOGLE.SCOPE
      });

      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();

      return {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
        accessToken: authResponse.access_token,
        idToken: authResponse.id_token,
        expiresAt: authResponse.expires_at
      };
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  }

  // Вход через Google с редиректом
  async signInWithGoogleRedirect() {
    try {
      const authInstance = await this.initializeGoogleAuth();
      
      return authInstance.signIn({
        ux_mode: 'redirect'
      });
    } catch (error) {
      console.error('Google Sign In redirect failed:', error);
      throw error;
    }
  }

  // Получение текущего пользователя
  async getCurrentUser() {
    try {
      const authInstance = await this.initializeGoogleAuth();
      const googleUser = authInstance.currentUser.get();
      
      if (!googleUser.isSignedIn()) {
        return null;
      }

      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();

      return {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
        accessToken: authResponse.access_token,
        idToken: authResponse.id_token,
        expiresAt: authResponse.expires_at
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Выход из Google
  async signOut() {
    try {
      const authInstance = await this.initializeGoogleAuth();
      await authInstance.signOut();
      
      // Очищаем локальное хранилище
      this.clearLocalStorage();
      
      return true;
    } catch (error) {
      console.error('Google Sign Out failed:', error);
      throw error;
    }
  }

  // Проверка статуса аутентификации
  async checkAuthStatus() {
    try {
      // Проверяем localStorage
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Проверяем, не истек ли токен
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
          this.clearLocalStorage();
          return { isAuthenticated: false, user: null };
        }
        
        return { isAuthenticated: true, user };
      }

      // Проверяем Google Auth
      const googleUser = await this.getCurrentUser();
      if (googleUser) {
        // Сохраняем в localStorage
        this.saveToLocalStorage(googleUser);
        return { isAuthenticated: true, user: googleUser };
      }

      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Auth status check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Сохранение в localStorage
  saveToLocalStorage(userData) {
    try {
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 часа
      
      localStorage.setItem('userToken', userData.idToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Очистка localStorage
  clearLocalStorage() {
    try {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenExpiresAt');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Аутентификация на сервере
  async authenticateWithServer(userData) {
    try {
      const response = await fetch(getApiUrl(PWA_CONFIG.ENDPOINTS.GOOGLE_AUTH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userData.idToken,
          userData: userData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Сохраняем серверный токен
      localStorage.setItem('serverToken', result.access_token);
      
      return result;
    } catch (error) {
      console.error('Server authentication failed:', error);
      throw error;
    }
  }

  // Обновление токена
  async refreshToken() {
    try {
      const authInstance = await this.initializeGoogleAuth();
      const googleUser = authInstance.currentUser.get();
      
      if (!googleUser.isSignedIn()) {
        throw new Error('User not signed in');
      }

      await googleUser.reloadAuthResponse();
      const authResponse = googleUser.getAuthResponse();
      
      // Обновляем в localStorage
      const userData = await this.getCurrentUser();
      this.saveToLocalStorage(userData);
      
      return userData;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Проверка поддержки PWA функций
  static checkPWASupport() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      installPrompt: 'onbeforeinstallprompt' in window,
      webShare: 'share' in navigator,
      webShareTarget: 'serviceWorker' in navigator && 'share' in navigator
    };
  }

  // Получение информации о PWA
  static getPWAInfo() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
    
    return {
      isStandalone,
      isPWA: isStandalone || ('serviceWorker' in navigator),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };
  }
}

// Создаем singleton instance
const pwaAuth = new PWAAuth();

export default pwaAuth;
export { PWAAuth };
