import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TasksContext';
import GoogleAuthService from '../../utils/googleAuth';

export default function ChatsScreen({ navigation }) {
  const { myTasks, taskApplications, appliedTasks } = useTasks();
  const [userRole, setUserRole] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, accepted, rejected
  const [searchQuery, setSearchQuery] = useState(''); // для поиска по нику работодателя

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      if (authStatus.isAuthenticated && authStatus.user) {
        setUserRole(authStatus.user.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  // Получить задачу по ID из моих задач
  const getMyTaskById = useCallback((taskId) => {
    return myTasks.find(task => task.id === taskId) || null;
  }, [myTasks]);

  // Получить все отклики с информацией о задачах (для работодателя)
  const getAllApplications = useCallback(() => {
    const allApps = [];
    taskApplications.forEach(app => {
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

  // Фильтрация откликов по статусу
  const getFilteredApplications = useCallback(() => {
    const apps = getAllApplications();
    
    switch (activeFilter) {
      case 'accepted':
        return apps.filter(app => app.applicationStatus === 'accepted');
      case 'rejected':
        return apps.filter(app => app.applicationStatus === 'rejected');
      default:
        return apps;
    }
  }, [getAllApplications, activeFilter]);

  const filteredApplications = getFilteredApplications();
  const isEmployer = userRole === 'employer';
  const isWorker = userRole === 'worker';

  // Получить все чаты с работодателями (для работника)
  const getWorkerChats = useCallback(() => {
    // Получаем все задачи, на которые откликнулся работник
    const chats = appliedTasks.map(task => {
      // Найти applicationId для этой задачи
      const application = taskApplications.find(app => app.taskId === task.id);
      return {
        taskId: task.id,
        task: task,
        employerName: task.creator_name || 'Работодатель',
        applicationId: application ? application.id : null,
        applicationStatus: task.applicationStatus || 'pending',
      };
    });

    // Фильтруем по поисковому запросу
    if (searchQuery.trim()) {
      return chats.filter(chat => 
        chat.employerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return chats;
  }, [appliedTasks, taskApplications, searchQuery]);

  const workerChats = getWorkerChats();

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
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleApplicationPress(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.task.title}</Text>
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

  // Если работник - показываем чаты с работодателями
  if (isWorker) {
    return (
      <View style={styles.container}>
        {/* Поисковик */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E98A8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по нику работодателя"
            placeholderTextColor="#8E98A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8E98A8" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList
          data={workerChats}
          keyExtractor={(item) => `chat_${item.taskId}`}
          renderItem={({ item }) => {
            const chatId = item.applicationId 
              ? `task_${item.taskId}_app_${item.applicationId}`
              : `task_${item.taskId}_worker`;
            
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  navigation.navigate('Chat', {
                    chatId: chatId,
                    chatTitle: item.task.title,
                    otherUserName: item.employerName,
                    applicationId: item.applicationId,
                    taskId: item.taskId,
                  });
                }}
                activeOpacity={0.7}
              >
                {/* Employer Info */}
                <View style={styles.applicantInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.employerName || 'Р')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.applicantName}>{item.employerName}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{item.task.rating || '5.0'}</Text>
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
                  <Text style={styles.cardTitle}>{item.task.title}</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="#777" />
                    <Text style={styles.infoText}>{formatDate(item.task.date)}</Text>
                    <Text style={styles.cardPrice}>{item.task.price} сом</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery.trim() 
                  ? 'Ничего не найдено' 
                  : 'Пока нет переписок с работодателями'}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

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
          style={[styles.filter, activeFilter === 'accepted' && styles.filterActive]}
          onPress={() => setActiveFilter('accepted')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={18} 
            color={activeFilter === 'accepted' ? '#FFFFFF' : '#8E98A8'} 
          />
          <Text style={[styles.filterText, activeFilter === 'accepted' && styles.filterActiveText]}>
            Одобрено
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filter, activeFilter === 'rejected' && styles.filterActive]}
          onPress={() => setActiveFilter('rejected')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color={activeFilter === 'rejected' ? '#FFFFFF' : '#8E98A8'} 
          />
          <Text style={[styles.filterText, activeFilter === 'rejected' && styles.filterActiveText]}>
            Отклонено
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
              name={activeFilter === 'accepted' ? 'checkmark-circle-outline' : activeFilter === 'rejected' ? 'close-circle-outline' : 'chatbubbles-outline'} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              {activeFilter === 'accepted' 
                ? 'Нет одобренных откликов' 
                : activeFilter === 'rejected'
                ? 'Нет отклоненных откликов'
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0A090E',
    padding: 0,
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
