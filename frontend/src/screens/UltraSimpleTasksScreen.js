import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UltraSimpleTasksScreen({ navigation }) {
  // Простые статичные данные
  const tasks = [
    {
      id: 1,
      title: 'Уборка квартиры',
      price: 5000,
      address: 'Бишкек, ул. Чуй 123',
    },
    {
      id: 2,
      title: 'Посадка картофеля',
      price: 3000,
      address: 'Токмок, дачный участок',
    },
  ];

  const handleTaskPress = (task) => {
    Alert.alert('Задача', `Выбрана: ${task.title}`);
  };

  const handleAddTask = () => {
    console.log('Переход к созданию задачи');
    navigation.navigate('UltraSimpleAddTask');
  };

  const handleSettings = () => {
    Alert.alert('Настройки', 'Настройки приложения');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Задачи</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddTask}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Доступные задачи</Text>
        
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => handleTaskPress(task)}
            activeOpacity={0.7}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskPrice}>{task.price} сом</Text>
            <Text style={styles.taskAddress}>{task.address}</Text>
          </TouchableOpacity>
        ))}

        {/* Test Buttons */}
        <View style={styles.testSection}>          
        
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
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
  testSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  testButton2: {
    backgroundColor: '#4CAF50',
  },
  testButton3: {
    backgroundColor: '#FF9800',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});