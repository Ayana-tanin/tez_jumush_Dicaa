// Простая версия без AsyncStorage для отладки
class DebugLocalTasksService {
  constructor() {
    // Храним данные в памяти
    this.allTasks = [
      {
        id: 1,
        title: 'Уборка квартиры',
        price: 5000,
        count_people: 2,
        date: '2024-09-15',
        time: '10:00',
        address: 'Бишкек, ул. Чуй 123',
        description: 'Нужна уборка 3-комнатной квартиры',
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
        description: 'Помощь в посадке картофеля',
        status: 'active',
        employer: 'Марат С.',
        rating: 4.5,
        phone: '+996777654321',
        created_at: '2024-09-11T08:00:00Z',
      },
    ];

    this.userTasks = [
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
    ];
  }

  // Получить все задачи (для просмотра)
  async getAllTasks() {
    console.log('DebugLocalTasksService: getAllTasks called');
    return Promise.resolve([...this.allTasks]);
  }

  // Получить задачи пользователя
  async getUserTasks() {
    console.log('DebugLocalTasksService: getUserTasks called');
    return Promise.resolve([...this.userTasks]);
  }

  // Добавить новую задачу пользователя
  async addUserTask(taskData) {
    console.log('DebugLocalTasksService: addUserTask called with:', taskData);
    
    try {
      const newTask = {
        ...taskData,
        id: Date.now(),
        status: 'active',
        applications: 0,
        created_at: new Date().toISOString(),
      };

      // Добавляем в задачи пользователя
      this.userTasks.unshift(newTask);

      // Добавляем в общий список задач
      const publicTask = {
        ...newTask,
        employer: 'Вы',
        rating: 5.0,
        phone: '+996555000000',
      };
      this.allTasks.unshift(publicTask);

      console.log('DebugLocalTasksService: Task added successfully:', newTask);
      return newTask;
    } catch (error) {
      console.error('DebugLocalTasksService: Error adding task:', error);
      throw new Error(`Ошибка добавления задачи: ${error.message}`);
    }
  }

  // Удалить задачу пользователя
  async deleteUserTask(taskId) {
    console.log('DebugLocalTasksService: deleteUserTask called with ID:', taskId);
    
    try {
      // Удаляем из задач пользователя
      this.userTasks = this.userTasks.filter(task => task.id !== taskId);

      // Удаляем из общего списка
      this.allTasks = this.allTasks.filter(task => task.id !== taskId);

      console.log('DebugLocalTasksService: Task deleted successfully');
      return true;
    } catch (error) {
      console.error('DebugLocalTasksService: Error deleting task:', error);
      throw new Error(`Ошибка удаления задачи: ${error.message}`);
    }
  }

  // Получить задачу по ID
  async getTaskById(taskId) {
    console.log('DebugLocalTasksService: getTaskById called with ID:', taskId);
    const task = this.allTasks.find(task => task.id === taskId);
    return Promise.resolve(task || null);
  }

  // Очистить все данные (для отладки)
  async clearAllData() {
    console.log('DebugLocalTasksService: clearAllData called');
    this.allTasks = [];
    this.userTasks = [];
    return Promise.resolve();
  }
}

export default new DebugLocalTasksService();