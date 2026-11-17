import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../utils/api';

export default function TasksScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isWithinChuy = (lat, lon) => {
    const MIN_LAT = 41.80;
    const MAX_LAT = 43.60;
    const MIN_LON = 72.50;
    const MAX_LON = 77.00;
    return lat >= MIN_LAT && lat <= MAX_LAT && lon >= MIN_LON && lon <= MAX_LON;
  };

  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'today', label: 'Сегодня' },
    { id: 'week', label: 'На неделе' },
    { id: 'month', label: 'В этом ' },
  ];

  // Загрузка задач
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getTasks();
      const safe = (data || []).filter(t =>
        typeof t.latitude === 'number' && typeof t.longitude === 'number' &&
        isWithinChuy(t.latitude, t.longitude)
      );
      setTasks(safe);
    } catch (error) {
      console.error('Error loading tasks:', error);
      
      // Показываем более информативную ошибку
      Alert.alert(
        'Ошибка подключения', 
        error.message || 'Не удалось загрузить задачи. Проверьте подключение к интернету.',
        [
          { text: 'Повторить', onPress: loadTasks },
          { text: 'Отмена', style: 'cancel' }
        ]
      );
      
      // Устанавливаем пустой массив при ошибке
      setTasks([]);
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

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Форматирование времени
  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
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

      {typeof item.latitude === 'number' && typeof item.longitude === 'number' && (
        <View style={{ height: 140, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
          {/* Lightweight preview via 2GIS WebView */}
          <View style={{ flex: 1 }}>
            {require('react').createElement(require('react-native-webview').WebView, {
              originWhitelist: ['*'],
              style: { flex: 1 },
              javaScriptEnabled: true,
              domStorageEnabled: true,
              source: { html: `<!DOCTYPE html>
              <html lang='ru'>
              <head>
                <meta charset='UTF-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
                <style>html,body,#map{height:100%;margin:0;padding:0}</style>
                <script src='https://maps.api.2gis.ru/2.0/loader.js?pkg=full'></script>
              </head>
              <body>
                <div id='map'></div>
                <script>
                  (function(){
                    var lat = ${Number(''+(item.latitude)).toFixed(6)};
                    var lon = ${Number(''+(item.longitude)).toFixed(6)};
                    DG.then(function(){
                      var map = DG.map('map', { center: [lat, lon], zoom: 15, dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false });
                      DG.marker([lat, lon]).addTo(map);
                    });
                  })();
                </script>
              </body>
              </html>` }
            })}
          </View>
        </View>
      )}
      
      <View style={styles.taskFooter}>
        <Text style={styles.locationText}>{item.address}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status === 'active' ? 'Активна' : item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Новостной портал */}
      <View style={styles.newsSection}>
        <Text style={styles.newsTitle}>Кто мы такие?</Text>
        <Text style={styles.newsText}>
          Tez Jumush - это платформа для быстрого поиска работы и работников. 
          Мы помогаем людям найти подходящие задачи и заработать деньги.
        </Text>
      </View>

      {/* Поиск и фильтры */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск задач..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Список задач */}
      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Актуальные работы</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fce8e6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#f5c6c3' }}
            onPress={async () => {
              Alert.alert('Удалить задачи', 'Удалить все видимые задачи? Это действие нельзя отменить.', [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Удалить', style: 'destructive', onPress: async () => {
                  try {
                    const current = [...tasks];
                    const results = await Promise.allSettled(current.map(t => ApiService.deleteTask(t.id)));
                    const failed = results.filter(r => r.status === 'rejected').length;
                    await onRefresh();
                    if (failed > 0) {
                      Alert.alert('Готово', `Удалены не все. Ошибок: ${failed}`);
                    }
                  } catch (e) {
                    Alert.alert('Ошибка', e.message || 'Не удалось удалить задачи');
                  }
                }}
              ]);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#b00020" />
            <Text style={{ marginLeft: 6, color: '#b00020', fontWeight: '600' }}>Удалить все</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
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
                <View style={styles.emptyActions}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadTasks}
                  >
                    <Ionicons name="refresh" size={20} color="#007AFF" />
                    <Text style={styles.retryButtonText}>Повторить</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => navigation.navigate('ConnectionTest')}
                  >
                    <Ionicons name="settings" size={20} color="#666" />
                    <Text style={styles.testButtonText}>Тест подключения</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  newsSection: {
    backgroundColor: '#007AFF',
    padding: 20,
    marginBottom: 20,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  newsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
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
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  employerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  employerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
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
  emptyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
