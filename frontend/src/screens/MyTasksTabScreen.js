import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTasks } from '../context/TasksContext';

export default function MyTasksTabScreen({ navigation }) {
    const { myTasks, appliedTasks, deleteTask, cancelApplication } = useTasks();
    const [activeTab, setActiveTab] = useState('created'); // 'created' или 'applied'
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Загрузка данных
    const loadData = useCallback(async () => {
        console.log('MyTasksTabScreen: Loading data...');
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            console.log('MyTasksTabScreen: Data loaded - Created:', myTasks.length, 'Applied:', appliedTasks.length);
        }, 300);
    }, [myTasks.length, appliedTasks.length]);

    // Обновление списка
    const onRefresh = useCallback(async () => {
        console.log('MyTasksTabScreen: Refreshing...');
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    // Загрузка при фокусе экрана
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }, []);

    const formatTime = useCallback((timeString) => {
        return timeString.slice(0, 5);
    }, []);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'completed': return '#2196F3';
            case 'cancelled': return '#f44336';
            case 'pending': return '#FF9800';
            case 'accepted': return '#4CAF50';
            case 'rejected': return '#f44336';
            default: return '#666';
        }
    }, []);

    const getStatusText = useCallback((status) => {
        switch (status) {
            case 'active': return 'Активна';
            case 'completed': return 'Завершена';
            case 'cancelled': return 'Отменена';
            case 'pending': return 'Ожидает';
            case 'accepted': return 'Принят';
            case 'rejected': return 'Отклонен';
            default: return status;
        }
    }, []);

    // Обработчики для созданных задач
    const handleEditTask = useCallback((task) => {
        Alert.alert(
            'Редактировать задачу',
            `Редактирование задачи "${task.title}"`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Редактировать', onPress: () => {
                        Alert.alert('Редактирование', 'Функция в разработке');
                    }
                },
            ]
        );
    }, []);

    const handleDeleteTask = useCallback((taskId, taskTitle) => {
        Alert.alert(
            'Удалить задачу',
            `Вы уверены, что хотите удалить задачу "${taskTitle}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => {
                        deleteTask(taskId);
                        Alert.alert('Успешно', 'Задача удалена из всех списков');
                    }
                },
            ]
        );
    }, [deleteTask]);

    const handleViewApplications = useCallback((task) => {
        Alert.alert(
            'Отклики на задачу',
            `На задачу "${task.title}" откликнулось ${task.applications || 0} человек`,
            [
                { text: 'OK' },
                {
                    text: 'Посмотреть отклики', onPress: () => {
                        Alert.alert('Отклики', 'Функция просмотра откликов в разработке');
                    }
                },
            ]
        );
    }, []);
    /
        / Обработчики для задач с откликами
    const handleCancelApplication = useCallback((taskId, taskTitle) => {
        Alert.alert(
            'Отменить отклик',
            `Вы уверены, что хотите отменить отклик на задачу "${taskTitle}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Отменить отклик',
                    style: 'destructive',
                    onPress: () => {
                        cancelApplication(taskId);
                        Alert.alert('Успешно', 'Отклик отменен');
                    }
                },
            ]
        );
    }, [cancelApplication]);

    const handleContactEmployer = useCallback((task) => {
        Alert.alert(
            'Связаться с заказчиком',
            `Связаться по поводу задачи "${task.title}"`,
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Позвонить', onPress: () => Alert.alert('Звонок', 'Функция в разработке') },
                { text: 'Написать', onPress: () => Alert.alert('Сообщение', 'Функция в разработке') },
            ]
        );
    }, []);

    const handleAddTask = useCallback(() => {
        navigation.navigate('UltraSimpleAddTask');
    }, [navigation]);

    // Рендер созданной задачи
    const renderCreatedTask = useCallback(({ item }) => (
        <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View style={styles.taskActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditTask(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="pencil" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTask(item.id, item.title)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash" size={18} color="#f44336" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.taskPrice}>{item.price} сом</Text>

            {item.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View style={styles.taskInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.count_people} человека</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{formatTime(item.time)}</Text>
                </View>
            </View>

            <View style={styles.taskFooter}>
                <Text style={styles.locationText}>{item.address}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            {/* Отклики */}
            {item.status === 'active' && (
                <TouchableOpacity
                    style={styles.applicationsButton}
                    onPress={() => handleViewApplications(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="people" size={16} color="#007AFF" />
                    <Text style={styles.applicationsText}>
                        {item.applications || 0} откликов
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    ), [handleEditTask, handleDeleteTask, handleViewApplications, formatDate, formatTime, getStatusColor, getStatusText]);

    // Рендер задачи с откликом
    const renderAppliedTask = useCallback(({ item }) => (
        <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View style={styles.taskActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleContactEmployer(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCancelApplication(item.id, item.title)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close-circle-outline" size={18} color="#f44336" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.taskPrice}>{item.price} сом</Text>

            {item.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View style={styles.taskInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>Заказчик: {item.employer}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{formatTime(item.time)}</Text>
                </View>
            </View>

            <View style={styles.taskFooter}>
                <Text style={styles.locationText}>{item.address}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.applicationStatus || 'pending')}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.applicationStatus || 'pending') }]}>
                        {getStatusText(item.applicationStatus || 'pending')}
                    </Text>
                </View>
            </View>

            {/* Дата отклика */}
            <View style={styles.appliedInfo}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                <Text style={styles.appliedText}>
                    Откликнулись: {formatDate(item.appliedAt || item.created_at)}
                </Text>
            </View>
        </View>
    ), [handleContactEmployer, handleCancelApplication, formatDate, formatTime, getStatusColor, getStatusText]);

    const keyExtractor = useCallback((item) => item.id.toString(), []);

    const currentData = activeTab === 'created' ? myTasks : appliedTasks;
    const renderItem = activeTab === 'created' ? renderCreatedTask : renderAppliedTask;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Мои отклики</Text>
                    <Text style={styles.headerSubtitle}>Управление задачами</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddTask}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'created' && styles.activeTab]}
                    onPress={() => setActiveTab('created')}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={activeTab === 'created' ? 'briefcase' : 'briefcase-outline'}
                        size={20}
                        color={activeTab === 'created' ? '#007AFF' : '#666'}
                    />
                    <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
                        Мои задачи ({myTasks.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'applied' && styles.activeTab]}
                    onPress={() => setActiveTab('applied')}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={activeTab === 'applied' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={20}
                        color={activeTab === 'applied' ? '#007AFF' : '#666'}
                    />
                    <Text style={[styles.tabText, activeTab === 'applied' && styles.activeTabText]}>
                        Отклики ({appliedTasks.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <FlatList
                data={currentData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={10}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name={activeTab === 'created' ? 'briefcase-outline' : 'checkmark-circle-outline'}
                            size={64}
                            color="#ccc"
                        />
                        <Text style={styles.emptyText}>
                            {isLoading ? 'Загрузка...' :
                                activeTab === 'created' ? 'У вас пока нет созданных задач' : 'Вы пока не откликались на задачи'}
                        </Text>
                        {!isLoading && activeTab === 'created' && (
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleAddTask}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.createButtonText}>Создать первую задачу</Text>
                            </TouchableOpacity>
                        )}
                        {!isLoading && activeTab === 'applied' && (
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => navigation.navigate('Tasks')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.createButtonText}>Найти задачи</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    listContainer: {
        padding: 20,
    },
    taskCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    taskActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 5,
        marginLeft: 10,
    },
    taskPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        lineHeight: 20,
    },
    taskInfo: {
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        marginBottom: 10,
    },
    locationText: {
        fontSize: 12,
        color: '#999',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    applicationsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    applicationsText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    appliedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 10,
    },
    appliedText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});