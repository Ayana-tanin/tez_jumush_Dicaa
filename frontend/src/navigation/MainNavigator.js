import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import GoogleAuthService from '../utils/googleAuth';
import ScreenWrapper from '../components/ScreenWrapper';

// Импортируем используемые экраны
// Общие экраны
import ChatsScreen from '../screens/Chats/ChatsScreen';
import ChatScreen from '../screens/Chats/ChatScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import NetworkTestScreen from '../screens/common/NetworkTestScreen';
import SimpleTaskDetailScreen from '../screens/common/SimpleTaskDetailScreen';
import EditTaskScreen from '../screens/common/EditTaskScreen';
import PersonalDataScreen from '../screens/common/PersonalDataScreen';

// Экраны работника
import OfflineTasksScreen from '../screens/worker/OfflineTasksScreen';
import OfflineMyTasksScreen from '../screens/worker/OfflineMyTasksScreen';
import WorkerTaskDetailScreen from '../screens/worker/WorkerTaskDetailScreen';

// Экраны работодателя
import UltraSimpleAddTaskScreen from '../screens/employer/UltraSimpleAddTaskScreen';
import TaskApplicationsScreen from '../screens/employer/TaskApplicationsScreen';
import EmployerTasksScreen from '../screens/employer/EmployerTasksScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
function MainTabs({ onLogout }) {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      if (authStatus.isAuthenticated && authStatus.user) {
        setUserRole(authStatus.user.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  // Для работника: Задачи, Мои отклики, Чаты, Профиль
  // Для работодателя: Задачи, Отклики, Создать, Чаты, Профиль
  const isWorker = userRole === 'worker';
  const isEmployer = userRole === 'employer';

  // Кастомный tabBar компонент
  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View style={customTabBarStyles.container}>
        <View style={customTabBarStyles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName;
            if (route.name === 'Chats') {
              iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Tasks') {
              iconName = isFocused ? 'list' : 'list-outline';
            } else if (route.name === 'AddTask') {
              iconName = isFocused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'MyTasks') {
              iconName = isFocused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'TaskApplications') {
              iconName = isFocused ? 'people' : 'people-outline';
            } else if (route.name === 'Profile') {
              iconName = isFocused ? 'person' : 'person-outline';
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={[customTabBarStyles.tab, isFocused && customTabBarStyles.tabActive]}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? '#007AFF' : '#8E8E93'}
                />
                <Text style={[customTabBarStyles.tabLabel, isFocused && customTabBarStyles.tabLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Tab.Navigator
      initialRouteName={isWorker ? "Tasks" : "Tasks"}
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Задачи - разные экраны для работника и работодателя */}
      <Tab.Screen 
        name="Tasks"
        options={{ title: 'Задачи' }}
      >
        {(props) => {
          if (isEmployer) {
            // Для работодателя - отдельный экран с фильтрами
            return (
              <ScreenWrapper title="Задачи">
                <EmployerTasksScreen {...props} />
              </ScreenWrapper>
            );
          }

          // Для работника - обычный экран со всеми задачами
          // Только кнопка настроек (работник не может создавать задачи)
          const headerButtons = (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('NetworkTest')}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="settings-outline" size={20} color="#0A090E" />
              </TouchableOpacity>
            </View>
          );

          return (
            <ScreenWrapper title="Задачи" rightComponent={headerButtons}>
              <OfflineTasksScreen {...props} />
            </ScreenWrapper>
          );
        }}
      </Tab.Screen>

      {/* Для работника: Мои отклики, Чаты */}
      {isWorker && (
        <>
          <Tab.Screen 
            name="MyTasks"
            options={{ 
              title: 'Мои отклики',
            }}
          >
            {(props) => (
              <ScreenWrapper title="Мои отклики">
                <OfflineMyTasksScreen {...props} />
              </ScreenWrapper>
            )}
          </Tab.Screen>
          <Tab.Screen 
            name="Chats"
            options={{ title: 'Чаты' }}
          >
            {(props) => (
              <ScreenWrapper title="Чаты">
                <ChatsScreen {...props} />
              </ScreenWrapper>
            )}
          </Tab.Screen>
        </>
      )}

      {/* Для работодателя: Отклики, Создать, Чаты */}
      {isEmployer && (
        <>
          <Tab.Screen 
            name="TaskApplications"
            options={{ title: 'Отклики' }}
          >
            {(props) => (
              <ScreenWrapper title="Отклики">
                <TaskApplicationsScreen {...props} />
              </ScreenWrapper>
            )}
          </Tab.Screen>
          <Tab.Screen 
            name="AddTask"
            options={{ title: 'Создать' }}
          >
            {(props) => (
              <ScreenWrapper title="Создать задачу">
                <UltraSimpleAddTaskScreen {...props} />
              </ScreenWrapper>
            )}
          </Tab.Screen>
          <Tab.Screen 
            name="Chats"
            options={{ title: 'Чаты' }}
          >
            {(props) => (
              <ScreenWrapper title="Чаты">
                <ChatsScreen {...props} />
              </ScreenWrapper>
            )}
          </Tab.Screen>
        </>
      )}

      {/* Профиль - для всех */}
      <Tab.Screen 
        name="Profile"
        options={{ title: 'Профиль' }}
      >
        {(props) => (
          <ScreenWrapper title="Профиль">
            <ProfileScreen {...props} onLogout={onLogout} />
          </ScreenWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Main Navigator
export default function MainNavigator({ onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs">
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="TaskDetail"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Детали задачи" showBack={true} showBottomNav={false}>
            <SimpleTaskDetailScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="ConnectionTest"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Тест сети" showBack={true} showBottomNav={false}>
            <NetworkTestScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="NetworkTest"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Тест сети" showBack={true} showBottomNav={false}>
            <NetworkTestScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="SimpleTaskDetail"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Детали задачи" showBack={true} showBottomNav={false}>
            <SimpleTaskDetailScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="WorkerTaskDetail"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Детали задачи" showBack={true} showBottomNav={false}>
            <WorkerTaskDetailScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      {/* SimpleAddTask удален - содержал API вызовы */}
      <Stack.Screen 
        name="UltraSimpleAddTask"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Создать задачу" showBack={true} showBottomNav={false}>
            <UltraSimpleAddTaskScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="TaskApplications"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Отклики" showBack={true} showBottomNav={false}>
            <TaskApplicationsScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="EditTask"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Редактировать задачу" showBack={true} showBottomNav={false}>
            <EditTaskScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="PersonalData"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper title="Личные данные" showBack={true} showBottomNav={false}>
            <PersonalDataScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Chat"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <ScreenWrapper 
            title={props.route.params?.chatTitle || 'Чат'} 
            showBack={true} 
            showBottomNav={false}
          >
            <ChatScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Стили для кастомного tabBar
const customTabBarStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  tabActive: {
    // Можно добавить дополнительные стили для активной вкладки
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    fontFamily: Platform.OS === 'web' ? 'AGAvantGardeCyr, sans-serif' : 'AGAvantGardeCyr',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
