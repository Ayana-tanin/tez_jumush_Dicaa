import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Единый компонент Header для всех экранов
 * @param {string} role - 'employer' или 'worker'
 * @param {string} title - Заголовок экрана (опционально)
 * @param {function} onNotificationPress - Обработчик нажатия на уведомления
 * @param {boolean} showBack - Показывать ли кнопку "Назад"
 */
export default function Header({ 
  role, 
  title, 
  onNotificationPress, 
  showBack = false,
  rightComponent 
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {/* Логотип */}
        <Text style={styles.logo}>TEZ JUMUSH</Text>

        {/* Уведомления */}
        <TouchableOpacity
          onPress={onNotificationPress || (() => {})}
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={26} color="#0A090E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EDF5',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 36,
    fontWeight: '400',
    color: '#0A090E',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'web'
      ? 'PoetsenOne, sans-serif'
      : 'PoetsenOne',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
