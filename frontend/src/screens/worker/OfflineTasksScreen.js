import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../../context/TasksContext';

export default function OfflineTasksScreen({ navigation }) {
  const { 
    allTasks, 
    applyToTask, 
    hasAppliedToTask, 
    getApplicationStatus, 
    cancelApplication 
  } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Загрузка задач
  const loadTasks = useCallback(async () => {
    console.log('OfflineTasksScreen: Loading tasks...');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log('OfflineTasksScreen: Tasks loaded successfully, count:', allTasks.length);
    }, 300);
  }, [allTasks.length]);

  // Обновление списка
  const onRefresh = useCallback(async () => {
    console.log('OfflineTasksScreen: Refreshing...');
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  // Загрузка при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }, []);

  // Форматирование даты с днем недели для фильтров (Вс 21, Пн 22)
  const formatDateWithDay = useCallback((date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    return `${dayName} ${day}`;
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  }, []);

  const handleTaskPress = useCallback((item) => {
    console.log('Task pressed:', item.title);
    navigation.navigate('WorkerTaskDetail', { task: item });
  }, [navigation]);

  const handleApplyToTask = useCallback((task) => {
    console.log('Apply to task:', task.title);
    
    const applicationStatus = getApplicationStatus(task.id);
    
    if (hasAppliedToTask(task.id)) {
      const statusText = {
        pending: 'Ожидает подтверждения',
        accepted: 'Принят заказчиком',
        rejected: 'Отклонен заказчиком',
        cancelled: 'Отменен'
      }[applicationStatus] || 'Неизвестный статус';

      Alert.alert(
        'Управление откликом',
        `Статус: ${statusText}\n\nВы можете отменить свой отклик, если он еще не принят.`,
        [
          { text: 'Закрыть', style: 'cancel' },
          ...(applicationStatus === 'pending' ? [{
            text: 'Отменить отклик',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Подтверждение',
                'Вы уверены, что хотите отменить отклик?',
                [
                  { text: 'Нет', style: 'cancel' },
                  {
                    text: 'Да, отменить',
                    style: 'destructive',
                    onPress: () => {
                      cancelApplication(task.id);
                      Alert.alert('Готово', 'Отклик отменен');
                    }
                  }
                ]
              );
            }
          }] : [])
        ]
      );
      return;
    }

    Alert.alert(
      'Откликнуться на задачу',
      `Вы хотите откликнуться на задачу "${task.title}"?\n\nВаш отклик будет отправлен заказчику для рассмотрения.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Да, откликнуться', 
          onPress: () => {
            const success = applyToTask(task.id);
            if (success) {
              Alert.alert('Успешно!', 'Ваш отклик отправлен заказчику. Ожидайте подтверждения!');
            } else {
              Alert.alert('Ошибка', 'Не удалось отправить отклик');
            }
          }
        },
      ]
    );
  }, [applyToTask, hasAppliedToTask, getApplicationStatus, cancelApplication]);

  const renderTaskItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleTaskPress(item)}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
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
        <Text style={styles.infoText}>{formatTime(item.time_from)}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.author} numberOfLines={1}>
            {item.creator_name || 'Автор'}
          </Text>
          <Text style={styles.location} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.rating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>5.0</Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          hasAppliedToTask(item.id) && styles.buttonApplied
        ]}
        onPress={(e) => {
          e.stopPropagation();
          handleApplyToTask(item);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {(() => {
            if (!hasAppliedToTask(item.id)) return 'Откликнуться';
            const status = getApplicationStatus(item.id);
            switch (status) {
              case 'pending': return 'Ожидает ответа';
              case 'accepted': return 'Принят';
              case 'rejected': return 'Отклонен';
              default: return 'Откликнулись';
            }
          })()}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleTaskPress, handleApplyToTask, hasAppliedToTask, getApplicationStatus, formatDate, formatTime]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // Получение активных задач (без устаревших)
  const getActiveTasks = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    return allTasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today;
    });
  }, [allTasks]);

  // Получение списка дат для фильтров
  const getDateFilters = useCallback(() => {
    const activeTasks = getActiveTasks();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    // Собираем все уникальные даты из задач
    const dateSet = new Set();
    activeTasks.forEach(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      dateSet.add(taskDate.getTime());
    });
    
    // Находим максимальную дату
    let maxDate = today;
    dateSet.forEach(timestamp => {
      const date = new Date(timestamp);
      if (date > maxDate) {
        maxDate = date;
      }
    });
    
    // Вычисляем количество дней: минимум 6, максимум до последней даты
    const daysDiff = Math.ceil((maxDate - today) / (1000 * 60 * 60 * 24));
    const daysToShow = Math.max(6, daysDiff + 1);
    
    // Создаем массив дат для фильтров
    const dateFilters = [];
    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);
      
      // Проверяем, есть ли задачи на эту дату
      const hasTasks = activeTasks.some(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === currentDate.getTime();
      });
      
      dateFilters.push({
        key: currentDate.getTime().toString(),
        date: currentDate,
        label: formatDateWithDay(currentDate),
        hasTasks,
      });
    }
    
    return dateFilters;
  }, [getActiveTasks, formatDateWithDay]);

  // Фильтрация и группировка задач
  const getFilteredTasks = useCallback(() => {
    const activeTasks = getActiveTasks();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    // Если выбран "Все", группируем по датам
    if (activeFilter === 'all') {
      // Находим максимальную дату
      let maxDate = today;
      activeTasks.forEach(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate > maxDate) {
          maxDate = taskDate;
        }
      });
      
      // Вычисляем количество дней: минимум 6, максимум до последней даты
      const daysDiff = Math.ceil((maxDate - today) / (1000 * 60 * 60 * 24));
      const daysToShow = Math.max(6, daysDiff + 1);
      
      // Группируем задачи по датам
      const groupedByDate = {};
      activeTasks.forEach(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        const dateKey = taskDate.getTime().toString();
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(task);
      });
      
      // Создаем массив секций для SectionList
      const sections = [];
      for (let i = 0; i < daysToShow; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);
        const dateKey = currentDate.getTime().toString();
        const tasksForDate = groupedByDate[dateKey] || [];
        
        sections.push({
          title: formatDateWithDay(currentDate),
          data: tasksForDate,
          dateKey: dateKey,
        });
      }
      
      return sections;
    }
    
    // Если выбран конкретный день, возвращаем задачи этой даты
    const selectedDate = new Date(parseInt(activeFilter));
    selectedDate.setHours(0, 0, 0, 0);
    
    return activeTasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === selectedDate.getTime();
    });
  }, [allTasks, activeFilter, getActiveTasks, formatDateWithDay]);

  const filteredTasks = getFilteredTasks();
  const dateFilters = getDateFilters();

  return (
    <View style={styles.container}>
      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity 
          style={[styles.filter, activeFilter === 'all' && styles.filterActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterActiveText]}>
            Все
          </Text>
        </TouchableOpacity>
        
        {dateFilters.map((dateFilter) => (
          <TouchableOpacity 
            key={dateFilter.key}
            style={[
              styles.filter, 
              activeFilter === dateFilter.key && styles.filterActive
            ]}
            onPress={() => setActiveFilter(dateFilter.key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === dateFilter.key && styles.filterActiveText
            ]}>
              {dateFilter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {activeFilter === 'all' ? (
        <SectionList
          sections={filteredTasks}
          renderItem={renderTaskItem}
          renderSectionHeader={({ section: { title, data } }) => 
            data.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            ) : null
          }
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
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {isLoading ? 'Загрузка задач...' : 'Пока нет активных задач'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContainer,
            filteredTasks.length === 0 && styles.listContainerEmpty
          ]}
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
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {isLoading ? 'Загрузка задач...' : 'На этот день нет работы'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  filtersScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A8A8A8',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#A8A8A8',
  },
  filterActive: {
    backgroundColor: '#1B84F1',
    borderColor: '#1B84F1',
  },
  filterActiveText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 16,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 120,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#51A2EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A090E',
    flex: 1,
    marginRight: 10,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B84F1',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    color: '#777',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#A8A8A8',
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A090E',
  },
  location: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    marginLeft: 4,
    color: '#777',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#1B84F1',
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonApplied: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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

