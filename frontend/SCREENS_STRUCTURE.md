# 📁 Структура экранов Frontend

## Новая организация экранов по ролям

Экраны разделены на три категории для лучшей организации кода:

### 📂 `screens/common/` - Общие экраны
Экраны, которые используются и работниками, и работодателями:

- **`OfflineTasksScreen.js`** - Список всех задач (общий для всех)
- **`ProfileScreen.js`** - Профиль пользователя (общий)
- **`SimpleTaskDetailScreen.js`** - Детали задачи (общий)
- **`EditTaskScreen.js`** - Редактирование задачи (общий)
- **`PersonalDataScreen.js`** - Личные данные (общий)
- **`NetworkTestScreen.js`** - Тест сети (общий)

### 👷 `screens/worker/` - Экраны работника
Экраны, используемые только работниками:

- **`OfflineMyTasksScreen.js`** - Мои задачи (задачи, на которые работник откликнулся)

### 👔 `screens/employer/` - Экраны работодателя
Экраны, используемые только работодателями:

- **`UltraSimpleAddTaskScreen.js`** - Создание новой задачи
- **`TaskApplicationsScreen.js`** - Просмотр откликов на задачи

### 🔐 `screens/LoginAndRegistration/` - Регистрация (общая)
Экраны регистрации и авторизации (общие для всех):

- **`AuthScreen.js`** - Выбор роли (КТО ВЫ?)
- **`RegWorker.js`** - Регистрация работника
- **`RegestrationEmpl.js`** - Регистрация работодателя
- **`CodeVerificationScreen.js`** - Ввод кода подтверждения (общий)

### 💬 `screens/Chats/` - Чаты (общие)
- **`ChatsScreen.js`** - Экран чатов (используется и работниками, и работодателями)

## 📋 Импорты в навигации

Все импорты обновлены в `MainNavigator.js`:

```javascript
// Общие экраны
import ProfileScreen from '../screens/common/ProfileScreen';
import NetworkTestScreen from '../screens/common/NetworkTestScreen';
import SimpleTaskDetailScreen from '../screens/common/SimpleTaskDetailScreen';
import EditTaskScreen from '../screens/common/EditTaskScreen';
import PersonalDataScreen from '../screens/common/PersonalDataScreen';

// Экраны работника
import OfflineTasksScreen from '../screens/worker/OfflineTasksScreen';
import OfflineMyTasksScreen from '../screens/worker/OfflineMyTasksScreen';

// Экраны работодателя
import UltraSimpleAddTaskScreen from '../screens/employer/UltraSimpleAddTaskScreen';
import TaskApplicationsScreen from '../screens/employer/TaskApplicationsScreen';
```

## 🔄 Обновленные пути импортов

Все файлы в подпапках обновлены:
- `../context/` → `../../context/`
- `../utils/` → `../../utils/`
- `../components/` → `../../components/`

## ✅ Преимущества новой структуры

1. **Четкое разделение** - легко найти экраны по ролям
2. **Лучшая организация** - общие экраны отдельно от специфичных
3. **Упрощенная навигация** - понятно, где что находится
4. **Масштабируемость** - легко добавлять новые экраны в нужные папки

## 📝 Добавление новых экранов

### Для работника:
Создайте файл в `screens/worker/` и добавьте импорт в `MainNavigator.js`:
```javascript
import NewWorkerScreen from '../screens/worker/NewWorkerScreen';
```

### Для работодателя:
Создайте файл в `screens/employer/` и добавьте импорт в `MainNavigator.js`:
```javascript
import NewEmployerScreen from '../screens/employer/NewEmployerScreen';
```

### Для общих экранов:
Создайте файл в `screens/common/` и добавьте импорт в `MainNavigator.js`:
```javascript
import NewCommonScreen from '../screens/common/NewCommonScreen';
```

