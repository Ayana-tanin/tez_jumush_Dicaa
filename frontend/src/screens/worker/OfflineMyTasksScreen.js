import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../../context/TasksContext';

export default function OfflineMyTasksScreen({ navigation }) {
  const { 
    appliedTasks, 
    cancelApplication, 
    getTaskApplications,
    taskApplications,
  } = useTasks();
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'archived'
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка задач пользователя
  const loadMyTasks = useCallback(async () => {
    console.log('OfflineMyTasksScreen: Loading applied tasks...');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log('OfflineMyTasksScreen: Applied tasks loaded:', appliedTasks.length);
    }, 300);
  }, [appliedTasks.length]);

  // Обновление списка
  const onRefresh = useCallback(async () => {
    console.log('OfflineMyTasksScreen: Refreshing...');
    setRefreshing(true);
    await loadMyTasks();
    setRefreshing(false);
  }, [loadMyTasks]);

  // Загрузка при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      loadMyTasks();
    }, [loadMyTasks])
  );

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  }, []);

  const formatTimeRange = useCallback((timeFrom, timeTo) => {
    if (timeFrom && timeTo) {
      return `${formatTime(timeFrom)} - ${formatTime(timeTo)}`;
    }
    return timeFrom ? formatTime(timeFrom) : 'Время не указано';
  }, [formatTime]);

  // Получить статус отклика
  const getApplicationStatusText = useCallback((status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'accepted': return 'Одобрен';
      case 'rejected': return 'Отклонен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  }, []);

  const getApplicationStatusColor = useCallback((status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'cancelled': return '#999';
      default: return '#666';
    }
  }, []);

  // Найти applicationId для задачи
  const findApplicationId = useCallback((taskId) => {
    // Ищем заявку в taskApplications с таким taskId
    const applications = taskApplications.filter(app => app.taskId === taskId);
    // Возвращаем первую найденную заявку (если есть)
    return applications.length > 0 ? applications[0].id : null;
  }, [taskApplications]);

  // Обработчик нажатия на задачу - открывает чат с работодателем
  const handleTaskPress = useCallback((task) => {
    console.log('Open chat for task:', task.title);
    
    const applicationId = findApplicationId(task.id);
    const chatId = applicationId 
      ? `task_${task.id}_app_${applicationId}`
      : `task_${task.id}_worker`;
    
    navigation.navigate('Chat', {
      chatId: chatId,
      chatTitle: task.title,
      otherUserName: task.employer || 'Работодатель',
      applicationId: applicationId,
      taskId: task.id,
    });
  }, [navigation, findApplicationId]);

  // Отменить отклик
  const handleCancelApplication = useCallback((taskId, taskTitle) => {
    console.log('Cancel application for task:', taskId, taskTitle);
    Alert.alert(
      'Отменить отклик',
      `Вы уверены, что хотите отменить отклик на задачу "${taskTitle}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Отменить отклик', 
          style: 'destructive',
          onPress: () => {
            cancelApplication(taskId);
            Alert.alert('Успешно', 'Отклик отменен');
          }
        },
      ]
    );
  }, [cancelApplication]);

  // Фильтрация задач
  const getFilteredTasks = useCallback((tasks) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    switch (activeFilter) {
      case 'active':
        // Активные: дата задачи не просрочена (дата >= сегодня)
        return tasks.filter(task => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate >= today;
        });
      case 'archived':
        // Архив: дата прошла (дата < сегодня) И статус accepted (одобрено)
        return tasks.filter(task => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          const applicationStatus = task.applicationStatus || 'pending';
          return taskDate < today && applicationStatus === 'accepted';
        });
      default:
        return tasks;
    }
  }, [activeFilter]);

  const filteredTasks = getFilteredTasks(appliedTasks);

  // Рендер задачи с откликом
  const renderTask = useCallback(({ item }) => {
    const applicationStatus = item.applicationStatus || 'pending';
    const statusText = getApplicationStatusText(applicationStatus);
    const statusColor = getApplicationStatusColor(applicationStatus);

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.taskTitle}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        
        <Text style={styles.taskPrice}>{item.price} сом</Text>
        
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.taskInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.employer || 'Работодатель'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.time_from && item.time_to 
                ? formatTimeRange(item.time_from, item.time_to)
                : formatTime(item.time || item.time_from)
              }
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        {/* Дата отклика */}
        {item.appliedAt && (
          <View style={styles.appliedInfo}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.appliedText}>
              Откликнулись: {formatDate(item.appliedAt)}
            </Text>
          </View>
        )}

        {/* Кнопка отмены отклика (только для pending) */}
        {applicationStatus === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCancelApplication(item.id, item.title);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color="#f44336" />
            <Text style={styles.cancelButtonText}>Отменить отклик</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }, [handleTaskPress, handleCancelApplication, formatDate, formatTime, formatTimeRange, getApplicationStatusText, getApplicationStatusColor]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои отклики</Text>
      </View>

      {/* Фильтры */}
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[styles.filter, activeFilter === 'active' && styles.filterActive]}
          onPress={() => setActiveFilter('active')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={18} 
            color={activeFilter === 'active' ? '#FFFFFF' : '#8E98A8'} 
          />
          <Text style={[styles.filterText, activeFilter === 'active' && styles.filterActiveText]}>
            Активные
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filter, activeFilter === 'archived' && styles.filterActive]}
          onPress={() => setActiveFilter('archived')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="archive-outline" 
            size={18} 
            color={activeFilter === 'archived' ? '#FFFFFF' : '#8E98A8'} 
          />
          <Text style={[styles.filterText, activeFilter === 'archived' && styles.filterActiveText]}>
            В архиве
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="checkmark-circle-outline" 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              {isLoading 
                ? 'Загрузка...' 
                : activeFilter === 'active'
                ? 'Нет активных откликов'
                : 'Нет задач в архиве'}
            </Text>
            {!isLoading && filteredTasks.length === 0 && (
              <TouchableOpacity
                style={styles.findButton}
                onPress={() => navigation.navigate('Tasks')}
                activeOpacity={0.8}
              >
                <Text style={styles.findButtonText}>Найти задачи</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0D7E2',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  filterActive: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
  },
  filterText: {
    fontSize: 14,
    color: '#8E98A8',
    fontWeight: '500',
  },
  filterActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  taskInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  appliedText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  cancelButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  findButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
