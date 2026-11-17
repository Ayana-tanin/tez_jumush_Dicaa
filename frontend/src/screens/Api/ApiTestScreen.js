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
import { testApiConnection, testTaskCreation, getTestTaskData } from '../utils/connectionTest';

export default function ApiTestScreen({ navigation }) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test, result) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [{
      id: Date.now(),
      test,
      result,
      timestamp,
      success: result.success
    }, ...prev]);
  };

  const runConnectionTest = async () => {
    setIsLoading(true);
    const result = await testApiConnection();
    addTestResult('Проверка подключения', result);
    setIsLoading(false);
    
    Alert.alert(
      result.success ? 'Успешно' : 'Ошибка',
      result.message
    );
  };

  const runTaskCreationTest = async () => {
    setIsLoading(true);
    const testData = getTestTaskData();
    const result = await testTaskCreation(testData);
    addTestResult('Создание задачи', result);
    setIsLoading(false);
    
    Alert.alert(
      result.success ? 'Успешно' : 'Ошибка',
      result.success 
        ? `Задача создана с ID: ${result.task?.id}`
        : result.error
    );
  };

  const clearResults = () => {
    setTestResults([]);
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
        <Text style={styles.headerTitle}>Тест API</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Test Buttons */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Тесты подключения</Text>
          
          <TouchableOpacity
            style={[styles.testButton, styles.primaryButton]}
            onPress={runConnectionTest}
            disabled={isLoading}
          >
            <Ionicons name="wifi" size={20} color="white" />
            <Text style={styles.buttonText}>Проверить подключение</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.secondaryButton]}
            onPress={runTaskCreationTest}
            disabled={isLoading}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.buttonText}>Тест создания задачи</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.clearButton]}
            onPress={clearResults}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.buttonText}>Очистить результаты</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Результаты тестов</Text>
          
          {testResults.length === 0 ? (
            <View style={styles.emptyResults}>
              <Ionicons name="flask-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Нет результатов тестов</Text>
            </View>
          ) : (
            testResults.map((result) => (
              <View 
                key={result.id} 
                style={[
                  styles.resultCard,
                  result.success ? styles.successCard : styles.errorCard
                ]}
              >
                <View style={styles.resultHeader}>
                  <Ionicons 
                    name={result.success ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={result.success ? "#4CAF50" : "#f44336"} 
                  />
                  <Text style={styles.resultTest}>{result.test}</Text>
                  <Text style={styles.resultTime}>{result.timestamp}</Text>
                </View>
                <Text style={styles.resultMessage}>
                  {result.result.message || result.result.error || 'Тест выполнен'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Инструкции</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>Для работы с базой данных:</Text>
            <Text style={styles.instructionText}>
              1. Запустите backend: setup-database.bat{'\n'}
              2. Проверьте подключение кнопкой выше{'\n'}
              3. Протестируйте создание задачи{'\n'}
              4. При успехе - задачи будут сохраняться в БД
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
  testSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
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
  resultsSection: {
    marginBottom: 30,
  },
  emptyResults: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instructionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});