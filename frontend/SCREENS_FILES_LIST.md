# 📋 Список файлов экранов (Страница = Файл)

## 🔄 Нижняя панель навигации (Tab Navigator)

### 👷 Работник (Worker)
1. **Задачи** → `src/screens/worker/OfflineTasksScreen.js`
2. **Мои отклики** → `src/screens/worker/OfflineMyTasksScreen.js`
3. **Чаты** → `src/screens/Chats/ChatsScreen.js`
4. **Профиль** → `src/screens/common/ProfileScreen.js`

### 👔 Работодатель (Employer)
1. **Задачи** → `src/screens/common/OfflineTasksScreen.js`
2. **Отклики** → `src/screens/employer/TaskApplicationsScreen.js`
3. **Создать** → `src/screens/employer/UltraSimpleAddTaskScreen.js`
4. **Чаты** → `src/screens/Chats/ChatsScreen.js`
5. **Профиль** → `src/screens/common/ProfileScreen.js`

## 📱 Дополнительные экраны (Stack Navigator)

### Общие экраны
- **Детали задачи** (TaskDetail/SimpleTaskDetail) → `src/screens/common/SimpleTaskDetailScreen.js`
- **Редактировать задачу** (EditTask) → `src/screens/common/EditTaskScreen.js`
- **Личные данные** (PersonalData) → `src/screens/common/PersonalDataScreen.js`
- **Тест сети** (NetworkTest/ConnectionTest) → `src/screens/common/NetworkTestScreen.js`

### Экраны работодателя
- **Создать задачу** (UltraSimpleAddTask) → `src/screens/employer/UltraSimpleAddTaskScreen.js`
- **Отклики** (TaskApplications) → `src/screens/employer/TaskApplicationsScreen.js`

## 📂 Структура папок

```
src/screens/
├── common/                    # Общие экраны
│   ├── ProfileScreen.js
│   ├── SimpleTaskDetailScreen.js
│   ├── EditTaskScreen.js
│   ├── PersonalDataScreen.js
│   └── NetworkTestScreen.js
├── worker/                    # Экраны работника
│   ├── OfflineTasksScreen.js
│   └── OfflineMyTasksScreen.js
├── employer/                  # Экраны работодателя
│   ├── UltraSimpleAddTaskScreen.js
│   └── TaskApplicationsScreen.js
└── Chats/                     # Чаты (общие)
    └── ChatsScreen.js
```

## ✅ Все экраны используют ScreenWrapper с Header

Все экраны в навигации обернуты в `ScreenWrapper`, который автоматически добавляет единый Header на все страницы.

### Компоненты навигации
- **MainNavigator.js** → `src/navigation/MainNavigator.js`
- **ScreenWrapper** → `src/components/ScreenWrapper.js`
- **Header** → `src/components/Header.js`
