import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocalTasksService from '../utils/localTasks';
import DebugLocalTasksService from '../utils/debugLocalTasks';
import { validateAddressComplete } from '../utils/addressValidator';

export default function SimpleAddTaskScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    count_people: '1',
    date: '',
    time: '',
    address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputFocus = (fieldName) => {
    setTimeout(() => {
      const inputRef = inputRefs.current[fieldName];
      if (inputRef && scrollViewRef.current) {
        inputRef.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 100,
              animated: true,
            });
          },
          () => {}
        );
      }
    }, 100);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Ошибка', 'Введите название задачи');
      return false;
    }
    if (!formData.price || isNaN(formData.price) || parseInt(formData.price) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную цену');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Ошибка', 'Введите адрес');
      return false;
    }
    if (!formData.date.trim()) {
      Alert.alert('Ошибка', 'Введите дату (например: 15.09.2024)');
      return false;
    }
    if (!formData.time.trim()) {
      Alert.alert('Ошибка', 'Введите время (например: 10:00)');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Проверяем адрес перед созданием задачи
    setIsValidatingAddress(true);
    try {
      const addressValidation = await validateAddressComplete(formData.address, true);
      
      if (!addressValidation.isValid) {
        setIsValidatingAddress(false);
        Alert.alert(
          'Проблема с адресом',
          addressValidation.error + (addressValidation.suggestions?.length > 0 
            ? `\n\nВозможные варианты:\n• ${addressValidation.suggestions.join('\n• ')}`
            : ''),
          [
            { text: 'Исправить', onPress: () => {
              // Фокусируемся на поле адреса
              // В простом экране пользователь может исправить адрес вручную
            }},
            { 
              text: 'Создать как есть', 
              style: 'destructive',
              onPress: () => proceedWithTaskCreation()
            }
          ]
        );
        return;
      }

      // Адрес валиден, продолжаем создание задачи
      proceedWithTaskCreation();
      
    } catch (error) {
      setIsValidatingAddress(false);
      console.error('Ошибка валидации адреса:', error);
      Alert.alert(
        'Ошибка проверки адреса',
        'Не удалось проверить адрес. Продолжить создание задачи?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Продолжить', 
            onPress: () => proceedWithTaskCreation()
          }
        ]
      );
    }
  };

  const proceedWithTaskCreation = async () => {
    setIsValidatingAddress(false);
    setIsLoading(true);
    
    try {
      // Создаем объект новой задачи
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        count_people: parseInt(formData.count_people),
        date: formData.date,
        time: formData.time,
        address: formData.address.trim(),
      };
      
      console.log('Создаем задачу с данными:', taskData);
      
      // Сохраняем задачу локально (используем debug версию)
      const newTask = await DebugLocalTasksService.addUserTask(taskData);
      console.log('Новая задача создана:', newTask);
      
      setIsLoading(false);
      
      Alert.alert(
        'Успешно!', 
        'Задача создана и добавлена в ваш список',
        [
          {
            text: 'Посмотреть мои задачи',
            onPress: () => {
              // Очищаем форму
              setFormData({
                title: '',
                description: '',
                price: '',
                count_people: '1',
                date: '',
                time: '',
                address: '',
              });
              
              // Переходим к моим задачам
              navigation.navigate('MyTasks');
            }
          },
          {
            text: 'Создать еще',
            onPress: () => {
              // Очищаем форму для создания новой задачи
              setFormData({
                title: '',
                description: '',
                price: '',
                count_people: '1',
                date: '',
                time: '',
                address: '',
              });
            }
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Ошибка создания задачи:', error);
      
      // Правильно обрабатываем ошибку
      const errorMessage = error?.message || error?.toString() || 'Неизвестная ошибка';
      Alert.alert('Ошибка', `Не удалось создать задачу: ${errorMessage}`);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Создать задачу</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Название задачи */}
          <View style={styles.inputGroup} ref={(ref) => inputRefs.current['title'] = ref}>
            <Text style={styles.label}>Название задачи *</Text>
            <TextInput
              style={styles.input}
              placeholder="Например: Уборка квартиры"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              onFocus={() => handleInputFocus('title')}
              maxLength={100}
            />
          </View>

          {/* Описание */}
          <View style={styles.inputGroup} ref={(ref) => inputRefs.current['description'] = ref}>
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Подробное описание задачи..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              onFocus={() => handleInputFocus('description')}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Цена и количество людей */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]} ref={(ref) => inputRefs.current['price'] = ref}>
              <Text style={styles.label}>Цена (сом) *</Text>
              <TextInput
                style={styles.input}
                placeholder="5000"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                onFocus={() => handleInputFocus('price')}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]} ref={(ref) => inputRefs.current['count_people'] = ref}>
              <Text style={styles.label}>Людей нужно *</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={formData.count_people}
                onChangeText={(value) => handleInputChange('count_people', value)}
                onFocus={() => handleInputFocus('count_people')}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Дата и время */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Дата *</Text>
              <TextInput
                style={styles.input}
                placeholder="15.09.2024"
                value={formData.date}
                onChangeText={(value) => handleInputChange('date', value)}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Время *</Text>
              <TextInput
                style={styles.input}
                placeholder="10:00"
                value={formData.time}
                onChangeText={(value) => handleInputChange('time', value)}
              />
            </View>
          </View>

          {/* Адрес */}
          <View style={styles.inputGroup} ref={(ref) => inputRefs.current['address'] = ref}>
            <Text style={styles.label}>Адрес *</Text>
            <TextInput
              style={styles.input}
              placeholder="Бишкек, ул. Чуй 123"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              onFocus={() => handleInputFocus('address')}
              maxLength={200}
            />
          </View>

          {/* Кнопка создания */}
          <TouchableOpacity
            style={[styles.submitButton, (isLoading || isValidatingAddress) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || isValidatingAddress}
          >
            <Text style={styles.submitButtonText}>
              {isValidatingAddress ? 'Проверка адреса...' : isLoading ? 'Создание...' : 'Создать задачу'}
            </Text>
          </TouchableOpacity>

          {/* Подсказка */}
          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.hintText}>
              Адрес будет проверен в картах перед созданием задачи. После создания задача появится в списке и будет доступна другим пользователям
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  hintText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#007AFF',
    flex: 1,
    lineHeight: 20,
  },
});