// Сервис синхронизации для получения откликов от других пользователей
import ApiService from './api';

class SyncService {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.lastSyncTime = null;
    this.syncCallbacks = [];
  }

  // Запуск автоматической синхронизации
  startSync(intervalMs = 30000) { // 30 секунд по умолчанию
    if (this.isRunning) {
      console.log('🔄 Sync already running');
      return;
    }

    console.log('🚀 Starting sync service...');
    this.isRunning = true;
    
    // Первая синхронизация сразу
    this.performSync();
    
    // Затем по интервалу
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);
  }

  // Остановка синхронизации
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Sync service stopped');
  }

  // Добавить callback для уведомлений о новых данных
  addSyncCallback(callback) {
    this.syncCallbacks.push(callback);
  }

  // Удалить callback
  removeSyncCallback(callback) {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  // Выполнить синхронизацию
  async performSync() {
    try {
      console.log('🔄 Performing sync...');
      
      // Проверяем подключение к backend (используем кэш, не принуждаем проверку)
      const isConnected = await ApiService.checkConnection(false);
      if (!isConnected) {
        console.log('❌ Backend not available for sync (using cached status)');
        // Не выбрасываем ошибку, просто пропускаем синхронизацию
        // Это позволяет приложению продолжать работать офлайн
        return;
      }

      // Получаем новые данные с сервера
      const syncData = await this.fetchUpdates();
      
      if (syncData.hasUpdates) {
        console.log('📥 New data received:', syncData);
        
        // Уведомляем всех подписчиков о новых данных
        this.syncCallbacks.forEach(callback => {
          try {
            callback(syncData);
          } catch (error) {
            console.error('Error in sync callback:', error);
          }
        });
      }
      
      this.lastSyncTime = new Date();
      console.log('✅ Sync completed successfully');
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message || error);
      // Не прерываем работу при ошибке синхронизации
      // Приложение должно продолжать работать в офлайн режиме
    }
  }

  // Получить обновления с сервера
  async fetchUpdates() {
    try {
      // Получаем все задачи (с автоматическим retry в ApiService)
      const allTasks = await ApiService.getTasks().catch(error => {
        console.warn('Failed to fetch tasks during sync:', error.message);
        return [];
      });
      
      // Получаем заявки на мои задачи (если API поддерживает)
      // const myApplications = await ApiService.getMyTaskApplications();
      
      // Моковые данные отключены - используем только реальные данные с сервера
      // const mockNewApplications = this.generateMockApplications();
      
      return {
        hasUpdates: allTasks && allTasks.length > 0,
        newTasks: allTasks || [],
        newApplications: [], // Отключены моковые заявки
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error fetching updates:', error.message || error);
      // Возвращаем пустой результат вместо выбрасывания ошибки
      return { 
        hasUpdates: false,
        newTasks: [],
        newApplications: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Генерация моковых заявок отключена
  // generateMockApplications() {
  //   // Функция отключена - больше не генерируем моковые заявки
  //   return [];
  // }

  // Принудительная синхронизация
  async forcSync() {
    console.log('🔄 Force sync requested');
    await this.performSync();
  }

  // Получить статус синхронизации
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      interval: this.syncInterval ? 30000 : null
    };
  }
}

// Экспортируем singleton
export default new SyncService();