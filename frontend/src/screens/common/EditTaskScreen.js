import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../../context/TasksContext';
import GoogleAuthService from '../../utils/googleAuth';

export default function EditTaskScreen({ navigation, route }) {
  const { task } = route.params || {};
  const { updateTask } = useTasks();
  const [userRole, setUserRole] = useState(null);
  
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    price: task.price?.toString() || '',
    count_people: task.count_people?.toString() || '1',
    date: task.date ? new Date(task.date) : new Date(),
    timeFrom: task.time_from ? new Date(`2000-01-01T${task.time_from}:00`) : new Date(),
    timeTo: task.time_to ? new Date(`2000-01-01T${task.time_to}:00`) : new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    address: task.address || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeFromPicker, setShowTimeFromPicker] = useState(false);
  const [showTimeToPicker, setShowTimeToPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  // Загрузка роли пользователя и проверка доступа
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const authStatus = await GoogleAuthService.checkAuthStatus();
        if (authStatus.isAuthenticated && authStatus.user) {
          setUserRole(authStatus.user.role);
          
          // Если работник пытается редактировать задачу - запрещаем доступ
          if (authStatus.user.role === 'worker') {
            Alert.alert(
              'Доступ запрещен',
              'Работники не могут редактировать задачи. Эта функция доступна только для работодателей.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };
    
    loadUserRole();
  }, [navigation]);

  // Отслеживание изменений
  useEffect(() => {
    const originalData = {
      title: task.title || '',
      description: task.description || '',
      price: task.price?.toString() || '',
      count_people: task.count_people?.toString() || '1',
      address: task.address || '',
    };

    const currentData = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      count_people: formData.count_people,
      address: formData.address,
    };

    const changed = JSON.stringify(originalData) !== JSON.stringify(currentData);
    setHasChanges(changed);
  }, [formData, task]);

  // Очистка состояния при потере фокуса
  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowDatePicker(false);
        setShowTimeFromPicker(false);
        setShowTimeToPicker(false);
        setIsLoading(false);
      };
    }, [])
  );

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (event?.type === 'set' && selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, []);

  const handleTimeFromChange = useCallback((event, selectedTime) => {
    setShowTimeFromPicker(false);
    if (event?.type === 'set' && selectedTime) {
      setFormData(prev => ({
        ...prev,
        timeFrom: selectedTime
      }));
    }
  }, []);

  const handleTimeToChange = useCallback((event, selectedTime) => {
    setShowTimeToPicker(false);
    if (event?.type === 'set' && selectedTime) {
      setFormData(prev => ({
        ...prev,
        timeTo: selectedTime
      }));
    }
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
    if (!formData.count_people || isNaN(formData.count_people) || parseInt(formData.count_people) <= 0) {
      Alert.alert('Ошибка', 'Введите количество людей');
      return false;
    }

    // Проверяем время
    const timeFromMinutes = formData.timeFrom.getHours() * 60 + formData.timeFrom.getMinutes();
    const timeToMinutes = formData.timeTo.getHours() * 60 + formData.timeTo.getMinutes();
    
    if (timeToMinutes <= timeFromMinutes) {
      const diffMinutes = (24 * 60) - timeFromMinutes + timeToMinutes;
      if (diffMinutes > 12 * 60) {
        Alert.alert('Ошибка', 'Максимальная продолжительность работы - 12 часов');
        return false;
      }
    } else {
      const diffMinutes = timeToMinutes - timeFromMinutes;
      if (diffMinutes < 30) {
        Alert.alert('Ошибка', 'Минимальная продолжительность работы - 30 минут');
        return false;
      }
      if (diffMinutes > 12 * 60) {
        Alert.alert('Ошибка', 'Максимальная продолжительность работы - 12 часов');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      Alert.alert('Информация', 'Нет изменений для сохранения');
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        count_people: parseInt(formData.count_people) || 1,
        date: formData.date.toISOString().split('T')[0],
        time_from: formData.timeFrom.toTimeString().split(' ')[0].slice(0, 5),
        time_to: formData.timeTo.toTimeString().split(' ')[0].slice(0, 5),
        address: formData.address.trim(),
        updated_at: new Date().toISOString(),
      };
      
      updateTask(task.id, updatedData);
      
      setIsLoading(false);
      
      Alert.alert(
        'Успешно!', 
        `Задача "${formData.title}" обновлена!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('EditTaskScreen: Ошибка обновления задачи:', error);
      Alert.alert('Ошибка', 'Не удалось обновить задачу');
    }
  };

  const handleGoBack = useCallback(() => {
    if (isLoading) {
      Alert.alert('Подождите', 'Идет сохранение изменений...');
      return;
    }

    if (hasChanges) {
      Alert.alert(
        'Несохраненные изменения',
        'У вас есть несохраненные изменения. Что вы хотите сделать?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Выйти без сохранения', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Сохранить',
            onPress: handleSave
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, isLoading, navigation, handleSave]);

  // Обработчик аппаратной кнопки "Назад"
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges || isLoading) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Несохраненные изменения',
        'У вас есть несохраненные изменения. Что вы хотите сделать?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Выйти без сохранения', 
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action)
          },
          {
            text: 'Сохранить',
            onPress: async () => {
              await handleSave();
              navigation.dispatch(e.data.action);
            }
          }
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, isLoading, handleSave]);

  // Если работник - не показываем форму
  if (userRole === 'worker') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редактировать задачу</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Работники не могут редактировать задачи.{'\n'}Эта функция доступна только для работодателей.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать задачу</Text>
        {hasChanges && (
          <View style={styles.changesIndicator}>
            <Ionicons name="ellipse" size={8} color="#FF9500" />
          </View>
        )}
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
              onFocus={() => {
                setTimeout(() => {
                  const inputRef = inputRefs.current['title'];
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
              }}
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
              onFocus={() => {
                setTimeout(() => {
                  const inputRef = inputRefs.current['description'];
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
              }}
              multiline
              numberOfLines={3}
              maxLength={200}
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
                onFocus={() => {
                  setTimeout(() => {
                    const inputRef = inputRefs.current['price'];
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
                }}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]} ref={(ref) => inputRefs.current['count_people'] = ref}>
              <Text style={styles.label}>Людей нужно</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={formData.count_people}
                onChangeText={(value) => handleInputChange('count_people', value)}
                onFocus={() => {
                  setTimeout(() => {
                    const inputRef = inputRefs.current['count_people'];
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
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Дата */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Дата *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.dateTimeText}>{formatDate(formData.date)}</Text>
            </TouchableOpacity>
          </View>

          {/* Время от и до */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Время от *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimeFromPicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.dateTimeText}>{formatTime(formData.timeFrom)}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Время до *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimeToPicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.dateTimeText}>{formatTime(formData.timeTo)}</Text>
              </TouchableOpacity>
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
              onFocus={() => {
                setTimeout(() => {
                  const inputRef = inputRefs.current['address'];
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
              }}
              maxLength={200}
            />
          </View>

          {/* Кнопки */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.saveButton,
                (!hasChanges || isLoading) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Информация */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Изменения сохраняются автоматически в локальное хранилище.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time From Picker */}
      {showTimeFromPicker && (
        <DateTimePicker
          value={formData.timeFrom}
          mode="time"
          display="default"
          onChange={handleTimeFromChange}
        />
      )}

      {/* Time To Picker */}
      {showTimeToPicker && (
        <DateTimePicker
          value={formData.timeTo}
          mode="time"
          display="default"
          onChange={handleTimeToChange}
        />
      )}
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
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  changesIndicator: {
    marginLeft: 10,
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
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dateTimeButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  button: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#007AFF',
    flex: 1,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});