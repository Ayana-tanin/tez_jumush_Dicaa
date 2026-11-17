import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TasksContext';
import { TaskStorage, clearAllStorage } from '../utils/localStorage';

export default function StorageManagementScreen({ navigation }) {
  const { 
    myTasks, 
    allTasks, 
    appliedTasks, 
    taskApplications, 
    isLoading,
    saveAllDataToStorage 
  } = useTasks();
  
  const [storageInfo, setStorageInfo] = useState(null);

  const getStorageInfo = async () => {
    try {
      const data = await TaskStorage.loadAllData();
      setStorageInfo({
        myTasks: data.myTasks.length,
        allTasks: data.allTasks.length,
        appliedTasks: data.appliedTasks.length,
        taskApplications: data.taskApplications.length,
        totalItems: data.myTasks.length + data.allTasks.length + data.appliedTasks.length + data.taskApplications.length,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить информацию о хранилище');
    }
  };

  const handleSaveData = async () => {
    try {
      await saveAllDataToStorage();
      Alert.alert('Успешно', 'Все данные сохранены в локальное хранилище');
      getStorageInfo();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Очистить хранилище',
      'Вы уверены, что хотите удалить все сохраненные данные? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllStorage();
              Alert.alert('Готово', 'Все данные удалены из хранилища');
              setStorageInfo(null);
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось очистить хранилище');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    const exportData = {
      myTasks,
      allTasks,
      appliedTasks,
      taskApplications,
      exportDate: new Date().toISOString(),
    };
    
    Alert.alert(
      'Экспорт данных',
      `Данные готовы к экспорту:\n\nМои задачи: ${myTasks.length}\nВсе задачи: ${allTasks.length}\nОтклики: ${appliedTasks.length}\nЗаявки: ${taskApplications.length}`,
      [
        { text: 'Закрыть' },
        { 
          text: 'Показать JSON', 
          onPress: () => {
            console.log('Export data:', JSON.stringify(exportData, null, 2));
            Alert.alert('Данные', 'JSON данные выведены в консоль');
          }
        }
      ]
    );
  };

  React.useEffect(() => {
    getStorageInfo();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Управление данными</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Текущие данные</Text>
          
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Ionicons name="briefcase" size={20} color="#007AFF" />
              <Text style={styles.dataLabel}>Мои задачи:</Text>
              <Text style={styles.dataValue}>{myTasks.length}</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Ionicons name="list" size={20} color="#4CAF50" />
              <Text style={styles.dataLabel}>Все задачи:</Text>
              <Text style={styles.dataValue}>{allTasks.length}</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FF9500" />
              <Text style={styles.dataLabel}>Мои отклики:</Text>
              <Text style={styles.dataValue}>{appliedTasks.length}</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Ionicons name="people" size={20} color="#9C27B0" />
              <Text style={styles.dataLabel}>Заявки на задачи:</Text>
              <Text style={styles.dataValue}>{taskApplications.length}</Text>
            </View>
          </View>
        </View>

        {/* Storage Info */}
        {storageInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Сохраненные данные</Text>
            
            <View style={styles.storageCard}>
              <View style={styles.storageRow}>
                <Text style={styles.storageLabel}>В хранилище:</Text>
                <Text style={styles.storageValue}>{storageInfo.totalItems} элементов</Text>
              </View>
              
              <View style={styles.storageDetails}>
                <Text style={styles.storageDetail}>Мои задачи: {storageInfo.myTasks}</Text>
                <Text style={styles.storageDetail}>Все задачи: {storageInfo.allTasks}</Text>
                <Text style={styles.storageDetail}>Отклики: {storageInfo.appliedTasks}</Text>
                <Text style={styles.storageDetail}>Заявки: {storageInfo.taskApplications}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Действия</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveData}
            disabled={isLoading}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.buttonText}>Сохранить данные</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.refreshButton]}
            onPress={getStorageInfo}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.buttonText}>Обновить информацию</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportData}
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.buttonText}>Экспорт данных</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearStorage}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.buttonText}>Очистить хранилище</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Автоматическое сохранение</Text>
            <Text style={styles.infoText}>
              Все изменения автоматически сохраняются в локальное хранилище устройства. 
              Данные остаются доступными после перезапуска приложения.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Синхронизация с сервером</Text>
            <Text style={styles.infoText}>
              При доступности backend данные также сохраняются на сервере. 
              Локальное хранилище используется как резервная копия.
            </Text>
          </View>
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
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  storageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  storageDetails: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  storageDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
  },
  exportButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});