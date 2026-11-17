import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../../context/TasksContext';

export default function EmployerTasksScreen({ navigation }) {
  const { myTasks } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, active, archived

  // Автоматическая архивация задач с прошедшей датой
  const getTasksWithArchive = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return myTasks.map(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      
      // Если дата прошла и задача еще активна - помечаем как архивную
      if (taskDate < now && task.status === 'active') {
        return { ...task, status: 'archived' };
      }
      return task;
    });
  }, [myTasks]);

  // Фильтрация задач
  const getFilteredTasks = useCallback(() => {
    const tasks = getTasksWithArchive();
    
    switch (activeFilter) {
      case 'active':
        return tasks.filter(task => task.status === 'active');
      case 'archived':
        return tasks.filter(task => task.status === 'archived' || task.status === 'completed');
      default:
        return tasks;
    }
  }, [getTasksWithArchive, activeFilter]);

  const filteredTasks = getFilteredTasks();

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

  const handleTaskPress = useCallback((item) => {
    navigation.navigate('SimpleTaskDetail', { task: item });
  }, [navigation]);

  const handleEditTask = useCallback((task) => {
    navigation.navigate('EditTask', { task });
  }, [navigation]);

  const renderTaskItem = useCallback(({ item }) => {
    const isArchived = item.status === 'archived' || item.status === 'completed';
    
    return (
      <TouchableOpacity 
        style={[styles.card, isArchived && styles.cardArchived]}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            {isArchived && (
              <View style={styles.archivedBadge}>
                <Ionicons name="archive" size={12} color="#8E98A8" />
                <Text style={styles.archivedText}>В архиве</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardPrice}>{item.price} сом</Text>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color="#777" />
          <Text style={styles.infoText}>{item.count_people} человека</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#777" />
          <Text style={styles.infoText}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color="#777" />
          <Text style={styles.infoText}>
            {formatTime(item.time_from)} - {formatTime(item.time_to)}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.location} numberOfLines={1}>{item.address}</Text>
            {item.applications !== undefined && (
              <View style={styles.applicationsRow}>
                <Ionicons name="people" size={12} color="#2F80ED" />
                <Text style={styles.applicationsText}>
                  {item.applications} откликов
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              handleEditTask(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#2F80ED" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [handleTaskPress, handleEditTask, formatDate, formatTime]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Фильтры с иконками */}
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[styles.filter, activeFilter === 'all' && styles.filterActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="list" 
            size={18} 
            color={activeFilter === 'all' ? '#FFFFFF' : '#8E98A8'} 
          />
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterActiveText]}>
            Все
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filter, activeFilter === 'active' && styles.filterActive]}
          onPress={() => setActiveFilter('active')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="flash" 
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
            name="archive" 
            size={18} 
            color={activeFilter === 'archived' ? '#FFFFFF' : '#8E98A8'} 
          />
          <Text style={[styles.filterText, activeFilter === 'archived' && styles.filterActiveText]}>
            В архиве
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeFilter === 'archived' ? 'archive-outline' : 'briefcase-outline'} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              {activeFilter === 'archived' 
                ? 'Нет задач в архиве' 
                : activeFilter === 'active'
                ? 'Нет активных задач'
                : 'Пока нет задач'}
            </Text>
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 8,
    gap: 8,
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1B84F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardArchived: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A090E',
    flex: 1,
    marginRight: 10,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F80ED',
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  archivedText: {
    fontSize: 12,
    color: '#8E98A8',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  applicationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicationsText: {
    fontSize: 12,
    color: '#2F80ED',
    fontWeight: '500',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
    textAlign: 'center',
  },
});
