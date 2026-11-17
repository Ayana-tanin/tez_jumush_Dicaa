import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Мемоизированный компонент задачи
const TaskItem = memo(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskPrice}>{item.price} сом</Text>
      <Text style={styles.taskAddress}>{item.address}</Text>
    </TouchableOpacity>
  );
});

// Мемоизированная кнопка заголовка
const HeaderButton = memo(({ iconName, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={iconName} size={20} color="white" />
    </TouchableOpacity>
  );
});

export default function FastTasksScreen({ navigation }) {
  // Статичные данные для максимальной производительности
  const tasks = [
    { id: 1, title: 'Уборка квартиры', price: 5000, address: 'Бишкек, ул. Чуй 123' },
    { id: 2, title: 'Посадка картофеля', price: 3000, address: 'Токмок, дачный участок' },
    { id: 3, title: 'Ремонт компьютера', price: 8000, address: 'Бишкек, ул. Советская 45' },
  ];

  // Мемоизированные обработчики
  const handleTaskPress = useCallback((task) => {
    Alert.alert('Задача', `Выбрана: ${task.title}`, [{ text: 'OK' }]);
  }, []);

  const handleAddTask = useCallback(() => {
    navigation.navigate('UltraSimpleAddTask');
  }, [navigation]);

  const handleSettings = useCallback(() => {
    Alert.alert('Настройки', 'Настройки приложения', [{ text: 'OK' }]);
  }, []);

  // Мемоизированный рендер элемента
  const renderItem = useCallback(({ item }) => (
    <TaskItem item={item} onPress={handleTaskPress} />
  ), [handleTaskPress]);

  // Мемоизированный keyExtractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      {/* Оптимизированный заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Задачи</Text>
        <View style={styles.headerButtons}>
          <HeaderButton iconName="add" onPress={handleAddTask} />
          <HeaderButton iconName="settings-outline" onPress={handleSettings} />
        </View>
      </View>

      {/* Быстрые тестовые кнопки */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => Alert.alert('Быстро!', 'Кнопка 1')}
          activeOpacity={0.8}
        >
          <Text style={styles.quickButtonText}>Быстрая кнопка 1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, styles.quickButton2]}
          onPress={() => Alert.alert('Быстро!', 'Кнопка 2')}
          activeOpacity={0.8}
        >
          <Text style={styles.quickButtonText}>Быстрая кнопка 2</Text>
        </TouchableOpacity>
      </View>

      {/* Оптимизированный список */}
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
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
  quickActions: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  quickButton2: {
    backgroundColor: '#FF9800',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 14,
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
    height: 105, // Фиксированная высота для getItemLayout
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  taskAddress: {
    fontSize: 14,
    color: '#666',
  },
});