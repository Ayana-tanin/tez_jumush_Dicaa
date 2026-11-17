import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleAuthService from '../../utils/googleAuth';
import ApiService from '../../utils/api';
import { useTasks } from '../../context/TasksContext';

const STORAGE_KEY = '@chat_messages_';

export default function ChatScreen({ route, navigation }) {
  const {
    chatId,
    applicationId,
    taskId,
  } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [application, setApplication] = useState(null);
  const [workerInfo, setWorkerInfo] = useState(null);
  const [backendChatId, setBackendChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const { acceptApplication, rejectApplication, getTaskApplications } = useTasks();

  // Загрузка роли пользователя
  useEffect(() => {
    loadUserRole();
  }, []);

  // Тестирование подключения к API при загрузке
  useEffect(() => {
    testApiConnection();
  }, []);

  // Загрузка информации о заявке и работнике
  useEffect(() => {
    if (applicationId && taskId) {
      loadApplicationInfo();
    }
  }, [applicationId, taskId]);

  // Загрузка сообщений
  useEffect(() => {
    loadMessages();
  }, [chatId, backendChatId]);

  // Инициализация чата при наличии applicationId и taskId
  useEffect(() => {
    if (applicationId && taskId) {
      initializeChat();
    }
  }, [applicationId, taskId]);

  const loadUserRole = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      if (authStatus.isAuthenticated && authStatus.user) {
        setUserRole(authStatus.user.role);
        setCurrentUserId(authStatus.user.id);
        console.log('✅ User loaded:', { id: authStatus.user.id, role: authStatus.user.role });
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const testApiConnection = async () => {
    try {
      console.log('🔍 Testing API connection...');
      const isConnected = await ApiService.checkConnection(true);
      if (isConnected) {
        console.log('✅ API connection successful');
      } else {
        console.log('❌ API connection failed');
        Alert.alert(
          'Проблема с подключением',
          'Не удается подключиться к серверу. Проверьте, что backend запущен.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ API connection test failed:', error);
    }
  };

  const loadApplicationInfo = () => {
    try {
      const applications = getTaskApplications(taskId);
      const app = applications.find(a => a.id === applicationId);
      if (app) {
        setApplication(app);
        // Информация о работнике (в реальности должны загружаться из API профиля работника)
        setWorkerInfo({
          name: app.applicantName,
          age: 28, // В реальности должно быть из профиля работника
          experience: app.message || 'Опыт работы не указан', // Используем сообщение как опыт или берем из профиля
        });
      }
    } catch (error) {
      console.error('Error loading application info:', error);
    }
  };

  const initializeChat = async () => {
    try {
      // Пытаемся получить существующий чат
      const chat = await ApiService.getChatByTaskApplication(taskId, applicationId);
      setBackendChatId(chat.id);
      console.log('✅ Chat found:', chat.id);
    } catch (error) {
      console.log('⚠️ Chat not found, will create when needed:', error.message);
      // Чат будет создан при первой отправке сообщения
    }
  };

  const createChatIfNeeded = async () => {
    if (backendChatId || !applicationId || !taskId) {
      return backendChatId;
    }

    try {
      const chat = await ApiService.createChat(taskId, applicationId);
      setBackendChatId(chat.id);
      console.log('✅ Chat created:', chat.id);
      return chat.id;
    } catch (error) {
      console.error('❌ Failed to create chat:', error);
      throw error;
    }
  };

  const loadMessagesFromAPI = async (chatId) => {
    try {
      const apiMessages = await ApiService.getChatMessages(chatId);
      const formattedMessages = apiMessages.map(msg => ({
        id: msg.id.toString(),
        text: msg.text,
        me: msg.sender_id === currentUserId, // Исправлено: сравниваем с ID пользователя
        timestamp: msg.created_at,
        isRead: msg.is_read,
      }));
      return formattedMessages;
    } catch (error) {
      console.error('❌ Failed to load messages from API:', error);
      return [];
    }
  };

  // Автопрокрутка при новых сообщениях
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);

      // Если есть backend chat ID, загружаем сообщения с сервера
      if (backendChatId) {
        const apiMessages = await loadMessagesFromAPI(backendChatId);
        if (apiMessages.length > 0) {
          setMessages(apiMessages);
          await saveMessages(apiMessages);
          return;
        }
      }

      // Fallback: загружаем из локального хранилища
      const key = `${STORAGE_KEY}${chatId || 'default'}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      } else {
        // Начальные сообщения для демонстрации (только если нет API сообщений)
        const initialMessages = [
          { id: '1', text: 'Здравствуйте!', me: false, timestamp: new Date().toISOString(), isRead: false },
          { id: '2', text: 'Добрый день', me: true, timestamp: new Date().toISOString(), isRead: true },
          { id: '3', text: 'Мы посмотрели ваш отклик', me: false, timestamp: new Date().toISOString(), isRead: false },
        ];
        setMessages(initialMessages);
        await saveMessages(initialMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // При ошибке показываем локальные сообщения
      const key = `${STORAGE_KEY}${chatId || 'default'}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessages = async (msgs) => {
    try {
      const key = `${STORAGE_KEY}${chatId || 'default'}`;
      await AsyncStorage.setItem(key, JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;

    // Проверяем, что у нас есть ID пользователя
    if (!currentUserId) {
      Alert.alert('Ошибка', 'Не удалось определить пользователя. Попробуйте перезайти в приложение.');
      return;
    }

    setIsLoading(true);
    const messageText = text.trim();
    setText('');

    try {
      // Создаем чат если нужно
      const currentChatId = await createChatIfNeeded();

      if (currentChatId) {
        // Отправляем сообщение через API
        const apiMessage = await ApiService.sendMessage(currentChatId, messageText);

        const newMessage = {
          id: apiMessage.id.toString(),
          text: apiMessage.text,
          me: true,
          timestamp: apiMessage.created_at,
          isRead: false,
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        await saveMessages(updatedMessages);

        console.log('✅ Message sent via API');
      } else {
        throw new Error('No chat ID available');
      }
    } catch (error) {
      console.error('❌ Failed to send message via API:', error);

      // Fallback: сохраняем локально
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        me: true,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);

      // Показываем предупреждение пользователю
      Alert.alert(
        'Сообщение сохранено локально',
        `Не удалось отправить сообщение на сервер: ${error.message}. Оно будет отправлено при восстановлении соединения.`,
        [{ text: 'OK' }]
      );

      // Симулируем прочтение через 2 секунды (для локальных сообщений)
      setTimeout(() => {
        const messageIndex = updatedMessages.findIndex(m => m.id === newMessage.id);
        if (messageIndex !== -1) {
          const finalMessages = [...updatedMessages];
          finalMessages[messageIndex] = { ...finalMessages[messageIndex], isRead: true };
          setMessages(finalMessages);
          saveMessages(finalMessages);
        }
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!applicationId || !taskId) return;

    Alert.alert(
      'Одобрить отклик',
      'Вы уверены, что хотите одобрить этого работника?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Одобрить',
          onPress: () => {
            acceptApplication(applicationId);
            // Обновляем локальное состояние
            if (application) {
              setApplication({ ...application, applicationStatus: 'accepted' });
            }
            Alert.alert('Успешно', 'Отклик одобрен', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!applicationId || !taskId) return;

    Alert.alert(
      'Отклонить отклик',
      'Вы уверены, что хотите отклонить этого работника?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отклонить',
          style: 'destructive',
          onPress: () => {
            rejectApplication(applicationId);
            // Обновляем локальное состояние
            if (application) {
              setApplication({ ...application, applicationStatus: 'rejected' });
            }
            Alert.alert('Успешно', 'Отклик отклонен', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.me ? styles.myMessageContainer : styles.theirMessageContainer,
      ]}
    >
      <View
        style={[
          styles.message,
          item.me ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, item.me && styles.myMessageText]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timeText, item.me && styles.myTimeText]}>
            {formatTime(item.timestamp)}
          </Text>
          {item.me && (
            <View style={styles.checkmarkContainer}>
              {item.isRead ? (
                <Ionicons name="checkmark-done" size={16} color="#53BDEB" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#8E98A8" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const isEmployer = userRole === 'employer';
  // Информация о работнике показывается всегда для работодателя (когда есть applicationId)
  const showWorkerInfo = isEmployer && application && workerInfo;
  // Кнопки одобрен/отклонен показываются только для pending откликов
  const showActionButtons = isEmployer && application && application.applicationStatus === 'pending';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Закрепленная информация о работнике (когда работник пишет) */}
      {showWorkerInfo && (
        <View style={styles.workerInfoCard}>
          <View style={styles.workerInfoHeader}>
            <Ionicons name="person-circle" size={24} color="#2F80ED" />
            <Text style={styles.workerInfoTitle}>Информация о работнике</Text>
          </View>
          <View style={styles.workerInfoContent}>
            <View style={styles.workerInfoRow}>
              <Text style={styles.workerInfoLabel}>ФИО:</Text>
              <Text style={styles.workerInfoValue}>{workerInfo.name}</Text>
            </View>
            {workerInfo.age && (
              <View style={styles.workerInfoRow}>
                <Text style={styles.workerInfoLabel}>Возраст:</Text>
                <Text style={styles.workerInfoValue}>{workerInfo.age} лет</Text>
              </View>
            )}
            {workerInfo.experience && (
              <View style={styles.workerInfoRow}>
                <Text style={styles.workerInfoLabel}>Опыт работы:</Text>
                <Text style={styles.workerInfoValue}>{workerInfo.experience}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Кнопки одобрен/отклонен для работодателя */}
      {showActionButtons && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Одобрить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Отклонить</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        onLayout={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={(newText) => {
            setText(newText);
            // Прокрутка при вводе текста
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          onFocus={() => {
            // Прокрутка при фокусе на поле ввода
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
          placeholder="Сообщение"
          placeholderTextColor="#8E98A8"
          style={styles.input}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={20} color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  message: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#2F80ED',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    color: '#000',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 11,
    color: '#8E98A8',
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  checkmarkContainer: {
    marginLeft: 4,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F4F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B8C5',
    opacity: 0.5,
  },
  workerInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workerInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  workerInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A090E',
  },
  workerInfoContent: {
    gap: 6,
  },
  workerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerInfoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  workerInfoValue: {
    fontSize: 13,
    color: '#0A090E',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
