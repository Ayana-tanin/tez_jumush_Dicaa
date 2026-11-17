import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleAuthService from '../utils/googleAuth';

export default function UserProfileScreen({ navigation, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      
      if (authStatus.isAuthenticated) {
        setUserData(authStatus.user);
        setEditedName(authStatus.user.name || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    try {
      const result = await GoogleAuthService.updateProfile({
        name: editedName.trim(),
      });

      if (result.success) {
        setUserData(result.user);
        setIsEditing(false);
        Alert.alert('Успешно', 'Профиль обновлен');
      } else {
        Alert.alert('Ошибка', result.error);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            try {
              await GoogleAuthService.signOut();
              onLogout();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
            }
          }
        }
      ]
    );
  };

  const getLoginMethodText = () => {
    if (userData?.isGuest) return 'Гостевой режим';
    if (userData?.isTest) return 'Тестовый аккаунт';
    return 'Google аккаунт';
  };

  const getLoginMethodIcon = () => {
    if (userData?.isGuest) return 'person-outline';
    if (userData?.isTest) return 'flask-outline';
    return 'logo-google';
  };

  const getLoginMethodColor = () => {
    if (userData?.isGuest) return '#666';
    if (userData?.isTest) return '#FF9500';
    return '#4285F4';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Ошибка загрузки профиля</Text>
        <TouchableOpacity onPress={loadUserData}>
          <Text style={styles.retryText}>Попробовать еще раз</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "close" : "pencil"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {userData.picture ? (
              <Image source={{ uri: userData.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Введите имя"
                maxLength={50}
              />
            ) : (
              <Text style={styles.userName}>{userData.name}</Text>
            )}
          </View>

          {/* Email */}
          <Text style={styles.userEmail}>{userData.email}</Text>

          {/* Login Method */}
          <View style={styles.loginMethodContainer}>
            <Ionicons 
              name={getLoginMethodIcon()} 
              size={16} 
              color={getLoginMethodColor()} 
            />
            <Text style={[styles.loginMethodText, { color: getLoginMethodColor() }]}>
              {getLoginMethodText()}
            </Text>
          </View>

          {/* Save Button (when editing) */}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Questionnaire Data */}
        {userData.registrationCompleted && (() => {
          const questionnaireItems = [];
          
          if (userData.role) {
            questionnaireItems.push({
              icon: 'person-circle-outline',
              label: 'Роль',
              value: userData.role === 'employer' ? 'Работодатель' : 'Работник',
            });
          }
          
          if (userData.age) {
            questionnaireItems.push({
              icon: 'calendar-outline',
              label: 'Возраст',
              value: `${userData.age} лет`,
            });
          }
          
          if (userData.experience) {
            questionnaireItems.push({
              icon: 'briefcase-outline',
              label: 'Опыт работы',
              value: userData.experience,
            });
          }
          
          if (userData.district) {
            questionnaireItems.push({
              icon: 'location-outline',
              label: 'Район проживания',
              value: userData.district,
            });
          }
          
          if (userData.phone) {
            questionnaireItems.push({
              icon: 'call-outline',
              label: 'Телефон',
              value: userData.phone,
            });
          }
          
          return (
            <View style={styles.questionnaireContainer}>
              <Text style={styles.sectionTitle}>Анкета</Text>
              
              <View style={styles.questionnaireCard}>
                {questionnaireItems.map((item, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.questionnaireItem,
                      index === questionnaireItems.length - 1 && styles.questionnaireItemLast
                    ]}
                  >
                    <Ionicons name={item.icon} size={20} color="#007AFF" />
                    <View style={styles.questionnaireItemContent}>
                      <Text style={styles.questionnaireLabel}>{item.label}</Text>
                      <Text style={styles.questionnaireValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="briefcase" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Созданных задач</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Выполненных</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statNumber}>5.0</Text>
              <Text style={styles.statLabel}>Рейтинг</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Уведомления</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Приватность</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Помощь</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: '#007AFF',
    marginTop: 10,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 5,
    minWidth: 200,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  loginMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  loginMethodText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
  },
  questionnaireContainer: {
    marginBottom: 20,
  },
  questionnaireCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionnaireItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionnaireItemLast: {
    borderBottomWidth: 0,
  },
  questionnaireItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  questionnaireLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  questionnaireValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});