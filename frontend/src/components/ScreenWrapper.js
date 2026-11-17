import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import GoogleAuthService from '../utils/googleAuth';

/**
 * Обертка для экранов, которая добавляет единый Header
 * BottomNavigation встроена в Tab Navigator и не нужна здесь
 * @param {React.Component} children - Дочерний компонент (экран)
 * @param {string} title - Заголовок экрана (опционально)
 * @param {boolean} showBack - Показывать ли кнопку "Назад"
 * @param {function} onNotificationPress - Обработчик нажатия на уведомления
 * @param {boolean} showHeader - Показывать ли Header (по умолчанию true)
 * @param {React.Component} rightComponent - Кастомный компонент справа в Header
 */
export default function ScreenWrapper({ 
  children, 
  title, 
  showBack = false,
  onNotificationPress,
  showHeader = true,
  rightComponent
}) {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      if (authStatus.isAuthenticated && authStatus.user) {
        setUserRole(authStatus.user.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <Header
          role={userRole}
          title={title}
          showBack={showBack}
          onNotificationPress={onNotificationPress}
          rightComponent={rightComponent}
        />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});

