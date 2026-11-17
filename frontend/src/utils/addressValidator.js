/**
 * Утилита для проверки существования адреса в картах 2GIS
 * Проверяет, что адрес действительно существует в Бишкеке/Чуйской области
 */

const API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

/**
 * Проверяет существование адреса через 2GIS API
 * @param {string} address - адрес для проверки
 * @returns {Promise<Object>} - результат проверки с координатами или ошибкой
 */
export async function validateAddress(address) {
  try {
    if (!address || !address.trim()) {
      return {
        isValid: false,
        error: 'Адрес не может быть пустым'
      };
    }

    const trimmedAddress = address.trim();
    
    // Добавляем "Бишкек" к запросу для более точного поиска
    const searchQuery = trimmedAddress.includes('Бишкек') 
      ? trimmedAddress 
      : `${trimmedAddress} Бишкек`;

    const url = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(searchQuery)}&fields=items.point,items.full_name,items.name,items.address&key=${API_KEY}`;

    console.log('Проверяем адрес:', searchQuery);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const items = data?.result?.items || [];

    if (items.length === 0) {
      return {
        isValid: false,
        error: 'Адрес не найден в картах. Проверьте правильность написания.',
        suggestions: await getAddressSuggestions(trimmedAddress)
      };
    }

    // Берем первый результат (наиболее релевантный)
    const result = items[0];
    const coordinates = result.point;

    if (!coordinates) {
      return {
        isValid: false,
        error: 'Не удалось определить координаты для этого адреса'
      };
    }

    // Проверяем, что адрес находится в пределах Бишкека/Чуйской области
    const isWithinBounds = checkBounds(coordinates.lat, coordinates.lon);
    
    if (!isWithinBounds) {
      return {
        isValid: false,
        error: 'Адрес находится за пределами Бишкека/Чуйской области'
      };
    }

    // Возвращаем валидный результат
    return {
      isValid: true,
      address: result.full_name || result.name,
      originalAddress: trimmedAddress,
      coordinates: {
        latitude: coordinates.lat,
        longitude: coordinates.lon
      },
      confidence: calculateConfidence(result, trimmedAddress)
    };

  } catch (error) {
    console.error('Ошибка проверки адреса:', error);
    return {
      isValid: false,
      error: 'Ошибка проверки адреса. Проверьте подключение к интернету.',
      isNetworkError: true
    };
  }
}

/**
 * Получает предложения адресов для похожих запросов
 * @param {string} address - исходный адрес
 * @returns {Promise<Array>} - массив предложений
 */
async function getAddressSuggestions(address) {
  try {
    const suggestions = [];
    
    // Популярные места в Бишкеке для предложений
    const popularPlaces = [
      'Чуй проспект',
      'Ала-Тоо площадь', 
      'Токтогула улица',
      'Дордой рынок',
      'Ошский рынок',
      'Центральный парк',
      'Манаса проспект',
      'Советская улица',
      'Московская улица',
      'Абдрахманова улица'
    ];

    // Фильтруем места, которые содержат часть введенного адреса
    const filteredPlaces = popularPlaces.filter(place => 
      place.toLowerCase().includes(address.toLowerCase()) ||
      address.toLowerCase().includes(place.toLowerCase())
    );

    return filteredPlaces.slice(0, 3);
  } catch (error) {
    console.error('Ошибка получения предложений:', error);
    return [];
  }
}

/**
 * Проверяет, находится ли точка в пределах Бишкека/Чуйской области
 * @param {number} lat - широта
 * @param {number} lon - долгота
 * @returns {boolean}
 */
function checkBounds(lat, lon) {
  // Примерные границы Бишкека/Чуйской области
  const MIN_LAT = 42.6;   // южная граница
  const MAX_LAT = 43.2;   // северная граница  
  const MIN_LON = 74.2;   // западная граница
  const MAX_LON = 74.9;   // восточная граница
  
  return lat >= MIN_LAT && lat <= MAX_LAT && lon >= MIN_LON && lon <= MAX_LON;
}

/**
 * Вычисляет уверенность в правильности найденного адреса
 * @param {Object} result - результат поиска от 2GIS
 * @param {string} originalAddress - исходный адрес
 * @returns {number} - уровень уверенности от 0 до 1
 */
function calculateConfidence(result, originalAddress) {
  const foundAddress = (result.full_name || result.name || '').toLowerCase();
  const original = originalAddress.toLowerCase();
  
  // Простая проверка совпадения слов
  const originalWords = original.split(/\s+/);
  const foundWords = foundAddress.split(/\s+/);
  
  let matches = 0;
  originalWords.forEach(word => {
    if (word.length > 2 && foundWords.some(foundWord => 
      foundWord.includes(word) || word.includes(foundWord)
    )) {
      matches++;
    }
  });
  
  return Math.min(matches / Math.max(originalWords.length, 1), 1);
}

/**
 * Быстрая проверка формата адреса (без API запроса)
 * @param {string} address - адрес для проверки
 * @returns {Object} - результат проверки
 */
export function quickAddressValidation(address) {
  if (!address || !address.trim()) {
    return {
      isValid: false,
      error: 'Адрес не может быть пустым'
    };
  }

  const trimmed = address.trim();
  
  // Минимальная длина адреса
  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Адрес слишком короткий'
    };
  }

  // Проверяем наличие цифр (номера дома)
  const hasNumbers = /\d/.test(trimmed);
  if (!hasNumbers) {
    return {
      isValid: false,
      error: 'Укажите номер дома или здания'
    };
  }

  return {
    isValid: true,
    message: 'Формат адреса корректен'
  };
}

/**
 * Объединяет быструю и полную проверку адреса
 * @param {string} address - адрес для проверки
 * @param {boolean} fullValidation - делать ли полную проверку через API
 * @returns {Promise<Object>} - результат проверки
 */
export async function validateAddressComplete(address, fullValidation = true) {
  // Сначала быстрая проверка
  const quickResult = quickAddressValidation(address);
  if (!quickResult.isValid) {
    return quickResult;
  }

  // Если нужна полная проверка, делаем API запрос
  if (fullValidation) {
    return await validateAddress(address);
  }

  return quickResult;
}
