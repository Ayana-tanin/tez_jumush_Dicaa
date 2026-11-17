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
import LocalTasksService from '../utils/localTasks';
import DebugLocalTasksService from '../utils/debugLocalTasks';

export default function SimpleMyTasksScreen({ navigation }) {
  const [myTasks, setMyTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка задач пользователя
  const loadMyTasks = async () => {
    setIsLoading(true);
    try {
      const userTasks = await DebugLocalTasksService.getUserTasks();
      setMyTasks(userTasks);
    } catch (error) {
      console.error('Ошибка загрузки моих задач:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить ваши задачи');
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление списка
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyTasks();
    setRefreshing(false);
  };

  // Загрузка при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      loadMyTasks();
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  const handleEditTask = (task) => {
    Alert.alert(
      'Редактировать задачу',
      `Редактирование задачи "${task.title}"`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Редактировать', onPress: () => {
            // Здесь можно открыть экран редактирования
            Alert.alert('Редактирование', 'Функция в разработке');
          }
        },
      ]
    );
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    Alert.alert(
      'Удалить задачу',
      `Вы уверены, что хотите удалить задачу "${taskTitle}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await DebugLocalTasksService.deleteUserTask(taskId);
              setMyTasks(prev => prev.filter(task => task.id !== taskId));
              Alert.alert('Успешно', 'Задача удалена');
            } catch (error) {
              console.error('Ошибка удаления задачи:', error);
              Alert.alert('Ошибка', 'Не удалось удалить задачу');
            }
          }
        },
      ]
    );
  };

  const handleViewApplications = (task) => {
    Alert.alert(
      'Отклики на задачу',
      `На задачу "${task.title}" откликнулось ${task.applications} человек`,
      [
        { text: 'OK' },
        {
          text: 'Посмотреть отклики', onPress: () => {
            Alert.alert('Отклики', 'Функция просмотра откликов в разработке');
          }
        },
      ]
    );
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditTask(item)}
          >
            <Ionicons name="pencil" size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTask(item.id, item.title)}
          >
            <Ionicons name="trash" size={18} color="#f44336" />
          </TouchableOpacity>
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
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.count_people} человека</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatTime(item.time)}</Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <Text style={styles.locationText}>{item.address}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Отклики */}
      {item.status === 'active' && (
        <TouchableOpacity
          style={styles.applicationsButton}
          onPress={() => handleViewApplications(item)}
        >
          <Ionicons name="people" size={16} color="#007AFF" />
          <Text style={styles.applicationsText}>
            {item.applications} откликов
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои задачи</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SimpleAddTask')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={myTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Загрузка...' : 'У вас пока нет задач'}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('SimpleAddTask')}
            >
              <Text style={styles.createButtonText}>Создать первую задачу</Text>
            </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 20,
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
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
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
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
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
  applicationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  applicationsText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
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
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});