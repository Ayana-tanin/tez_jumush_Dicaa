import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testApiConnection } from '../utils/testConnection';
import ApiService from '../utils/api';

export default function ConnectionTestScreen({ navigation }) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Тест подключения
      const workingUrl = await testApiConnection();
      
      if (workingUrl) {
        setTestResults(prev => [...prev, {
          type: 'success',
          message: `✅ Подключение успешно: ${workingUrl}`
        }]);
        
        // Тест API endpoints
        try {
          const healthCheck = await fetch(`${workingUrl}/health`);
          const healthData = await healthCheck.json();
          
          setTestResults(prev => [...prev, {
            type: 'success',
            message: `✅ Health check: ${JSON.stringify(healthData)}`
          }]);
        } catch (error) {
          setTestResults(prev => [...prev, {
            type: 'error',
            message: `❌ Health check failed: ${error.message}`
          }]);
        }
        
        // Тест получения задач
        try {
          const tasks = await ApiService.getTasks();
          setTestResults(prev => [...prev, {
            type: 'success',
            message: `✅ Задачи загружены: ${tasks.length} шт.`
          }]);
        } catch (error) {
          setTestResults(prev => [...prev, {
            type: 'error',
            message: `❌ Ошибка загрузки задач: ${error.message}`
          }]);
        }
        
      } else {
        setTestResults([{
          type: 'error',
          message: '❌ Не удалось подключиться к API серверу'
        }]);
      }
    } catch (error) {
      setTestResults([{
        type: 'error',
        message: `❌ Ошибка тестирования: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Тест подключения</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Проверка подключения к API</Text>
          <Text style={styles.description}>
            Этот тест поможет определить, работает ли подключение к backend серверу.
          </Text>
          
          <TouchableOpacity
            style={[styles.testButton, isLoading && styles.testButtonDisabled]}
            onPress={runConnectionTest}
            disabled={isLoading}
          >
            <Ionicons 
              name={isLoading ? "hourglass-outline" : "play-circle-outline"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.testButtonText}>
              {isLoading ? 'Тестирование...' : 'Запустить тест'}
            </Text>
          </TouchableOpacity>
        </View>

        {testResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Результаты теста</Text>
            {testResults.map((result, index) => (
              <View 
                key={index} 
                style={[
                  styles.resultItem,
                  result.type === 'success' ? styles.successResult : styles.errorResult
                ]}
              >
                <Text style={styles.resultText}>{result.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Инструкции по устранению проблем</Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionTitle}>1. Убедитесь, что backend запущен</Text>
            <Text style={styles.instructionText}>
              Запустите: docker-compose up backend или python run.py
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionTitle}>2. Проверьте IP адрес</Text>
            <Text style={styles.instructionText}>
              Для физического устройства используйте IP вашего компьютера вместо localhost
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionTitle}>3. Проверьте firewall</Text>
            <Text style={styles.instructionText}>
              Убедитесь, что порт 8000 не заблокирован firewall
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  successResult: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  errorResult: {
    backgroundColor: '#ffeaea',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  instructionItem: {
    marginBottom: 15,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});