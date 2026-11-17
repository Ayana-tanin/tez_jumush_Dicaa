import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import CodeVerificationScreen from './CodeVerificationScreen';
import { fetchJsonWithTimeout } from '../../utils/fetchWithTimeout';

const { width, height } = Dimensions.get('window');

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  // Игнорируем старый недоступный IP
  if (envUrl && !envUrl.includes('192.168.79.121')) {
    return envUrl;
  }
  
  const LAPTOP_IP = '10.236.245.121';
  if (__DEV__) {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return `http://${LAPTOP_IP}:8000`;
    } else {
      return 'http://localhost:8000';
    }
  }
  return 'https://backendapptj-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();

export default function EmployerRegistration({ onContinue, onBack, onLogin }) {
  // ========== СОСТОЯНИЯ ==========
  const [showCodeVerification, setShowCodeVerification] = useState(false); // Экран ввода кода
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
  const [agreementAccepted, setAgreementAccepted] = useState(false); // Согласие с условиями
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    workDistrict: '',
    phone: '',
  });
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  // ========== ОБНОВЛЕНИЕ ПОЛЕЙ ==========
  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // ========== ВАЛИДАЦИЯ И ОТПРАВКА ==========
  const handleContinue = async () => {
    // Проверка согласия с условиями
    if (!agreementAccepted) {
      return Alert.alert('Ошибка', 'Необходимо согласиться с пользовательским соглашением');
    }
    
    // Проверка обязательных полей
    if (!form.name) return Alert.alert('Ошибка', 'Введите ФИО');
    if (!form.companyName) return Alert.alert('Ошибка', 'Введите организацию');
    if (!form.workDistrict) return Alert.alert('Ошибка', 'Введите район');
    if (!form.phone) return Alert.alert('Ошибка', 'Введите номер телефона');

    // Валидация телефона: только цифры, 10-15 символов, допускается +
    if (!/^\+?[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) {
      return Alert.alert('Ошибка', 'Некорректный номер телефона');
    }

    // Нормализуем номер телефона
    let phone = form.phone.replace(/\s/g, '').trim();
    
    // Нормализация номера
    if (!phone.startsWith('+')) {
      if (phone.startsWith('996')) {
        phone = `+${phone}`;
      } else if (phone.startsWith('0')) {
        phone = `+996${phone.substring(1)}`;
      } else if (phone.length === 9) {
        phone = `+996${phone}`;
      } else {
        // Пытаемся взять последние 9 цифр
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 9) {
          phone = `+996${digits.slice(-9)}`;
        } else {
          Alert.alert('Ошибка', 'Некорректный формат номера телефона');
          return;
        }
      }
    }

    // ОТКЛЮЧЕНО: Отправка SMS кода - пропускаем верификацию
    // setIsLoading(true);
    // try {
    //   console.log(`[DEBUG] Отправка SMS кода на ${phone}`);
    //   console.log(`[DEBUG] API URL: ${API_BASE_URL}/sms/send-code`);

    //   const data = await fetchJsonWithTimeout(
    //     `${API_BASE_URL}/sms/send-code`,
    //     {
    //       method: 'POST',
    //       body: JSON.stringify({
    //         phone: phone,
    //         channel: 'sms', // Только SMS
    //       }),
    //     },
    //     30000 // 30 секунд таймаут
    //   );

    //   console.log(`[DEBUG] Response data:`, data);
      
    //   // Обновляем номер в форме
    //   setForm(prev => ({ ...prev, phone: phone }));
    //   setShowCodeVerification(true);
    //   console.log('[DEBUG] Переход к экрану ввода кода');
    // } catch (error) {
    //   console.error('[ERROR] Ошибка отправки кода:', error);
    //   Alert.alert('Ошибка', error.message || 'Не удалось отправить код. Проверьте подключение к интернету и настройки backend.');
    // } finally {
    //   setIsLoading(false);
    // }

    // Пропускаем SMS верификацию и сразу переходим к приложению
    console.log('[DEBUG] SMS верификация отключена, переход к приложению');
    const finalForm = { ...form, phone: phone };
    onContinue?.({ ...finalForm, codeChannel: 'sms', phoneVerified: true });
  };

  const handleCodeVerified = () => {
    // После успешной верификации передаем данные дальше
    const finalForm = { ...form };
    if (!finalForm.phone.startsWith('+')) {
      let phone = finalForm.phone.replace(/\s/g, '').trim();
      if (phone.startsWith('996')) {
        phone = `+${phone}`;
      } else if (phone.startsWith('0')) {
        phone = `+996${phone.substring(1)}`;
      } else if (phone.length === 9) {
        phone = `+996${phone}`;
      }
      finalForm.phone = phone;
    }
    onContinue?.({ ...finalForm, codeChannel: 'sms', phoneVerified: true });
  };

  /* ========== ЭКРАН ВВОДА КОДА ========== */
  if (showCodeVerification) {
    return (
      <CodeVerificationScreen
        phone={form.phone}
        channel="sms"
        onVerified={handleCodeVerified}
        onBack={() => {
          setShowCodeVerification(false);
        }}
      />
    );
  }

  // ========== ЭКРАН РЕГИСТРАЦИИ (ФОРМА) ==========
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Кнопка назад (если передан onBack) */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      )}

      {/* Форма с поддержкой клавиатуры */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContentForm}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.formRoleBlock}>
              <Image
                source={require('../../../assets/icons/emoloyer.png')}
                style={styles.formIcon}
                resizeMode="contain"
              />
              <Text style={styles.role}>РАБОТОДАТЕЛЬ</Text>
            </View>

            {[
              ['ФИО', 'name', 'Фамилия имя'],
              ['Наименование вашей организации', 'companyName', 'Название организации'],
              ['Район работы', 'workDistrict', 'Район работы: Ленинский район'],
              ['Номер телефона', 'phone', '+996 XXX XXX XXX'],
            ].map(([label, field, placeholder]) => (
              <View key={field} style={styles.inputWrapper} ref={(ref) => inputRefs.current[field] = ref}>
                
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor="#999"
                  value={form[field]}
                  onChangeText={(t) => updateField(field, t)} // Синхронное обновление
                  keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                  onFocus={() => {
                    setTimeout(() => {
                      const inputRef = inputRefs.current[field];
                      if (inputRef && scrollViewRef.current) {
                        inputRef.measureLayout(
                          scrollViewRef.current,
                          (x, y) => {
                            scrollViewRef.current?.scrollTo({
                              y: y - 100,
                              animated: true,
                            });
                          },
                          () => {}
                        );
                      }
                    }, 100);
                  }}
                />
              </View>
            ))}

            {/* Чекбокс согласия с условиями */}
            <View style={styles.agreementContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreementAccepted(!agreementAccepted)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreementAccepted && styles.checkboxChecked]}>
                  {agreementAccepted && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  Я согласен с{' '}
                  <Text
                    style={styles.agreementLink}
                    onPress={() => {
                      WebBrowser.openBrowserAsync('https://policytj-production.up.railway.app/');
                    }}
                  >
                    пользовательским соглашением
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Кнопка отправки с защитой от повторного нажатия */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                (isLoading || !agreementAccepted) && { opacity: 0.6 }
              ]}
              onPress={handleContinue}
              disabled={isLoading || !agreementAccepted}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Продолжить</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {onLogin && (
    <TouchableOpacity
      style={styles.bottomLogin}
      onPress={onLogin}
      activeOpacity={0.7}
    >
      <Text style={styles.bottomLoginText}>Войти</Text>
    </TouchableOpacity>
  )}
    </View>
  );
}

