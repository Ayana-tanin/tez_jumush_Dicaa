import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import ApiService from '../utils/api';
import { TaskStorage } from '../utils/localStorage';
import SyncService from '../utils/syncService';

// Создаем контекст
const TasksContext = createContext();

// Начальные данные
const initialAllTasks = [
  {
    id: 1,
    title: 'Уборка квартиры',
    price: 5000,
    count_people: 2,
    date: '2024-09-15',
    time_from: '10:00',
    time_to: '14:00',
    address: 'Бишкек, ул. Чуй 123',
    description: 'Нужна уборка 3-комнатной квартиры',
    status: 'active',
    employer: 'Айгуль К.',
    rating: 4.8,
    phone: '+996555123456',
    created_at: '2024-09-10T10:00:00Z',
    isMyTask: false,
  },
  {
    id: 2,
    title: 'Посадка картофеля',
    price: 3000,
    count_people: 3,
    date: '2024-09-16',
    time_from: '08:00',
    time_to: '12:00',
    address: 'Токмок, дачный участок',
    description: 'Помощь в посадке картофеля',
    status: 'active',
    employer: 'Марат С.',
    rating: 4.5,
    phone: '+996777654321',
    created_at: '2024-09-11T08:00:00Z',
    isMyTask: false,
  },
];

const initialMyTasks = [
  {
    id: 101,
    title: 'Ремонт крана',
    price: 2000,
    count_people: 1,
    date: '2024-09-20',
    time_from: '14:00',
    time_to: '16:00',
    address: 'Бишкек, ул. Манаса 45',
    description: 'Нужно починить кран в ванной',
    status: 'active',
    applications: 3,
    created_at: '2024-09-12T14:00:00Z',
    isMyTask: true,
  },
  {
    id: 102,
    title: 'Перевозка мебели',
    price: 8000,
    count_people: 2,
    date: '2024-09-22',
    time_from: '09:00',
    time_to: '15:00',
    address: 'Бишкек, мкр. Джал 12-15',
    description: 'Перевезти мебель из старой квартиры в новую',
    status: 'completed',
    applications: 7,
    created_at: '2024-09-13T09:00:00Z',
    isMyTask: true,
  },
];

// Начальные отклики для демонстрации
const initialAppliedTasks = [
  {
    id: 1,
    title: 'Уборка квартиры',
    price: 5000,
    count_people: 2,
    date: '2024-09-15',
    time_from: '10:00',
    time_to: '14:00',
    address: 'Бишкек, ул. Чуй 123',
    description: 'Нужна уборка 3-комнатной квартиры',
    status: 'active',
    employer: 'Айгуль К.',
    rating: 4.8,
    phone: '+996555123456',
    created_at: '2024-09-10T10:00:00Z',
    appliedAt: '2024-09-14T15:30:00Z',
    applicationStatus: 'pending', // pending, accepted, rejected, cancelled
  },
];

// Начальные заявки на мои задачи (для создателя задач)
const initialTaskApplications = [
  {
    id: 1001,
    taskId: 101, // ID задачи "Ремонт крана"
    applicantName: 'Бекжан А.',
    applicantRating: 4.6,
    applicantPhone: '+996700123456',
    appliedAt: '2024-09-14T16:20:00Z',
    applicationStatus: 'pending', // pending, accepted, rejected
    message: 'Опыт работы сантехником 5 лет. Могу выполнить качественно и быстро.',
  },
  {
    id: 1002,
    taskId: 101,
    applicantName: 'Нурлан К.',
    applicantRating: 4.9,
    applicantPhone: '+996555987654',
    appliedAt: '2024-09-14T17:45:00Z',
    applicationStatus: 'pending',
    message: 'Профессиональный сантехник. Гарантия на работу.',
  },
];

