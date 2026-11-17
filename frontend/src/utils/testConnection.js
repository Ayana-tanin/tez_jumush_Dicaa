import { Platform } from 'react-native';

// Функция для тестирования подключения к API
export const testApiConnection = async () => {
  const possibleUrls = [
    'http://localhost:8000',
    'http://10.0.2.2:8000', // Android эмулятор
    'http://192.168.1.100:8000', // Замените на ваш IP
    'http://127.0.0.1:8000',
  ];

  console.log('Тестирование подключения к API...');
  
  for (const url of possibleUrls) {
    try {
      console.log(`Проверяем: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Успешное подключение к: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Не удалось подключиться к: ${url}`, error.message);
    }
  }
  
  console.log('❌ Не удалось подключиться ни к одному URL');
  return null;
};

// Функция для получения правильного API URL
export const getWorkingApiUrl = async () => {
  const workingUrl = await testApiConnection();
  
  if (workingUrl) {
    return workingUrl;
  }
  
  // Fallback к стандартным URL
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:8000';
  } else {
    return 'http://localhost:8000';
  }
};