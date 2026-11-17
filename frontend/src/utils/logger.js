import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_STORAGE_KEY = '@app_logs';
const MAX_LOGS = 1000; // Максимальное количество логов

class Logger {
  constructor() {
    this.logs = [];
    this.isProduction = !__DEV__;
    this.loadLogs();
  }

  // Загрузка логов из хранилища
  async loadLogs() {
    try {
      const storedLogs = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  // Сохранение логов в хранилище
  async saveLogs() {
    try {
      // Ограничиваем количество логов
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }

  // Добавление лога
  addLog(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data) : null,
    };

    this.logs.push(logEntry);
    
    // В development также выводим в консоль
    if (!this.isProduction) {
      const logMethod = console[level] || console.log;
      logMethod(`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // Сохраняем асинхронно
    this.saveLogs();
  }

  // Методы для разных уровней логирования
  info(message, data) {
    this.addLog('info', message, data);
  }

  warn(message, data) {
    this.addLog('warn', message, data);
  }

  error(message, data) {
    this.addLog('error', message, data);
  }

  debug(message, data) {
    this.addLog('debug', message, data);
  }

  // Получение всех логов
  async getAllLogs() {
    await this.loadLogs();
    return this.logs;
  }

  // Получение логов по уровню
  async getLogsByLevel(level) {
    await this.loadLogs();
    return this.logs.filter(log => log.level === level);
  }

  // Получение последних логов
  async getRecentLogs(count = 50) {
    await this.loadLogs();
    return this.logs.slice(-count);
  }

  // Очистка логов
  async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem(LOG_STORAGE_KEY);
  }

  // Экспорт логов в текстовом формате
  async exportLogs() {
    await this.loadLogs();
    return this.logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.data ? ` | Data: ${log.data}` : ''}`
    ).join('\n');
  }

  // Получение статистики логов
  async getLogStats() {
    await this.loadLogs();
    const stats = {
      total: this.logs.length,
      info: 0,
      warn: 0,
      error: 0,
      debug: 0,
    };

    this.logs.forEach(log => {
      if (stats[log.level] !== undefined) {
        stats[log.level]++;
      }
    });

    return stats;
  }
}

// Экспортируем singleton
export default new Logger();