// Провайдер контекста
export const TasksProvider = ({ children }) => {
  const [allTasks, setAllTasks] = useState(initialAllTasks);
  const [myTasks, setMyTasks] = useState(initialMyTasks);
  const [appliedTasks, setAppliedTasks] = useState(initialAppliedTasks); // Задачи на которые откликнулись
  const [taskApplications, setTaskApplications] = useState(initialTaskApplications); // Заявки на мои задачи
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  // Загрузка данных из AsyncStorage при инициализации
  useEffect(() => {
    const loadStoredData = async () => {
      console.log('📂 TasksContext: Loading data from storage...');
      try {
        const storedData = await TaskStorage.loadAllData();
        
        // Если есть сохраненные данные, используем их
        if (storedData.myTasks.length > 0) {
          setMyTasks(storedData.myTasks);
          console.log('📂 Loaded myTasks:', storedData.myTasks.length);
        }
        
        if (storedData.allTasks.length > 0) {
          setAllTasks(storedData.allTasks);
          console.log('📂 Loaded allTasks:', storedData.allTasks.length);
        }
        
        if (storedData.appliedTasks.length > 0) {
          setAppliedTasks(storedData.appliedTasks);
          console.log('📂 Loaded appliedTasks:', storedData.appliedTasks.length);
        }
        
        if (storedData.taskApplications.length > 0) {
          setTaskApplications(storedData.taskApplications);
          console.log('📂 Loaded taskApplications:', storedData.taskApplications.length);
        }
        
        console.log('✅ TasksContext: Data loaded from storage successfully');
      } catch (error) {
        console.error('❌ TasksContext: Error loading data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Настройка синхронизации после загрузки данных
  useEffect(() => {
    if (!isLoading) {
      // Добавляем callback для обработки новых данных
      const handleSyncData = (syncData) => {
        console.log('📥 TasksContext: Received sync data:', syncData);
        
        if (syncData.newApplications && syncData.newApplications.length > 0) {
          // Добавляем новые заявки (без уведомлений - уведомления отключены)
          setTaskApplications(prev => {
            const newApps = syncData.newApplications.filter(newApp => 
              !prev.some(existingApp => existingApp.id === newApp.id)
            );
            
            if (newApps.length > 0) {
              // Уведомления отключены - просто добавляем заявки без Alert
              // const count = newApps.length;
              // Alert.alert(...) - отключено
              
              return [...newApps, ...prev];
            }
            return prev;
          });
        }
        
        if (syncData.newTasks && syncData.newTasks.length > 0) {
          // Обновляем список всех задач
          setAllTasks(prev => {
            const updatedTasks = [...syncData.newTasks];
            // Сохраняем локальные задачи пользователя
            const myLocalTasks = prev.filter(task => task.isMyTask);
            return [...myLocalTasks, ...updatedTasks];
          });
        }
      };
      
      // Подписываемся на обновления
      SyncService.addSyncCallback(handleSyncData);
      
      // Запускаем синхронизацию
      SyncService.startSync(30000); // каждые 30 секунд
      
      // Очистка при размонтировании
      return () => {
        SyncService.removeSyncCallback(handleSyncData);
        SyncService.stopSync();
      };
    }
  }, [isLoading]);

  // Функция для сохранения всех данных в AsyncStorage
  const saveAllDataToStorage = useCallback(async () => {
    try {
      await TaskStorage.saveAllData(myTasks, allTasks, appliedTasks, taskApplications);
      console.log('💾 All data saved to storage');
    } catch (error) {
      console.error('❌ Error saving data to storage:', error);
    }
  }, [myTasks, allTasks, appliedTasks, taskApplications]);

  // Автоматическое сохранение при изменении данных
  useEffect(() => {
    if (!isLoading) {
      saveAllDataToStorage();
    }
  }, [myTasks, allTasks, appliedTasks, taskApplications, isLoading, saveAllDataToStorage]);

  // Добавить новую задачу
  const addTask = useCallback(async (taskData) => {
    console.log('TasksContext: Adding new task:', taskData);
    
    // Сначала проверяем подключение к backend
    const isConnected = await ApiService.checkConnection();
    console.log('TasksContext: Backend connection status:', isConnected);
    
    if (isConnected) {
      try {
        // Пытаемся сохранить в базу данных через API
        console.log('TasksContext: Attempting to save to database...');
        const savedTask = await ApiService.createTask(taskData);
        console.log('✅ TasksContext: Task saved to database successfully:', savedTask);
      
      // Добавляем в мои задачи
      setMyTasks(prev => [savedTask, ...prev]);

      // Добавляем в общий список с информацией о заказчике
      const publicTask = {
        ...savedTask,
        employer: 'Вы',
        rating: 5.0,
        phone: '+996555000000',
      };
      setAllTasks(prev => [publicTask, ...prev]);

      console.log('TasksContext: Task added successfully to database');
      return savedTask;
    } catch (error) {
      console.log('TasksContext: Failed to save to database, saving locally:', error);
      
      // Если не удалось сохранить в БД, сохраняем локально
      const newTask = {
        ...taskData,
        id: Date.now(),
        status: 'active',
        applications: 0,
        created_at: new Date().toISOString(),
        isMyTask: true,
      };

      // Добавляем в мои задачи
      setMyTasks(prev => [newTask, ...prev]);

      // Добавляем в общий список с информацией о заказчике
      const publicTask = {
        ...newTask,
        employer: 'Вы',
        rating: 5.0,
        phone: '+996555000000',
      };
      setAllTasks(prev => [publicTask, ...prev]);

      console.log('TasksContext: Task added successfully locally');
      return newTask;
    }
    } else {
      // Backend недоступен, сохраняем только локально
      console.log('TasksContext: Backend unavailable, saving locally only');
      
      const newTask = {
        ...taskData,
        id: Date.now(),
        status: 'active',
        applications: 0,
        created_at: new Date().toISOString(),
        isMyTask: true,
      };

      // Добавляем в мои задачи
      setMyTasks(prev => [newTask, ...prev]);

      // Добавляем в общий список с информацией о заказчике
      const publicTask = {
        ...newTask,
        employer: 'Вы',
        rating: 5.0,
        phone: '+996555000000',
      };
      setAllTasks(prev => [publicTask, ...prev]);

      console.log('TasksContext: Task added successfully locally (offline mode)');
      return newTask;
    }
  }, []);

  // Удалить задачу
  const deleteTask = useCallback((taskId) => {
    console.log('TasksContext: Deleting task:', taskId);
    
    // Удаляем из моих задач
    setMyTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Удаляем из общего списка
    setAllTasks(prev => prev.filter(task => task.id !== taskId));
    
    console.log('TasksContext: Task deleted successfully');
  }, []);

  // Обновить задачу
  const updateTask = useCallback(async (taskId, updates) => {
    console.log('TasksContext: Updating task:', taskId, updates);
    
    // Сначала проверяем подключение к backend
    const isConnected = await ApiService.checkConnection();
    console.log('TasksContext: Backend connection status for update:', isConnected);
    
    if (isConnected) {
      try {
        // Пытаемся обновить в базе данных через API
        console.log('TasksContext: Attempting to update task in database...');
        const updatedTask = await ApiService.updateTask(taskId, updates);
        console.log('✅ TasksContext: Task updated in database successfully:', updatedTask);
        
        // Обновляем локальное состояние с данными из API
        setMyTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        ));
        
        setAllTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        ));
        
        console.log('TasksContext: Task updated successfully in database and locally');
        return updatedTask;
      } catch (error) {
        console.log('TasksContext: Failed to update in database, updating locally:', error);
        // Если не удалось обновить в БД, обновляем локально
      }
    } else {
      console.log('TasksContext: Backend unavailable, updating locally only');
    }
    
    // Локальное обновление (fallback или оффлайн режим)
    const updatedData = { ...updates, updated_at: new Date().toISOString() };
    
    setMyTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updatedData } : task
    ));
    
    setAllTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updatedData } : task
    ));
    
    console.log('TasksContext: Task updated successfully locally');
    return updatedData;
  }, []);

  // Откликнуться на задачу
  const applyToTask = useCallback((taskId) => {
    console.log('TasksContext: Applying to task:', taskId);
    
    const task = allTasks.find(t => t.id === taskId);
    if (task && !appliedTasks.find(t => t.id === taskId)) {
      const appliedTask = {
        ...task,
        appliedAt: new Date().toISOString(),
        applicationStatus: 'pending', // pending, accepted, rejected
      };
      
      setAppliedTasks(prev => [appliedTask, ...prev]);
      console.log('TasksContext: Applied to task successfully');
      return true;
    }
    return false;
  }, [allTasks, appliedTasks]);



  // Получить задачу по ID
  const getTaskById = useCallback((taskId) => {
    return allTasks.find(task => task.id === taskId) || null;
  }, [allTasks]);

  // Проверить, откликнулись ли на задачу
  const hasAppliedToTask = useCallback((taskId) => {
    return appliedTasks.some(task => task.id === taskId);
  }, [appliedTasks]);

  // Получить статус отклика на задачу
  const getApplicationStatus = useCallback((taskId) => {
    const application = appliedTasks.find(task => task.id === taskId);
    return application ? application.applicationStatus : null;
  }, [appliedTasks]);

  // Получить заявки на мою задачу
  const getTaskApplications = useCallback((taskId) => {
    return taskApplications.filter(app => app.taskId === taskId);
  }, [taskApplications]);

  // Подтвердить заявку работника (для создателя задачи)
  const acceptApplication = useCallback((applicationId) => {
    console.log('TasksContext: Accepting application:', applicationId);
    
    setTaskApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, applicationStatus: 'accepted' }
        : app
    ));
    
    // Обновляем статус в откликах работника (если это наш отклик)
    setAppliedTasks(prev => prev.map(task => {
      const application = taskApplications.find(app => app.id === applicationId);
      return application && task.id === application.taskId
        ? { ...task, applicationStatus: 'accepted' }
        : task;
    }));
    
    console.log('TasksContext: Application accepted successfully');
  }, [taskApplications]);

  // Отклонить заявку работника (для создателя задачи)
  const rejectApplication = useCallback((applicationId) => {
    console.log('TasksContext: Rejecting application:', applicationId);
    
    setTaskApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, applicationStatus: 'rejected' }
        : app
    ));
    
    // Обновляем статус в откликах работника (если это наш отклик)
    setAppliedTasks(prev => prev.map(task => {
      const application = taskApplications.find(app => app.id === applicationId);
      return application && task.id === application.taskId
        ? { ...task, applicationStatus: 'rejected' }
        : task;
    }));
    
    console.log('TasksContext: Application rejected successfully');
  }, [taskApplications]);

  // Отменить отклик (обновленная версия)
  const cancelApplication = useCallback((taskId) => {
    console.log('TasksContext: Canceling application for task:', taskId);
    
    // Удаляем из откликов
    setAppliedTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Обновляем статус заявки на "cancelled" (если она существует)
    setTaskApplications(prev => prev.map(app => 
      app.taskId === taskId 
        ? { ...app, applicationStatus: 'cancelled' }
        : app
    ));
    
    console.log('TasksContext: Application cancelled successfully');
  }, []);

  const value = {
    allTasks,
    myTasks,
    appliedTasks,
    taskApplications,
    isLoading,
    addTask,
    deleteTask,
    updateTask,
    applyToTask,
    cancelApplication,
    getTaskById,
    hasAppliedToTask,
    getApplicationStatus,
    getTaskApplications,
    acceptApplication,
    rejectApplication,
    saveAllDataToStorage,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

// Хук для использования контекста
export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};