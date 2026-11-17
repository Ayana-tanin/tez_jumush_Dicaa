import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SyncService from '../utils/syncService';
import ApiService from '../utils/api';

export default function SyncStatusScreen({ navigation }) {
  const [syncStatus, setSyncStatus] = useState(SyncService.getSyncStatus());
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Обновление статуса каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(SyncService.getSyncStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Проверка подключения при загрузке
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const isConnected = await ApiService.checkConnection();
    setConnectionStatus(isConnected);
  };

  const handleToggleAutoSync = (enabled) => {
    setIsAutoSyncEnabled(enabled);
    
    if (enabled) {
      SyncService.startSync(30000);
      Alert.alert('Включено', 'Автоматическая синхронизация включена');
    } else {
      SyncService.stopSync();
      Alert.alert('Выключено', 'Автоматическая синхронизация выключена');
    }
  };

  const handleManualSync = async () => {
    try {
      Alert.alert('Синхронизация', 'Выполняется синхронизация...');
      await SyncService.forcSync();
      setLastSyncResult({ success: true, time: new Date() });
      Alert.alert('Успешно', 'Синхронизация завершена');
    } catch (error) {
      setLastSyncResult({ success: false, error: error.message, time: new Date() });
      Alert.alert('Ошибка', 'Не удалось выполнить синхронизацию');
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Никогда';
    return new Date(date).toLocaleTimeString('ru-RU');
  };

  const formatDate = (date) => {
    if (!date) return 'Никогда';
    return new Date(date).toLocaleString('ru-RU');
  };

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
        <Text style={styles.headerTitle}>Синхронизация</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статус подключения</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons 
                name={connectionStatus ? "wifi" : "wifi-off"} 
                size={24} 
                color={connectionStatus ? "#4CAF50" : "#f44336"} 
              />
              <View style={styles.statusInfo}>
                <Text style={styles.statusText}>
                  {connectionStatus ? 'Подключено к серверу' : 'Сервер недоступен'}
                </Text>
                <Text style={styles.statusSubtext}>
                  {connectionStatus 
                    ? 'Синхронизация работает' 
                    : 'Работа в оффлайн режиме'
                  }
                </Text>
              </View>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={checkConnection}
              >
                <Ionicons name="refresh" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки синхронизации</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Автоматическая синхронизация</Text>
                <Text style={styles.settingDescription}>
                  Получать новые отклики каждые 30 секунд
                </Text>
              </View>
              <Switch
                value={isAutoSyncEnabled}
                onValueChange={handleToggleAutoSync}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAutoSyncEnabled ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статус синхронизации</Text>
          
          <View style={styles.syncCard}>
            <View style={styles.syncRow}>
              <Ionicons 
                name={syncStatus.isRunning ? "sync" : "pause"} 
                size={20} 
                color={syncStatus.isRunning ? "#4CAF50" : "#FF9500"} 
              />
              <Text style={styles.syncLabel}>Состояние:</Text>
              <Text style={[
                styles.syncValue,
                { color: syncStatus.isRunning ? "#4CAF50" : "#FF9500" }
              ]}>
                {syncStatus.isRunning ? 'Активна' : 'Остановлена'}
              </Text>
            </View>
            
            <View style={styles.syncRow}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.syncLabel}>Последняя синхронизация:</Text>
              <Text style={styles.syncValue}>
                {formatTime(syncStatus.lastSyncTime)}
              </Text>
            </View>
            
            <View style={styles.syncRow}>
              <Ionicons name="timer" size={20} color="#666" />
              <Text style={styles.syncLabel}>Интервал:</Text>
              <Text style={styles.syncValue}>
                {syncStatus.interval ? '30 секунд' : 'Не установлен'}
              </Text>
            </View>
          </View>
        </View>

        {/* Last Sync Result */}
        {lastSyncResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Результат последней синхронизации</Text>
            
            <View style={[
              styles.resultCard,
              lastSyncResult.success ? styles.successCard : styles.errorCard
            ]}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={lastSyncResult.success ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={lastSyncResult.success ? "#4CAF50" : "#f44336"} 
                />
                <Text style={styles.resultTitle}>
                  {lastSyncResult.success ? 'Успешно' : 'Ошибка'}
                </Text>
                <Text style={styles.resultTime}>
                  {formatTime(lastSyncResult.time)}
                </Text>
              </View>
              
              {!lastSyncResult.success && (
                <Text style={styles.errorText}>
                  {lastSyncResult.error}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Manual Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Действия</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.syncButton]}
            onPress={handleManualSync}
          >
            <Ionicons name="sync" size={20} color="white" />
            <Text style={styles.buttonText}>Синхронизировать сейчас</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={() => {
              Alert.alert('Тест', 'Генерируем тестовую заявку...');
              // Здесь можно добавить генерацию тестовой заявки
            }}
          >
            <Ionicons name="flask" size={20} color="white" />
            <Text style={styles.buttonText}>Тестовая заявка</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Как работает синхронизация</Text>
              <Text style={styles.infoText}>
                • Каждые 30 секунд проверяются новые отклики{'\n'}
                • При получении заявки показывается уведомление{'\n'}
                • Работает только при подключении к серверу{'\n'}
                • В оффлайн режиме используются локальные данные
              </Text>
            </View>
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
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  syncCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  syncValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
  },
  successCard: {
    borderLeftColor: '#4CAF50',
  },
  errorCard: {
    borderLeftColor: '#f44336',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#f44336',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#4CAF50',
  },
  testButton: {
    backgroundColor: '#FF9500',
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
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
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