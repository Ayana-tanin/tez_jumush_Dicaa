import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Определение API URL из переменных окружения
const getApiBaseUrl = () => {
  // Приоритет: переменная окружения (для production через EAS)
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  
  if (envUrl) {
    console.log('🌐 Using API URL from environment:', envUrl);
    return envUrl;
  }

  // Fallback для development (локальная разработка)
  // ВАЖНО: Для production используйте EXPO_PUBLIC_API_BASE_URL через EAS
  const LAPTOP_IP = '10.236.245.121';

  if (__DEV__) {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return `http://${LAPTOP_IP}:8000`;
    } else {
      return 'http://localhost:8000';
    }
  }

  // Production fallback (не должен использоваться, если настроен EXPO_PUBLIC_API_BASE_URL)
  console.warn('⚠️ EXPO_PUBLIC_API_BASE_URL not set, using default');
  return 'https://backendapptj-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000;
const DEBUG_API = process.env.EXPO_PUBLIC_DEBUG_API_CALLS === 'true';

// Всегда логируем базовую информацию о подключении
console.log('🌐 API Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   Platform:', Platform.OS);
console.log('   Timeout:', API_TIMEOUT, 'ms');
console.log('   Debug mode:', DEBUG_API ? 'ON' : 'OFF');

if (DEBUG_API) {
  console.log('🔧 Development mode:', __DEV__);
  console.log('📝 Environment URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'not set');
}

class ApiService {
  constructor() {
    // Кэш состояния подключения
    this.connectionCache = {
      isConnected: null,
      lastCheck: null,
      cacheDuration: 10000, // Кэшируем на 10 секунд
    };
  }

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Ошибка получения токена:', error);
      return null;
    }
  }

  // Проверка подключения к backend с кэшированием
  async checkConnection(forceCheck = false) {
    const now = Date.now();
    
    // Используем кэш, если он еще актуален и не требуется принудительная проверка
    if (!forceCheck && 
        this.connectionCache.isConnected !== null && 
        this.connectionCache.lastCheck && 
        (now - this.connectionCache.lastCheck) < this.connectionCache.cacheDuration) {
      if (DEBUG_API) {
        console.log(`📦 Using cached connection status: ${this.connectionCache.isConnected}`);
      }
      return this.connectionCache.isConnected;
    }

    try {
      console.log('🔍 Checking backend connection...');
      console.log(`🌐 API URL: ${API_BASE_URL}`);
      console.log(`📱 Platform: ${Platform.OS}`);
      
      const controller = new AbortController();
      // Увеличиваем таймаут до 10 секунд для более надежной проверки
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Connection check timeout after 10 seconds`);
        controller.abort();
      }, 10000); // 10 секунд для проверки
      
      // Пробуем сначала /health, если не работает - пробуем /tasks/
      let response;
      let usedEndpoint = '/health';
      try {
        console.log(`🔗 Trying ${API_BASE_URL}/health...`);
        response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        console.log(`✅ /health responded with status: ${response.status}`);
      } catch (healthError) {
        // Если /health недоступен, пробуем /tasks/ как fallback
        console.log(`⚠️ /health failed: ${healthError.message}`);
        console.log(`🔄 Trying fallback endpoint /tasks/...`);
        usedEndpoint = '/tasks/';
        try {
          response = await fetch(`${API_BASE_URL}/tasks/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          console.log(`✅ /tasks/ responded with status: ${response.status}`);
        } catch (tasksError) {
          console.log(`❌ /tasks/ also failed: ${tasksError.message}`);
          throw tasksError;
        }
      }
      
      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      
      // Обновляем кэш
      this.connectionCache.isConnected = isConnected;
      this.connectionCache.lastCheck = now;
      
      if (isConnected) {
        console.log(`✅ Backend connection successful: ${response.status} (used ${usedEndpoint})`);
      } else {
        console.log(`⚠️ Backend connection: ${response.status} (not OK, used ${usedEndpoint})`);
      }
      
      return isConnected;
    } catch (error) {
      // Обновляем кэш при ошибке
      this.connectionCache.isConnected = false;
      this.connectionCache.lastCheck = now;
      
      // Детальная диагностика ошибки
      console.log(`❌ Backend connection failed:`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Name: ${error.name}`);
      console.log(`   API URL: ${API_BASE_URL}`);
      console.log(`   Platform: ${Platform.OS}`);
      
      if (error.name === 'AbortError') {
        console.log(`   ⚠️ Request was aborted (timeout or cancelled)`);
        console.log(`   💡 Possible causes:`);
        console.log(`      - Backend server is not running`);
        console.log(`      - Wrong IP address (current: ${API_BASE_URL})`);
        console.log(`      - Firewall blocking connection`);
        console.log(`      - Network connectivity issues`);
        console.log(`   🔧 To fix:`);
        console.log(`      1. Check if backend is running: cd backend && python run.py`);
        console.log(`      2. Verify IP address: ipconfig (Windows) or ifconfig (Linux/Mac)`);
        console.log(`      3. Update .env file with correct EXPO_PUBLIC_API_BASE_URL`);
        console.log(`      4. Check firewall settings`);
      } else if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
        console.log(`   ⚠️ Network request failed`);
        console.log(`   💡 Possible causes:`);
        console.log(`      - Backend server is not running`);
        console.log(`      - Wrong IP address or port`);
        console.log(`      - Device and server are not on the same network`);
      }
      
      return false;
    }
  }

  // Сброс кэша подключения
  resetConnectionCache() {
    this.connectionCache.isConnected = null;
    this.connectionCache.lastCheck = null;
  }

  async makeRequest(endpoint, options = {}, retries = 3) {
    const token = await this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      method: options.method || 'GET',
      ...options,
    };

    // Удаляем method из body, если он там есть (он должен быть в корне config)
    if (config.body && typeof config.body === 'string') {
      // body уже строка, оставляем как есть
    } else if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (DEBUG_API) {
          console.log(`🌐 Making request to: ${API_BASE_URL}${endpoint} (attempt ${attempt + 1}/${retries + 1})`);
          console.log(`📤 Request config:`, { method: config.method, headers: config.headers });
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          if (DEBUG_API && attempt < retries) {
            console.log(`⏰ Request timeout after ${API_TIMEOUT / 1000} seconds, will retry...`);
          }
          controller.abort();
        }, API_TIMEOUT);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...config,
          signal: controller.signal,
        });

        if (DEBUG_API) {
          console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        }

        clearTimeout(timeoutId);

        // Если ответ успешный, возвращаем данные
        if (response.ok) {
          if (attempt > 0) {
            console.log(`✅ Request succeeded after ${attempt + 1} attempts`);
            // Сбрасываем кэш при успешном подключении
            this.connectionCache.isConnected = true;
            this.connectionCache.lastCheck = Date.now();
          }
          
          const data = await response.json().catch(() => ({}));
          return data;
        }

        // Для клиентских ошибок (4xx) не повторяем
        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Для серверных ошибок (5xx) повторяем
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Для других статусов возвращаем как есть
        const data = await response.json().catch(() => ({}));
        return data;

      } catch (error) {
        lastError = error;
        
        // Если это последняя попытка, выбрасываем ошибку
        if (attempt === retries) {
          break;
        }

        // Для клиентских ошибок (4xx) не повторяем
        if (error.message && error.message.includes('HTTP error! status: 4')) {
          throw error;
        }

        // Ждем перед следующей попыткой (экспоненциальная задержка)
        if (attempt < retries) {
          const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
          console.log(`🔄 Retrying request in ${delayMs}ms... (attempt ${attempt + 2}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // Обработка финальной ошибки
    console.error('API request failed after all retries:', lastError);

    if (lastError.name === 'AbortError') {
      // Сбрасываем кэш при таймауте
      this.resetConnectionCache();
      throw new Error('Превышено время ожидания запроса. Сервер не отвечает.');
    }

    if (lastError.message === 'Network request failed' || lastError.message === 'Failed to fetch') {
      // Сбрасываем кэш при сетевой ошибке
      this.resetConnectionCache();
      throw new Error('Backend недоступен. Запустите сервер командой: cd backend && python run.py');
    }

    if (lastError.message && lastError.message.includes('fetch')) {
      throw new Error('Не удается подключиться к серверу. Проверьте IP адрес в api.js');
    }

    // Обработка случая, когда error является объектом
    if (typeof lastError === 'object' && lastError.message) {
      throw new Error(lastError.message);
    }

    // Если error не является Error объектом
    if (typeof lastError === 'string') {
      throw new Error(lastError);
    }

    // Fallback для неизвестных ошибок
    throw new Error('Произошла неизвестная ошибка при выполнении запроса');
  }

  // Методы для работы с задачами
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getTasksNearby(lat, lon, radius = 5.0) {
    const params = { lat, lon, radius };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/tasks/nearby?${queryString}`);
  }

  async getTask(taskId) {
    return this.makeRequest(`/tasks/${taskId}`);
  }

  async createTask(taskData) {
    return this.makeRequest('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return this.makeRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Методы для работы с чатами
  async createChat(taskId, applicationId) {
    return this.makeRequest('/chats/', {
      method: 'POST',
      body: JSON.stringify({
        task_id: taskId,
        application_id: applicationId,
      }),
    });
  }

  async getChatByTaskApplication(taskId, applicationId) {
    const params = new URLSearchParams({ 
      task_id: taskId, 
      application_id: applicationId 
    });
    return this.makeRequest(`/chats/by-task-application?${params}`);
  }

  async getChatMessages(chatId) {
    return this.makeRequest(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId, text) {
    return this.makeRequest(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export default new ApiService();