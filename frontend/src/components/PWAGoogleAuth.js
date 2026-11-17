import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { PWA_CONFIG, getGoogleAuthUrl, getApiUrl } from '../config/pwa';

const PWAGoogleAuth = ({ onLogin, onError }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  // Google OAuth конфигурация для PWA
  const { GOOGLE, ENDPOINTS } = PWA_CONFIG;

  useEffect(() => {
    // Инициализация Google OAuth для веб-версии
    if (typeof window !== 'undefined') {
      loadGoogleScript();
    }
  }, []);

  const loadGoogleScript = () => {
    // Проверяем, не загружен ли уже скрипт
    if (window.gapi) {
      initializeGoogleAuth();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('auth2', initializeGoogleAuth);
    };
    script.onerror = () => {
      console.error('Failed to load Google API script');
      onError('Не удалось загрузить Google API');
    };
    document.head.appendChild(script);
  };

  const initializeGoogleAuth = () => {
    try {
      window.gapi.auth2.init({
        client_id: GOOGLE.CLIENT_ID,
        scope: GOOGLE.SCOPE
      }).then(() => {
        console.log('Google Auth initialized successfully');
      }).catch(error => {
        console.error('Google Auth initialization failed:', error);
        onError('Ошибка инициализации Google Auth');
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      onError('Ошибка инициализации Google Auth');
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    try {
      // Метод 1: Использование Google Auth2 API (рекомендуется)
      if (window.gapi && window.gapi.auth2) {
        handleGoogleAuth2SignIn();
      } else {
        // Метод 2: Fallback через всплывающее окно
        handlePopupSignIn();
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      setIsLoading(false);
      onError('Ошибка входа через Google');
    }
  };

  const handleGoogleAuth2SignIn = () => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    
    if (!authInstance) {
      setIsLoading(false);
      onError('Google Auth не инициализирован');
      return;
    }

    authInstance.signIn({
      scope: GOOGLE.SCOPE,
      ux_mode: 'popup'
    }).then(googleUser => {
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();
      
      const userData = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
        accessToken: authResponse.access_token,
        idToken: authResponse.id_token
      };

      // Отправляем данные на сервер для верификации
      authenticateWithServer(userData);
    }).catch(error => {
      console.error('Google Sign In failed:', error);
      setIsLoading(false);
      
      if (error.error === 'popup_closed_by_user') {
        // Пользователь закрыл окно - это не ошибка
        return;
      }
      
      onError('Ошибка входа через Google: ' + error.error);
    });
  };

  const handlePopupSignIn = () => {
    // Создаем URL для OAuth
    const authUrl = getGoogleAuthUrl();
    setAuthUrl(authUrl);
    setShowAuthModal(true);
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'AUTH_SUCCESS') {
        authenticateWithServer(data.userData);
      } else if (data.type === 'AUTH_ERROR') {
        setIsLoading(false);
        setShowAuthModal(false);
        onError(data.error || 'Ошибка аутентификации');
      } else if (data.type === 'AUTH_CANCELLED') {
        setIsLoading(false);
        setShowAuthModal(false);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const authenticateWithServer = async (userData) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.GOOGLE_AUTH), {
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
      
      setIsLoading(false);
      setShowAuthModal(false);
      
      // Сохраняем токен в localStorage для PWA
      if (typeof window !== 'undefined') {
        localStorage.setItem('userToken', result.access_token);
        localStorage.setItem('userData', JSON.stringify(result.user));
      }
      
      onLogin(result.user, result.access_token);
      
    } catch (error) {
      console.error('Server authentication failed:', error);
      setIsLoading(false);
      setShowAuthModal(false);
      onError('Ошибка аутентификации на сервере');
    }
  };

  const injectedJavaScript = `
    (function() {
      // Ждем загрузки страницы
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
      } else {
        initAuth();
      }
      
      function initAuth() {
      // Проверяем, если мы на странице callback
      if (window.location.href.includes('/auth/google/callback')) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
          
          if (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'AUTH_ERROR',
              error: error
            }));
            return;
          }
          
          if (code) {
            // Обмениваем код на токен
            exchangeCodeForToken(code);
          }
        }
      }
      
      function exchangeCodeForToken(code) {
        const clientId = '${GOOGLE.CLIENT_ID}';
        const redirectUri = '${GOOGLE.REDIRECT_URI}';
        
        fetch('${GOOGLE.TOKEN_URL}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.access_token) {
            // Получаем информацию о пользователе
            fetch(\`${GOOGLE.USER_INFO_URL}?access_token=\${data.access_token}\`)
              .then(response => response.json())
              .then(userInfo => {
                const userData = {
                  id: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                  accessToken: data.access_token,
                  idToken: data.id_token
                };
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'AUTH_SUCCESS',
                  userData: userData
                }));
              })
              .catch(error => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'AUTH_ERROR',
                  error: 'Failed to get user info'
                }));
              });
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'AUTH_ERROR',
              error: data.error || 'Failed to exchange code for token'
            }));
          }
        })
        .catch(error => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'AUTH_ERROR',
            error: 'Network error'
          }));
        });
      }
      
      // Обработка кнопки отмены
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cancel-auth')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'AUTH_CANCELLED'
          }));
        }
      });
    })();
  `;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.googleButtonText}>
          {isLoading ? 'Вход...' : 'Войти через Google'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAuthModal(false);
          setIsLoading(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Вход через Google</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAuthModal(false);
                  setIsLoading(false);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <WebView
              source={{ uri: authUrl }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
              injectedJavaScript={injectedJavaScript}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              onError={(error) => {
                console.error('WebView error:', error);
                setIsLoading(false);
                setShowAuthModal(false);
                onError('Ошибка загрузки страницы авторизации');
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButtonDisabled: {
    backgroundColor: '#ccc',
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
});

export default PWAGoogleAuth;
