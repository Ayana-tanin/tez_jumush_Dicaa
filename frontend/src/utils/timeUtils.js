/**
 * Утилиты для безопасной обработки времени
 */

/**
 * Безопасное форматирование времени
 * @param {string} timeString - строка времени в формате HH:MM или HH:MM:SS
 * @returns {string} отформатированное время или сообщение по умолчанию
 */
export const formatTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return 'Время не указано';
  }
  
  // Убираем лишние пробелы
  const cleanTime = timeString.trim();
  
  // Проверяем минимальную длину для HH:MM
  if (cleanTime.length < 5) {
    return 'Время не указано';
  }
  
  // Возвращаем первые 5 символов (HH:MM)
  return cleanTime.slice(0, 5);
};

/**
 * Форматирование диапазона времени
 * @param {string} timeFrom - время начала
 * @param {string} timeTo - время окончания
 * @returns {string} отформатированный диапазон времени
 */
export const formatTimeRange = (timeFrom, timeTo) => {
  const formattedFrom = formatTime(timeFrom);
  const formattedTo = formatTime(timeTo);
  
  // Если оба времени указаны и валидны
  if (formattedFrom !== 'Время не указано' && formattedTo !== 'Время не указано') {
    return `${formattedFrom} - ${formattedTo}`;
  }
  
  // Если указано только время начала
  if (formattedFrom !== 'Время не указано') {
    return `с ${formattedFrom}`;
  }
  
  // Если указано только время окончания
  if (formattedTo !== 'Время не указано') {
    return `до ${formattedTo}`;
  }
  
  // Если ничего не указано
  return 'Время не указано';
};

/**
 * Безопасное форматирование даты
 * @param {string|Date} dateInput - дата в любом формате
 * @param {object} options - опции форматирования
 * @returns {string} отформатированная дата
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) {
    return 'Дата не указана';
  }
  
  try {
    const date = new Date(dateInput);
    
    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      return 'Некорректная дата';
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return date.toLocaleDateString('ru-RU', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Ошибка форматирования даты';
  }
};

/**
 * Краткое форматирование даты
 * @param {string|Date} dateInput - дата в любом формате
 * @returns {string} дата в формате ДД.ММ.ГГГГ
 */
export const formatDateShort = (dateInput) => {
  return formatDate(dateInput, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Форматирование даты с днем недели
 * @param {string|Date} dateInput - дата в любом формате
 * @returns {string} дата с днем недели
 */
export const formatDateWithWeekday = (dateInput) => {
  return formatDate(dateInput, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Проверка валидности времени
 * @param {string} timeString - строка времени
 * @returns {boolean} true если время валидно
 */
export const isValidTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return false;
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString.trim());
};

/**
 * Проверка валидности даты
 * @param {string|Date} dateInput - дата
 * @returns {boolean} true если дата валидна
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Получение текущей даты в формате YYYY-MM-DD
 * @returns {string} текущая дата
 */
export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Получение текущего времени в формате HH:MM
 * @returns {string} текущее время
 */
export const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

/**
 * Вычисление продолжительности между двумя временами
 * @param {string} timeFrom - время начала
 * @param {string} timeTo - время окончания
 * @returns {string} продолжительность в часах и минутах
 */
export const calculateDuration = (timeFrom, timeTo) => {
  if (!isValidTime(timeFrom) || !isValidTime(timeTo)) {
    return 'Неизвестно';
  }
  
  const [fromHours, fromMinutes] = timeFrom.split(':').map(Number);
  const [toHours, toMinutes] = timeTo.split(':').map(Number);
  
  let fromTotalMinutes = fromHours * 60 + fromMinutes;
  let toTotalMinutes = toHours * 60 + toMinutes;
  
  // Если время окончания меньше времени начала, значит работа идет через полночь
  if (toTotalMinutes < fromTotalMinutes) {
    toTotalMinutes += 24 * 60; // Добавляем 24 часа
  }
  
  const durationMinutes = toTotalMinutes - fromTotalMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} мин`;
  } else if (minutes === 0) {
    return `${hours} ч`;
  } else {
    return `${hours} ч ${minutes} мин`;
  }
};

/**
 * Проверка, что дата не в прошлом
 * @param {string|Date} dateInput - дата для проверки
 * @returns {boolean} true если дата в будущем или сегодня
 */
export const isDateInFuture = (dateInput) => {
  if (!isValidDate(dateInput)) return false;
  
  const inputDate = new Date(dateInput);
  const today = new Date();
  
  // Сбрасываем время для корректного сравнения дат
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

export default {
  formatTime,
  formatTimeRange,
  formatDate,
  formatDateShort,
  formatDateWithWeekday,
  isValidTime,
  isValidDate,
  getCurrentDate,
  getCurrentTime,
  calculateDuration,
  isDateInFuture
};