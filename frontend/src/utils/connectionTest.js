// Утилита для тестирования подключения к API
import ApiService from './api';

export const testApiConnection = async () => {
  console.log('🔍 Testing API connection...');
  
  try {
    // Проверяем базовое подключение
    const isConnected = await ApiService.checkConnection();
    
    if (isConnected) {
      console.log('✅ API connection successful');
      
      // Пробуем получить список задач
      try {
        const tasks = await ApiService.getTasks();
        console.log('✅ Tasks API working, found', tasks.length, 'tasks');
        return { success: true, message: 'API полностью функционален' };
      } catch (error) {
        console.log('⚠️ Tasks API error:', error.message);
        return { success: false, message: 'API доступен, но есть проблемы с задачами' };
      }
    } else {
      return { success: false, message: 'Backend недоступен' };
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return { success: false, message: error.message };
  }
};

export const testTaskCreation = async (testTaskData) => {
  console.log('🧪 Testing task creation...');
  
  try {
    const result = await ApiService.createTask(testTaskData);
    console.log('✅ Task creation successful:', result);
    return { success: true, task: result };
  } catch (error) {
    console.log('❌ Task creation failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Тестовые данные для проверки
export const getTestTaskData = () => ({
  title: 'Тестовая задача API',
  description: 'Проверка подключения к базе данных',
  price: 1000,
  count_people: 1,
  date: new Date().toISOString().split('T')[0],
  time_from: '10:00',
  time_to: '12:00',
  address: 'Тестовый адрес'
});