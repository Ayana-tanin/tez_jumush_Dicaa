import React, { useState, useCallback, useEffect } from 'react';
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

export default function SimpleTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка задач
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await DebugLocalTasksService.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задачи');
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление списка
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  // Загрузка при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const handleTaskPress = useCallback((item) => {
    navigation.navigate('SimpleTaskDetail', { task: item });
  }, [navigation]);

  const renderTaskItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskPrice}>{item.price} сом</Text>
      </View>
      
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
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Активна</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleTaskPress]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Задачи</Text>
          <Text style={styles.headerSubtitle}>Найдите подходящую работу</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('SimpleAddTask')}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('NetworkTest')}
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasks List */}
      <FlatList
        data={tasks}
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
              {isLoading ? 'Загрузка задач...' : 'Пока нет активных задач'}
            </Text>
            {!isLoading && (
              <TouchableOpacity
                style={styles.createTaskButton}
                onPress={() => navigation.navigate('SimpleAddTask')}
              >
                <Text style={styles.createTaskButtonText}>Создать первую задачу</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
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
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
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
  createTaskButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});