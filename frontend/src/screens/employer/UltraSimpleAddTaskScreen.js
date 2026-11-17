import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../../context/TasksContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UltraSimpleAddTaskScreen({ navigation }) {
  const { addTask } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    count_people: '1',
    date: new Date(),
    timeFrom: new Date(new Date().setHours(9, 0, 0, 0)),
    timeTo: new Date(new Date().setHours(18, 0, 0, 0)),
    address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeFromPicker, setShowTimeFromPicker] = useState(false);
  const [showTimeToPicker, setShowTimeToPicker] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

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

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  // Проверка на наличие несохраненных данных
  const hasUnsavedData = useCallback(() => {
    return formData.title.trim() || 
           formData.description.trim() || 
           formData.price.trim() || 
           formData.address.trim() ||
           formData.count_people !== '1';
  }, [formData]);

  // Обработчик аппаратной кнопки "Назад" для Android
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedData() || isLoading) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Несохраненные данные',
        'У вас есть несохраненные изменения. Вы уверены, что хотите выйти?',
        [
          { text: 'Остаться', style: 'cancel' },
          { 
            text: 'Выйти', 
            style: 'destructive',
            onPress: () => {
              setIsLoading(false);
              setShowDatePicker(false);
              setShowTimeFromPicker(false);
              setShowTimeToPicker(false);
              navigation.dispatch(e.data.action);
            }
          }
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isLoading, hasUnsavedData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleInputFocus = useCallback((fieldName) => {
    setTimeout(() => {
      const inputRef = inputRefs.current[fieldName];
      if (inputRef && scrollViewRef.current) {
        inputRef.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 100, // Отступ сверху для видимости
              animated: true,
            });
          },
          () => {}
        );
      }
    }, 100);
  }, []);

  const safeNavigate = useCallback((routeName) => {
    try {
      if (navigation?.navigate) {
        navigation.navigate(routeName);
      }
    } catch (error) {
      console.error('Ошибка навигации:', error);
    }
  }, [navigation]);

  const handleDateChange = useCallback((event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event?.type === 'set' && selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, []);

  const handleTimeFromChange = useCallback((event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimeFromPicker(false);
    }
    
    if (event?.type === 'set' && selectedTime) {
      setFormData(prev => ({
        ...prev,
        timeFrom: selectedTime
      }));
    }
  }, []);

  const handleTimeToChange = useCallback((event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimeToPicker(false);
    }
    
    if (event?.type === 'set' && selectedTime) {
      setFormData(prev => ({
        ...prev,
        timeTo: selectedTime
      }));
    }
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Ошибка', 'Дата не может быть в прошлом');
      return false;
    }
    
    if (!formData.timeFrom || !formData.timeTo) {
      Alert.alert('Ошибка', 'Выберите время начала и окончания');
      return false;
    }
    
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        count_people: parseInt(formData.count_people) || 1,
        date: formData.date.toISOString().split('T')[0],
        time_from: formatTime(formData.timeFrom),
        time_to: formatTime(formData.timeTo),
        address: formData.address.trim(),
      };
      
      const newTask = await addTask(taskData);
      
      setIsLoading(false);
      
      Alert.alert(
        'Успешно!', 
        `Задача "${formData.title}" создана и сохранена в базу данных!`,
        [
          {
            text: 'Посмотреть все задачи',
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                price: '',
                count_people: '1',
                date: new Date(),
                timeFrom: new Date(new Date().setHours(9, 0, 0, 0)),
                timeTo: new Date(new Date().setHours(18, 0, 0, 0)),
                address: '',
              });
              navigation.goBack();
            }
          },
          {
            text: 'Мои задачи',
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                price: '',
                count_people: '1',
                date: new Date(),
                timeFrom: new Date(new Date().setHours(9, 0, 0, 0)),
                timeTo: new Date(new Date().setHours(18, 0, 0, 0)),
                address: '',
              });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.message || 'Неизвестная ошибка';
      Alert.alert(
        'Информация', 
        `Задача сохранена локально.\n\nПричина: ${errorMessage}\n\nЗадача будет синхронизирована с сервером при восстановлении подключения.`,
        [{ text: 'Понятно' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>Создание задачи</Text>

        {/* Название работы */}
        <View style={styles.card}>
          <TextInput
            ref={(ref) => inputRefs.current['title'] = ref}
            style={styles.input}
            placeholder="Название работы"
            placeholderTextColor="#B8B8B8"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            onFocus={() => handleInputFocus('title')}
            maxLength={100}
          />
        </View>

        {/* Описание дела */}
        <View style={[styles.card, styles.cardLarge]}>
          <TextInput
            ref={(ref) => inputRefs.current['description'] = ref}
            style={[styles.input, styles.textArea]}
            placeholder="Описание дела"
            placeholderTextColor="#B8B8B8"
            multiline
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            onFocus={() => handleInputFocus('description')}
            maxLength={200}
            textAlignVertical="top"
          />
        </View>

        {/* Оплата за 1 человека */}
        <View style={styles.card}>
          <View style={styles.rowContainer}>
            <TextInput
              ref={(ref) => inputRefs.current['price'] = ref}
              style={styles.inputFlex}
              placeholder="Оплата за 1 человека"
              placeholderTextColor="#B8B8B8"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              onFocus={() => handleInputFocus('price')}
            />
            <Text style={styles.suffixText}>сом</Text>
          </View>
        </View>

        {/* Кол-во человек */}
        <View style={styles.card}>
          <View style={styles.rowContainer}>
            <Text style={styles.placeholderText}>Кол-во человек</Text>
            <TextInput
              ref={(ref) => inputRefs.current['count_people'] = ref}
              style={styles.inputRight}
              placeholder="1"
              placeholderTextColor="#6D6767"
              keyboardType="numeric"
              value={formData.count_people}
              onChangeText={(value) => handleInputChange('count_people', value)}
              onFocus={() => handleInputFocus('count_people')}
            />
          </View>
        </View>

        {/* Дата */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.rowContainer}>
            <Text style={styles.labelText}>Дата</Text>
            <Text style={styles.valueText}>{formatDate(formData.date)}</Text>
          </View>
        </TouchableOpacity>

        {/* Время */}
        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Время</Text>
          <View style={styles.timeContainer}>
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => setShowTimeFromPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.timeLabel}>От</Text>
              <Text style={styles.timeValueText}>{formatTime(formData.timeFrom)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => setShowTimeToPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.timeLabel}>До</Text>
              <Text style={styles.timeValueText}>{formatTime(formData.timeTo)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Адрес */}
        <View style={styles.card}>
          <TextInput
            ref={(ref) => inputRefs.current['address'] = ref}
            style={styles.input}
            placeholder="Адрес"
            placeholderTextColor="#B8B8B8"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            onFocus={() => handleInputFocus('address')}
            maxLength={200}
          />
        </View>
        
        {/* Кнопка публикации */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Создание...' : 'Опубликовать задачу'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time From Picker */}
      {showTimeFromPicker && (
        <DateTimePicker
          value={formData.timeFrom}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeFromChange}
        />
      )}

      {/* Time To Picker */}
      {showTimeToPicker && (
        <DateTimePicker
          value={formData.timeTo}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 120,
  },
  subtitle: {
    fontSize: 16,
    color: '#0A090E',
    marginBottom: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    justifyContent: 'center',
    shadowColor: 'rgba(101, 183, 216, 0.25)',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 13.3,
    elevation: 5,
  },
  cardLarge: {
    height: 107,
    paddingVertical: 13,
  },
  input: {
    fontSize: 15,
    color: '#6D6767',
    padding: 0,
    fontWeight: '500',
    letterSpacing: -0.3,
    backgroundColor: 'transparent',
  },
  textArea: {
    height: '100%',
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    color: '#6D6767',
    padding: 0,
    fontWeight: '500',
    letterSpacing: -0.3,
    backgroundColor: 'transparent',
  },
  placeholderText: {
    fontSize: 15,
    color: '#B8B8B8',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  inputRight: {
    fontSize: 15,
    color: '#6D6767',
    padding: 0,
    fontWeight: '500',
    letterSpacing: -0.3,
    textAlign: 'right',
    minWidth: 30,
    backgroundColor: 'transparent',
  },
  suffixText: {
    fontSize: 15,
    color: '#6D6767',
    marginLeft: 8,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  labelText: {
    fontSize: 15,
    color: '#6D6767',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  valueText: {
    fontSize: 15,
    color: '#6D6767',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  timeSection: {
    marginBottom: 9,
  },
  timeSectionLabel: {
    fontSize: 15,
    color: '#6D6767',
    fontWeight: '500',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 38,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: 'rgba(101, 183, 216, 0.25)',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 13.3,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 15,
    color: '#6D6767',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  timeValueText: {
    fontSize: 15,
    color: '#6D6767',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 15,
    color: '#979797',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  mapLinkText: {
    fontSize: 15,
    color: '#1B84F1',
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  submitButton: {
    backgroundColor: '#1B84F1',
    borderRadius: 15,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});