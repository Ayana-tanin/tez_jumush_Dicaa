import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
/**
 * Открывающая страница выбора роли (КТО ВЫ?)
 * 
 * Файлы регистрации:
 * - При нажатии "Работник" → открывается: ./RegWorker.js
 *   (полный путь: AppTezJumush/frontend/src/screens/LoginAndRegistration/RegWorker.js)
 * 
 * - При нажатии "Работодатель" → открывается: ./RegestrationEmpl.js
 *   (полный путь: AppTezJumush/frontend/src/screens/LoginAndRegistration/RegestrationEmpl.js)
 */
import RegWorker from './RegWorker';
import RegestrationEmpl from './RegestrationEmpl';
import GoogleAuthService from '../../utils/googleAuth';

const { width, height } = Dimensions.get('window');

// Функция для вычисления возраста из даты рождения
const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  const [day, month, year] = birthDateStr.split('.').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function AuthScreen({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleRolePress = (role) => {
    setSelectedRole(role);
  };

  const handleRegistrationComplete = async (formData, role) => {
    setIsSaving(true);
    try {
      // Проверяем, есть ли данные пользователя
      const authStatus = await GoogleAuthService.checkAuthStatus();
      
      let userData;
      if (authStatus.isAuthenticated) {
        // Если пользователь авторизован, используем его данные
        userData = authStatus.user;
      } else {
        // Если пользователь не авторизован, создаем гостевой аккаунт
        userData = {
          id: `guest_${Date.now()}`,
          name: 'Гость',
          email: `guest_${Date.now()}@tezjumush.local`,
          isGuest: true,
        };
        
        // Сохраняем гостевой аккаунт
        await GoogleAuthService.saveUserData(userData, 'guest_token');
      }

      // Сохраняем данные анкеты в профиль пользователя
      const profileData = {
        ...userData,
        role: role,
        name: formData.name,
        phone: formData.phone,
        registrationCompleted: true,
      };

      // Добавляем поля в зависимости от роли
      if (role === 'employer') {
        profileData.workDistrict = formData.workDistrict;
        profileData.companyName = formData.companyName;
      } else if (role === 'worker') {
        profileData.birthDate = formData.birthDate;
        profileData.age = formData.birthDate ? calculateAge(formData.birthDate) : null;
        profileData.experience = formData.experience;
      }

      const result = await GoogleAuthService.updateProfile(profileData);
      
      if (result.success) {
        // Переходим к основному приложению
        if (onLogin) {
          onLogin(result.user, result.user.isGuest ? 'guest_token' : null);
        }
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось сохранить данные профиля');
      }
    } catch (error) {
      console.error('Error saving registration data:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить данные');
    } finally {
      setIsSaving(false);
    }
  };

  // Если выбрана роль, показываем соответствующую страницу регистрации
  if (selectedRole === 'employer') {
    return (
      <RegestrationEmpl 
        onContinue={(formData) => handleRegistrationComplete(formData, 'employer')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  if (selectedRole === 'worker') {
    return (
      <RegWorker 
        onContinue={(formData) => handleRegistrationComplete(formData, 'worker')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  // Показываем экран выбора роли
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background image */}
      <ImageBackground
        source={require('../../../assets/background/WHOyouALL.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* App Title - слева сверху */}
          <View style={styles.headerSection}>
            <Text style={styles.appTitle}>TEZ JUMUSH</Text>
          </View>

          {/* Question - КТО ВЫ? */}
          <Text style={styles.questionText}>КТО ВЫ?</Text>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.roleButton}
              onPress={() => handleRolePress('employer')}
              activeOpacity={0.7}
            >
              <Text style={styles.roleButtonText}>
                Работодатель
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleButton}
              onPress={() => handleRolePress('worker')}
              activeOpacity={0.7}
            >
              <Text style={styles.roleButtonText}>
                Работник
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
    margin: 0,
    padding: 0,
  },
  headerSection: {
    position: 'absolute',
    top: (75 / 812) * height, // Адаптивный top: 75px
    left: (22 / 375) * width, // Адаптивный left: 22px
    zIndex: 2,
  },
  appTitle: {
    fontSize: (36 / 812) * height, // Адаптивный размер
    fontWeight: 'Regular',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'PoetsenOne, sans-serif' : 'PoetsenOne',
    textTransform: 'uppercase',
  },
  questionText: {
    position: 'absolute',
    width: (104 / 375) * width, // width: 104px адаптивно
    height: (36 / 812) * height, // height: 36px адаптивно
    top: (300 / 812) * height, // top: 330px адаптивно
    left: (58 / 375) * width, // left: 58px адаптивно
    fontSize: (24 / 812) * height,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    position: 'absolute',
    top: (338 / 812) * height, // top: 368px адаптивно
    left: (53 / 375) * width, // left: 53px адаптивно
  },
  roleButton: {
    width: (285 / 375) * width, // width: 285px адаптивно
    height: (49 / 812) * height, // height: 49px адаптивно
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 0.3,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleButtonText: {
    fontSize: (16 / 812) * height,
    fontWeight: '600',
    color: '#6B6779',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
  },
});
