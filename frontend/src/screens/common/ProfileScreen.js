import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GoogleAuthService from '../../utils/googleAuth';
import PersonalDataScreen from './PersonalDataScreen';

export default function ProfileScreen({ onLogout }) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    // Обновляем данные при возврате на экран
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      if (authStatus.isAuthenticated && authStatus.user) {
        setUserData(authStatus.user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handlePersonalData = () => {
    navigation.navigate('PersonalData');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A8FE7" />
      </View>
    );
  }

  const role = userData?.role || '';
  const roleText = role === 'employer' ? 'Работодатель' : role === 'worker' ? 'Работник' : '';

  return (
    <ScrollView style={styles.container}>

      <View style={styles.content}>
        {/* Информация о пользователе */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#007AFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userData?.name || 'Пользователь'}</Text>
            <Text style={styles.userPhone}>{userData?.phone || '+996 XXX XXX XXX'}</Text>
            {roleText && <Text style={styles.userRole}>{roleText}</Text>}
          </View>
        </View>

        {/* Меню профиля */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handlePersonalData}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Личные данные</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Платежи</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Настройки</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Помощь</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Кнопка выхода */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Regular',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Regular',
  },
  userRole: {
    fontSize: 12,
    color: '#4A8FE7',
    marginTop: 4,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Medium',
  },
  dataSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Regular',
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Medium',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
  },
});