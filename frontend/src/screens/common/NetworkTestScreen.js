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

export default function NetworkTestScreen({ navigation }) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const testUrls = [
    'http://10.236.245.121:8000/health',
    'http://localhost:8000/health',
    'http://127.0.0.1:8000/health',
  ];

  const testConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    for (const url of testUrls) {
      try {
        console.log(`Testing: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setTestResults(prev => [...prev, {
            url,
            status: 'success',
            message: `✅ Успешно: ${JSON.stringify(data)}`
          }]);
        } else {
          setTestResults(prev => [...prev, {
            url,
            status: 'error',
            message: `❌ HTTP ${response.status}`
          }]);
        }
      } catch (error) {
        setTestResults(prev => [...prev, {
          url,
          status: 'error',
          message: `❌ ${error.message}`
        }]);
      }
    }
    
    setIsLoading(false);
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
        <Text style={styles.headerTitle}>Тест сети</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Проверка подключения к backend</Text>
          
          <TouchableOpacity
            style={[styles.testButton, isLoading && styles.disabledButton]}
            onPress={testConnection}
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
            <Text style={styles.sectionTitle}>Результаты</Text>
            {testResults.map((result, index) => (
              <View 
                key={index} 
                style={[
                  styles.resultItem,
                  result.status === 'success' ? styles.successResult : styles.errorResult
                ]}
              >
                <Text style={styles.resultUrl}>{result.url}</Text>
                <Text style={styles.resultMessage}>{result.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Инструкции</Text>
          <Text style={styles.instruction}>
            1. Убедитесь, что backend запущен:{'\n'}
            cd backend && python run.py
          </Text>
          <Text style={styles.instruction}>
            2. Проверьте IP адрес ноутбука:{'\n'}
            ipconfig (найдите 192.168.x.x)
          </Text>
          <Text style={styles.instruction}>
            3. Обновите IP в коде:{'\n'}
            frontend/src/utils/api.js
          </Text>
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
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
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
    marginBottom: 10,
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
  resultUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  resultMessage: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
});