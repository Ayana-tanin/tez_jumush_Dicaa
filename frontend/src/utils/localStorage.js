import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для хранения данных
const STORAGE_KEYS = {
  MY_TASKS: 'myTasks',
  ALL_TASKS: 'allTasks',
  APPLIED_TASKS: 'appliedTasks',
  TASK_APPLICATIONS: 'taskApplications',
};

// Сохранение данных в AsyncStorage
export const saveToStorage = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    console.log(`💾 Saved ${key} to storage:`, data.length, 'items');
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${key} to storage:`, error);
    return false;
  }
};

// Загрузка данных из AsyncStorage
export const loadFromStorage = async (key, defaultValue = []) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log(`📂 Loaded ${key} from storage:`, data.length, 'items');
      return data;
    }
    console.log(`📂 No data found for ${key}, using default`);
    return defaultValue;
  } catch (error) {
    console.error(`❌ Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

// Очистка всех данных
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    console.log('🗑️ All storage cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    return false;
  }
};

// Экспорт ключей для использования в других файлах
export { STORAGE_KEYS };

// Утилиты для работы с задачами
export const TaskStorage = {
  // Сохранить мои задачи
  saveMyTasks: async (tasks) => {
    return await saveToStorage(STORAGE_KEYS.MY_TASKS, tasks);
  },

  // Загрузить мои задачи
  loadMyTasks: async () => {
    return await loadFromStorage(STORAGE_KEYS.MY_TASKS, []);
  },

  // Сохранить все задачи
  saveAllTasks: async (tasks) => {
    return await saveToStorage(STORAGE_KEYS.ALL_TASKS, tasks);
  },

  // Загрузить все задачи
  loadAllTasks: async () => {
    return await loadFromStorage(STORAGE_KEYS.ALL_TASKS, []);
  },

  // Сохранить отклики
  saveAppliedTasks: async (tasks) => {
    return await saveToStorage(STORAGE_KEYS.APPLIED_TASKS, tasks);
  },

  // Загрузить отклики
  loadAppliedTasks: async () => {
    return await loadFromStorage(STORAGE_KEYS.APPLIED_TASKS, []);
  },

  // Сохранить заявки на задачи
  saveTaskApplications: async (applications) => {
    return await saveToStorage(STORAGE_KEYS.TASK_APPLICATIONS, applications);
  },

  // Загрузить заявки на задачи
  loadTaskApplications: async () => {
    return await loadFromStorage(STORAGE_KEYS.TASK_APPLICATIONS, []);
  },

  // Сохранить все данные сразу
  saveAllData: async (myTasks, allTasks, appliedTasks, taskApplications) => {
    const results = await Promise.all([
      TaskStorage.saveMyTasks(myTasks),
      TaskStorage.saveAllTasks(allTasks),
      TaskStorage.saveAppliedTasks(appliedTasks),
      TaskStorage.saveTaskApplications(taskApplications),
    ]);
    return results.every(result => result === true);
  },

  // Загрузить все данные сразу
  loadAllData: async () => {
    const [myTasks, allTasks, appliedTasks, taskApplications] = await Promise.all([
      TaskStorage.loadMyTasks(),
      TaskStorage.loadAllTasks(),
      TaskStorage.loadAppliedTasks(),
      TaskStorage.loadTaskApplications(),
    ]);

    return {
      myTasks,
      allTasks,
      appliedTasks,
      taskApplications,
    };
  },
};