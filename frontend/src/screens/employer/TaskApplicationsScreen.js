import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TasksContext';

export default function TaskApplicationsScreen({ navigation }) {
  const { myTasks, taskApplications } = useTasks();
  const [activeFilter, setActiveFilter] = useState('all'); // all, active, archived

  // Получить задачу по ID из моих задач
  const getMyTaskById = useCallback((taskId) => {
    return myTasks.find(task => task.id === taskId) || null;
  }, [myTasks]);

  // Получить все отклики с информацией о задачах
  const getAllApplications = useCallback(() => {
    const allApps = [];
    taskApplications.forEach(app => {
      // Ищем задачу в моих задачах (созданных пользователем)
      const task = getMyTaskById(app.taskId);
      if (task) {
        allApps.push({
          ...app,
          task: task,
        });
      }
    });
    return allApps;
  }, [taskApplications, getMyTaskById]);

  // Автоматическая архивация откликов по дате задачи
  const getApplicationsWithArchive = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return getAllApplications().map(app => {
      const taskDate = new Date(app.task.date);
      taskDate.setHours(0, 0, 0, 0);
      
      // Если дата задачи прошла - помечаем как архивный (независимо от статуса)
      // Или если статус accepted/rejected - тоже архивный
      const isDateArchived = taskDate < now;
      const isStatusArchived = app.applicationStatus === 'accepted' || app.applicationStatus === 'rejected';
      
      return { 
        ...app, 
        isArchived: isDateArchived || isStatusArchived 
      };
    });
  }, [getAllApplications]);

  // Фильтрация откликов
  const getFilteredApplications = useCallback(() => {
    const apps = getApplicationsWithArchive();
    
    switch (activeFilter) {
      case 'active':
        // Только активные отклики (не архивные и pending)
        return apps.filter(app => !app.isArchived && app.applicationStatus === 'pending');
      case 'archived':
        // Все архивные отклики (по дате или по статусу)
        return apps.filter(app => app.isArchived);
      default:
        // Все отклики без фильтрации
        return apps;
    }
  }, [getApplicationsWithArchive, activeFilter]);

  const filteredApplications = getFilteredApplications();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'accepted': return 'Одобрен';
      case 'rejected': return 'Отклонен';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  };

  const handleApplicationPress = (application) => {
    navigation.navigate('Chat', {
      chatId: `task_${application.taskId}_app_${application.id}`,
      chatTitle: application.task.title,
      otherUserName: application.applicantName,
      applicationId: application.id,
      taskId: application.taskId,
    });
  };

  const renderItem = ({ item }) => {
    const isArchived = item.isArchived || item.applicationStatus !== 'pending';
    
    return (
      <TouchableOpacity
        style={[styles.card, isArchived && styles.cardArchived]}
        onPress={() => handleApplicationPress(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.task.title}</Text>
            {isArchived && (
              <View style={styles.archivedBadge}>
                <Ionicons name="archive" size={12} color="#8E98A8" />
                <Text style={styles.archivedText}>В архиве</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardPrice}>{item.task.price} сом</Text>
        </View>

        {/* Applicant Info */}
        <View style={styles.applicantInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.applicantName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.applicantName}>{item.applicantName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.applicantRating}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.applicationStatus)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.applicationStatus) }]}>
              {getStatusText(item.applicationStatus)}
            </Text>
          </View>
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#777" />
            <Text style={styles.infoText}>{formatDate(item.task.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#777" />
            <Text style={styles.infoText} numberOfLines={1}>{item.task.address}</Text>
          </View>
        </View>

        {/* Message */}
        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        data={filteredApplications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeFilter === 'archived' ? 'archive-outline' : 'people-outline'} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              {activeFilter === 'archived' 
                ? 'Нет откликов в архиве' 
                : activeFilter === 'active'
                ? 'Нет активных откликов'
                : 'Пока нет откликов'}
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
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A090E',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 8,
    flex: 1,
  },
  messageContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
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
