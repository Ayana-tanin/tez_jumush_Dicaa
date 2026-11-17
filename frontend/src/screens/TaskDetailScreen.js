import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ApiService from '../utils/api';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await ApiService.getTask(taskId);
      setTask(data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить задачу');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const handleContact = () => {
    Alert.alert(
      'Связаться с заказчиком',
      'Выберите способ связи',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Позвонить', onPress: () => Linking.openURL('tel:+996555123456') },
        { text: 'Написать', onPress: () => navigation.navigate('Chats') },
      ]
    );
  };

  const handleApply = () => {
    Alert.alert(
      'Откликнуться на задачу',
      'Вы уверены, что хотите откликнуться на эту задачу?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Да, откликнуться', 
          onPress: () => {
            Alert.alert('Успешно!', 'Ваш отклик отправлен заказчику');
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text>Задача не найдена</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Детали задачи</Text>
        </View>

        {/* Task Info */}
        <View style={styles.content}>
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskPrice}>{task.price} сом</Text>
            
            {task.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Описание</Text>
                <Text style={styles.description}>{task.description}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Детали</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Требуется людей: {task.count_people}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Дата: {formatDate(task.date)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Время: {formatTime(task.time)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Адрес: {task.address}
                </Text>
              </View>

              {task.latitude && task.longitude && (
                <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginTop: 10 }}>
                  <WebView
                    originWhitelist={["*"]}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                    source={{ html: `<!DOCTYPE html>
                    <html lang='ru'>
                    <head>
                      <meta charset='UTF-8' />
                      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
                      <style>html,body,#map{height:100%;margin:0;padding:0}</style>
                      <script src='https://maps.api.2gis.ru/2.0/loader.js?pkg=full'></script>
                    </head>
                    <body>
                      <div id='map'></div>
                      <script>
                        (function(){
                          var lat = ${Number(''+(task.latitude)).toFixed(6)};
                          var lon = ${Number(''+(task.longitude)).toFixed(6)};
                          DG.then(function(){
                            var map = DG.map('map', { center: [lat, lon], zoom: 16, dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false });
                            DG.marker([lat, lon]).addTo(map);
                          });
                        })();
                      </script>
                    </body>
                    </html>` }}
                  />
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.detailText}>
                  Статус: {task.status === 'active' ? 'Активна' : task.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContact}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          <Text style={styles.contactButtonText}>Связаться</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.applyButtonText}>Откликнуться</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
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
    padding: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  taskPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  contactButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});