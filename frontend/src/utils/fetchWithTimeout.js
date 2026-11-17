/**
 * Утилита для безопасных fetch запросов с таймаутом, retry механизмом и обработкой ошибок
 */

const DEFAULT_TIMEOUT = 30000; // 30 секунд
const DEFAULT_MAX_RETRIES = 3; // Количество попыток
const DEFAULT_RETRY_DELAY = 1000; // Начальная задержка между попытками (1 секунда)

/**
 * Задержка перед следующей попыткой (экспоненциальная)
 * @param {number} attempt - Номер попытки (начиная с 0)
 * @param {number} baseDelay - Базовая задержка в миллисекундах
 * @returns {Promise<void>}
 */
const delay = (attempt, baseDelay = DEFAULT_RETRY_DELAY) => {
  const delayMs = baseDelay * Math.pow(2, attempt); // Экспоненциальная задержка: 1s, 2s, 4s
  return new Promise(resolve => setTimeout(resolve, delayMs));
};

/**
 * Проверяет, стоит ли повторять запрос при данной ошибке
 * @param {Error} error - Ошибка запроса
 * @returns {boolean}
 */
const shouldRetry = (error) => {
  // Повторяем при сетевых ошибках, таймаутах и ошибках 5xx
  if (error.name === 'AbortError' || 
      error.message === 'Network request failed' || 
      error.message === 'Failed to fetch' ||
      error.message.includes('timeout') ||
      error.message.includes('Превышено время ожидания')) {
    return true;
  }
  return false;
};

/**
 * Выполняет fetch запрос с таймаутом, retry механизмом и правильной обработкой ошибок
 * @param {string} url - URL для запроса
 * @param {object} options - Опции для fetch (method, headers, body и т.д.)
 * @param {number} timeout - Таймаут в миллисекундах (по умолчанию 30 секунд)
 * @param {number} maxRetries - Максимальное количество попыток (по умолчанию 3)
 * @returns {Promise<Response>} - Promise с Response объектом
 */
export const fetchWithTimeout = async (
  url, 
  options = {}, 
  timeout = DEFAULT_TIMEOUT,
  maxRetries = DEFAULT_MAX_RETRIES
) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        if (attempt < maxRetries) {
          console.log(`[TIMEOUT] Запрос к ${url} превысил таймаут ${timeout}ms (попытка ${attempt + 1}/${maxRetries + 1})`);
        }
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        // Если ответ успешный, возвращаем его
        if (response.ok || attempt === maxRetries) {
          if (attempt > 0) {
            console.log(`[SUCCESS] Запрос к ${url} успешен после ${attempt + 1} попыток`);
          }
          return response;
        }
        
        // Если ответ не успешный, но это последняя попытка, возвращаем ответ
        if (attempt === maxRetries) {
          return response;
        }
        
        // Для неуспешных ответов (не 5xx) не повторяем
        if (response.status < 500) {
          return response;
        }
        
        // Для 5xx ошибок создаем ошибку для retry
        throw new Error(`HTTP ${response.status}: Server error`);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      lastError = error;
      
      // Если это последняя попытка, выбрасываем ошибку
      if (attempt === maxRetries) {
        break;
      }
      
      // Проверяем, стоит ли повторять
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Ждем перед следующей попыткой
      if (attempt < maxRetries) {
        const delayMs = DEFAULT_RETRY_DELAY * Math.pow(2, attempt);
        console.log(`[RETRY] Повторная попытка ${attempt + 2}/${maxRetries + 1} через ${delayMs}ms для ${url}`);
        await delay(attempt);
      }
    }
  }
  
  // Обработка финальной ошибки
  if (lastError.name === 'AbortError') {
    console.error(`[ERROR] Запрос к ${url} был прерван после ${maxRetries + 1} попыток`);
    throw new Error(`Превышено время ожидания ответа от сервера (${timeout / 1000} сек). Проверьте, что backend запущен и доступен.`);
  }

  if (lastError.message === 'Network request failed' || lastError.message === 'Failed to fetch') {
    console.error(`[ERROR] Сетевая ошибка при запросе к ${url} после ${maxRetries + 1} попыток`);
    throw new Error('Не удалось подключиться к серверу после нескольких попыток. Проверьте:\n1. Запущен ли backend сервер\n2. Правильность IP адреса\n3. Подключение к интернету');
  }

  throw lastError;
};

/**
 * Выполняет fetch запрос с автоматическим парсингом JSON, retry механизмом и обработкой ошибок
 * @param {string} url - URL для запроса
 * @param {object} options - Опции для fetch
 * @param {number} timeout - Таймаут в миллисекундах
 * @param {number} maxRetries - Максимальное количество попыток
 * @returns {Promise<object>} - Promise с распарсенными данными
 */
export const fetchJsonWithTimeout = async (
  url, 
  options = {}, 
  timeout = DEFAULT_TIMEOUT,
  maxRetries = DEFAULT_MAX_RETRIES
) => {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }, timeout, maxRetries);

  // Пытаемся распарсить JSON
  let data;
  try {
    const text = await response.text();
    if (!text) {
      data = {};
    } else {
      data = JSON.parse(text);
    }
  } catch (parseError) {
    console.error(`[ERROR] Не удалось распарсить JSON ответ от ${url}:`, parseError);
    throw new Error(`Ошибка сервера: неверный формат ответа (HTTP ${response.status})`);
  }

  // Проверяем статус ответа
  if (!response.ok) {
    const errorMessage = data.detail || data.message || `HTTP ошибка: ${response.status}`;
    console.error(`[ERROR] Ошибка от ${url}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return data;
};