/* ================= СТИЛИ ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
       
  /* СИНИЙ ФОН — НЕ УЧАСТВУЕТ В ВЕРСТКЕ */
  background: {
    position: 'absolute',
    top: height * 0.35, // 👈 начало волны как на фото
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* ОСНОВНОЙ КОНТЕНТ */
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.18, // 👈 визуальный центр
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 'Regular',
    letterSpacing: 2,
    marginBottom: 30,
    fontFamily:
      Platform.OS === 'web'
        ? 'PoetsenOne, sans-serif'
        : 'PoetsenOne',
  },

  roleBlock: {
    alignItems: 'center',
    marginBottom: 30,
  },

  icon: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },

  role: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  buttons: {
    width: '100%',
    marginTop: 10,
  },

  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#6B6779',
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  /* ФОРМА РЕГИСТРАЦИИ */
  scrollContentForm: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  formHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },

  formTitle: {
    fontSize: 32,
    fontWeight: 'Regular',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'PoetsenOne, sans-serif' : 'PoetsenOne',
    textTransform: 'uppercase',
    color: '#000',
  },

  formContainer: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginTop: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'center',
  },

  formRoleBlock: {
    alignItems: 'center',
    marginBottom: 60,
  },

  formIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },

  formRoleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  inputWrapper: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  input: {
    height: 49,
    borderRadius: 15,
    borderWidth: 0.3,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  continueButton: {
    backgroundColor: '#4A8FE7',
    paddingVertical: 18,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: '#4A8FE7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  /* Выбор канала кода */
  codeChoiceContent: {
    flex: 1,
    paddingTop: height * 0.22,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  codeChoiceText: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },

  bottomLogin: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  
  bottomLoginText: {
    fontSize: 14,
    color: '#4A8FE7',
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },
  agreementContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A8FE7',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4A8FE7',
    borderColor: '#4A8FE7',
  },
  agreementText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 20,
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },
  agreementLink: {
    color: '#4A8FE7',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});