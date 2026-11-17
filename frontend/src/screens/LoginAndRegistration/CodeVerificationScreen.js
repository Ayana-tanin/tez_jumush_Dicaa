import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  return 'http://backend:8000';
};

const API_BASE_URL = getApiBaseUrl();

export default function CodeVerificationScreen({ 
  phone, 
  channel, 
  onVerified, 
  onBack,
  onResend 
}) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Автофокус на первый input
  useEffect(() => {
    if (inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 100);
    }
  }, []);

  const handleCodeChange = (value, index) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Если вставлено несколько символов (например, из буфера)
      const digits = numericValue.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // Фокус на последний заполненный input
      const nextIndex = Math.min(index + digits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      // Автоматический переход к следующему полю
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      Alert.alert('Ошибка', 'Введите полный код подтверждения');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      console.log(`[DEBUG] Проверка кода для ${phone}: ${codeString}`);
      console.log(`[DEBUG] API URL: ${API_BASE_URL}/sms/verify-code`);

      const data = await fetchJsonWithTimeout(
        `${API_BASE_URL}/sms/verify-code`,
        {
          method: 'POST',
          body: JSON.stringify({
            phone: phone,
            code: codeString,
          }),
        },
        30000 // 30 секунд таймаут
      );

      console.log(`[DEBUG] Response data:`, data);

      // Проверяем успешную верификацию через Twilio Verify API
      if (data.verified === true) {
        console.log('[DEBUG] ✅ Код успешно подтвержден через Twilio Verify API');
        // Сразу вызываем onVerified без Alert, чтобы не прерывать flow
        onVerified?.();
      } else {
        // Обработка ошибок от Twilio Verify API
        const errorMessage = data.detail || data.message || 'Неверный код подтверждения';
        console.log(`[DEBUG] ❌ Ошибка проверки: ${errorMessage}`);
        Alert.alert('Ошибка', errorMessage);
        // Очищаем код при ошибке
        setCode(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('[ERROR] Ошибка проверки кода:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось проверить код. Проверьте подключение к интернету и настройки backend.');
      // Очищаем код при ошибке
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      console.log(`[DEBUG] Повторная отправка кода на ${phone} через ${channel}`);
      console.log(`[DEBUG] API URL: ${API_BASE_URL}/sms/send-code`);
      
      const data = await fetchJsonWithTimeout(
        `${API_BASE_URL}/sms/send-code`,
        {
          method: 'POST',
          body: JSON.stringify({
            phone: phone,
            channel: channel || 'sms',
          }),
        },
        30000 // 30 секунд таймаут
      );

      console.log(`[DEBUG] Response data:`, data);
      console.log('[DEBUG] ✅ Код успешно отправлен повторно через Twilio Verify API');
      Alert.alert('Успешно', 'Код подтверждения отправлен повторно');
      // Очищаем код
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error('[ERROR] Ошибка повторной отправки:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось отправить код. Проверьте подключение к интернету.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />

      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <Text style={styles.title}>Подтверждение номера</Text>
        
        <Text style={styles.subtitle}>
          Введите код подтверждения, отправленный на{'\n'}
          <Text style={styles.phone}>{phone}</Text>
          {'\n'}через {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, (isLoading || code.join('').length !== 6) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isLoading || code.join('').length !== 6}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Подтвердить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator color="#4A8FE7" size="small" />
          ) : (
            <Text style={styles.resendButtonText}>Отправить код повторно</Text>
          )}
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingTop: height * 0.15,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    fontFamily: Platform.OS === 'web' ? 'PoetsenOne, sans-serif' : 'PoetsenOne',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
  },
  phone: {
    fontWeight: 'bold',
    color: '#4A8FE7',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#fff',
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
  },
  codeInputFilled: {
    borderColor: '#4A8FE7',
    backgroundColor: '#F0F7FF',
  },
  verifyButton: {
    backgroundColor: '#4A8FE7',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 15,
    width: '100%',
    maxWidth: 320,
    marginBottom: 16,
    shadowColor: '#4A8FE7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
  },
  resendButton: {
    padding: 12,
  },
  resendButtonText: {
    color: '#4A8FE7',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
  },
});
