import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'user_tasks';
const ALL_TASKS_KEY = 'all_tasks';

// Тестовые данные для всех задач
const defaultAllTasks = [
  {
    id: 1,
    title: 'Уборка квартиры',
    price: 5000,
    count_people: 2,
    date: '2024-09-15',
    time: '10:00',
    address: 'Бишкек, ул. Чуй 123',
    description: 'Нужна уборка 3-комнатной квартиры. Включить мытье окон, полов, санузла.',
    status: 'active',
    employer: 'Айгуль К.',
    rating: 4.8,
    phone: '+996555123456',
    created_at: '2024-09-10T10:00:00Z',
  },
  {
    id: 2,
    title: 'Посадка картофеля',
    price: 3000,
    count_people: 3,
    date: '2024-09-16',
    time: '08:00',
    address: 'Токмок, дачный участок',
    description: 'Помощь в посадке картофеля на дачном участке. Работа на свежем воздухе.',
    status: 'active',
    employer: 'Марат С.',
    rating: 4.5,
    phone: '+996777654321',
    created_at: '2024-09-11T08:00:00Z',
  },
];

// Тестовые данные для задач пользователя
const defaultUserTasks = [
  {
    id: 101,
    title: 'Ремонт крана',
    price: 2000,
    count_people: 1,
    date: '2024-09-20',
    time: '14:00',
    address: 'Бишкек, ул. Манаса 45',
    description: 'Нужно починить кран в ванной',
    status: 'active',
    applications: 3,
    created_at: '2024-09-12T14:00:00Z',
  },
  {
    id: 102,
    title: 'Перевозка мебели',
    price: 8000,
    count_people: 2,
    date: '2024-09-22',
    time: '09:00',
    address: 'Бишкек, мкр. Джал 12-15',
    description: 'Перевезти мебель из старой квартиры в новую',
    status: 'completed',
    applications: 7,
    created_at: '2024-09-13T09:00:00Z',
  },
];

class LocalTasksService {
  // Получить все задачи (для просмотра)
  async getAllTasks() {
    try {
      const tasks = await AsyncStorage.getItem(ALL_TASKS_KEY);
      if (tasks) {
        return JSON.parse(tasks);
      } else {
        // Если данных нет, сохраняем тестовые данные
        await AsyncStorage.setItem(ALL_TASKS_KEY, JSON.stringify(defaultAllTasks));
        return defaultAllTasks;
      }
    } catch (error) {
      console.error('Ошибка получения всех задач:', error);
      return defaultAllTasks;
    }
  }

  // Получить задачи пользователя
  async getUserTasks() {
    try {
      const tasks = await AsyncStorage.getItem(TASKS_KEY);
      if (tasks) {
        return JSON.parse(tasks);
      } else {
        // Если данных нет, сохраняем тестовые данные
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(defaultUserTasks));
        return defaultUserTasks;
      }
    } catch (error) {
      console.error('Ошибка получения задач пользователя:', error);
      return defaultUserTasks;
    }
  }

  // Добавить новую задачу пользователя
  async addUserTask(taskData) {
    try {
      const userTasks = await this.getUserTasks();
      const allTasks = await this.getAllTasks();
      
      const newTask = {
        ...taskData,
        id: Date.now(),
        status: 'active',
        applications: 0,
        created_at: new Date().toISOString(),
      };

      // Добавляем в задачи пользователя
      const updatedUserTasks = [newTask, ...userTasks];
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedUserTasks));

      // Добавляем в общий список задач
      const updatedAllTasks = [
        {
          ...newTask,
          employer: 'Вы',
          rating: 5.0,
          phone: '+996555000000',
        },
        ...allTasks
      ];
      await AsyncStorage.setItem(ALL_TASKS_KEY, JSON.stringify(updatedAllTasks));

      return newTask;
    } catch (error) {
      console.error('Ошибка добавления задачи:', error);
      throw error;
    }
  }

  // Удалить задачу пользователя
  async deleteUserTask(taskId) {
    try {
      const userTasks = await this.getUserTasks();
      const allTasks = await this.getAllTasks();
      
      // Удаляем из задач пользователя
      const updatedUserTasks = userTasks.filter(task => task.id !== taskId);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedUserTasks));

      // Удаляем из общего списка
      const updatedAllTasks = allTasks.filter(task => task.id !== taskId);
      await AsyncStorage.setItem(ALL_TASKS_KEY, JSON.stringify(updatedAllTasks));

      return true;
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      throw error;
    }
  }

  // Получить задачу по ID
  async getTaskById(taskId) {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.find(task => task.id === taskId);
    } catch (error) {
      console.error('Ошибка получения задачи по ID:', error);
      return null;
    }
  }

  // Очистить все данные (для отладки)
  async clearAllData() {
    try {
      await AsyncStorage.removeItem(TASKS_KEY);
      await AsyncStorage.removeItem(ALL_TASKS_KEY);
      console.log('Все данные очищены');
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
    }
  }
}

export default new LocalTasksService();