import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TasksContext';

export default function WorkerTaskDetailScreen({ route, navigation }) {
  const { task } = route.params || {};
  const { applyToTask, hasAppliedToTask, getApplicationStatus, taskApplications } = useTasks();
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  // Если задача не передана, используем тестовые данные
  const taskData = task || {
    id: 1,
    title: 'Уборка квартиры',
    price: 5000,
    count_people: 2,
    date: '2024-09-15',
    time_from: '10:00',
    time_to: '14:00',
    address: 'Бишкек, ул. Чуй 123',
    description: 'Нужна уборка 3-комнатной квартиры. Включить мытье окон, полов, санузла. Работа займет примерно 4-5 часов.',
    status: 'active',
    creator_name: 'Айгуль К.',
    rating: 4.8,
    phone: '+996555123456',
  };

  useEffect(() => {
    if (taskData?.id) {
      const applied = hasAppliedToTask(taskData.id);
      if (applied) {
        const status = getApplicationStatus(taskData.id);
        setApplicationStatus(status);
        
        // Найти applicationId для этой задачи
        const application = taskApplications.find(app => app.taskId === taskData.id);
        if (application) {
          setApplicationId(application.id);
        }
      } else {
        setApplicationStatus(null);
        setApplicationId(null);
      }
    }
  }, [taskData?.id, hasAppliedToTask, getApplicationStatus, taskApplications]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Время не указано';
    return timeString.slice(0, 5);
  };

  const formatTimeRange = (timeFrom, timeTo) => {
    if (timeFrom && timeTo) {
      return `${formatTime(timeFrom)} - ${formatTime(timeTo)}`;
    }
    return timeFrom ? formatTime(timeFrom) : 'Время не указано';
  };

  const handleApply = () => {
    if (applicationStatus) {
      const statusText = {
        pending: 'Ожидает подтверждения',
        accepted: 'Принят заказчиком',
        rejected: 'Отклонен заказчиком',
      }[applicationStatus] || 'Отклик отправлен';
      
      Alert.alert('Информация', `${statusText}\n\nВы уже откликнулись на эту задачу`);
      return;
    }

    Alert.alert(
      'Откликнуться на задачу',
      `Вы хотите откликнуться на задачу "${taskData.title}"?\n\nВаш отклик будет отправлен заказчику для рассмотрения.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Да, откликнуться', 
          onPress: () => {
            const success = applyToTask(taskData.id);
            if (success) {
              setApplicationStatus('pending');
              Alert.alert('Успешно!', 'Ваш отклик отправлен заказчику. Ожидайте подтверждения!');
            } else {
              Alert.alert('Ошибка', 'Не удалось отправить отклик');
            }
          }
        },
      ]
    );
  };

  const handleContact = () => {
    const chatId = applicationId 
      ? `task_${taskData.id}_app_${applicationId}`
      : `task_${taskData.id}_worker`;
    
    navigation.navigate('Chat', {
      chatId: chatId,
      chatTitle: taskData.title,
      otherUserName: taskData.creator_name || 'Работодатель',
      applicationId: applicationId,
      taskId: taskData.id,
    });
  };

  // Получаем текст кнопки в зависимости от статуса
  const getButtonText = () => {
    if (!applicationStatus) {
      return 'Откликнуться';
    }
    
    switch (applicationStatus) {
      case 'pending':
        return 'Ожидает ответа';
      case 'accepted':
        return 'Принят';
      case 'rejected':
        return 'Отклонен';
      default:
        return 'Откликнуться';
    }
  };

  // Получаем цвет кнопки в зависимости от статуса
  const getButtonStyle = () => {
    if (!applicationStatus) {
      return styles.applyButton;
    }
    
    switch (applicationStatus) {
      case 'pending':
        return styles.pendingButton;
      case 'accepted':
        return styles.acceptedButton;
      case 'rejected':
        return styles.rejectedButton;
      default:
        return styles.applyButton;
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0A090E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Детали задачи</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Card */}
        <View style={styles.titleCard}>
          <Text style={styles.taskTitle}>{taskData.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.taskPrice}>{taskData.price}</Text>
            <Text style={styles.currency}>сом</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Активна</Text>
          </View>
        </View>

        {/* Description Card */}
        {taskData.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Описание</Text>
            <Text style={styles.description}>{taskData.description}</Text>
          </View>
        )}

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Детали работы</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={18} color="#1B84F1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Требуется людей</Text>
              <Text style={styles.detailValue}>{taskData.count_people} человека</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={18} color="#1B84F1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Дата</Text>
              <Text style={styles.detailValue}>{formatDate(taskData.date)}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="time" size={18} color="#1B84F1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Время</Text>
              <Text style={styles.detailValue}>
                {taskData.time_from && taskData.time_to 
                  ? formatTimeRange(taskData.time_from, taskData.time_to)
                  : formatTime(taskData.time || taskData.time_from)
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={18} color="#1B84F1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Адрес</Text>
              <Text style={styles.detailValue}>{taskData.address}</Text>
            </View>
          </View>
        </View>

        {/* Employer Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Заказчик</Text>
          
          <View style={styles.employerRow}>
            <View style={styles.employerAvatar}>
              <Text style={styles.employerInitial}>
                {(taskData.creator_name || 'А')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.employerInfo}>
              <Text style={styles.employerName}>{taskData.creator_name || 'Заказчик'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{taskData.rating || '5.0'}</Text>
                <Text style={styles.reviewsText}>(24 отзыва)</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.chatIcon}
              onPress={handleContact}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#1B84F1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={getButtonStyle()}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={applicationStatus ? "checkmark-circle" : "add-circle"} 
            size={22} 
            color="white" 
          />
          <Text style={styles.applyButtonText}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#51A2EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A090E',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#51A2EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A090E',
    marginBottom: 15,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  taskPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B84F1',
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B84F1',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#51A2EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A090E',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A090E',
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1B84F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employerInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employerInfo: {
    flex: 1,
  },
  employerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A090E',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A090E',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 6,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B84F1',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#1B84F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rejectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

