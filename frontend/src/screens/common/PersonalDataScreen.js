import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleAuthService from '../../utils/googleAuth';

export default function PersonalDataScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    phone: '',
    experience: '',
    workDistrict: '',
    companyName: '',
  });
  const [role, setRole] = useState('');
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const authStatus = await GoogleAuthService.checkAuthStatus();
      if (authStatus.isAuthenticated && authStatus.user) {
        const user = authStatus.user;
        setRole(user.role || '');
        setForm({
          name: user.name || '',
          birthDate: user.birthDate || '',
          phone: user.phone || '',
          experience: user.experience || '',
          workDistrict: user.workDistrict || '',
          companyName: user.companyName || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBirthDate = (text) => {
    const numbers = text.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);
    let formatted = '';
    if (limited.length > 0) {
      formatted = limited.slice(0, 2);
      if (limited.length > 2) {
        formatted += '.' + limited.slice(2, 4);
      }
      if (limited.length > 4) {
        formatted += '.' + limited.slice(4, 8);
      }
    }
    return formatted;
  };

  const handleBirthDateChange = (text) => {
    const formatted = formatBirthDate(text);
    setForm({ ...form, birthDate: formatted });
  };

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    if (!form.name) {
      return Alert.alert('Ошибка', 'Введите имя');
    }
    if (!form.phone) {
      return Alert.alert('Ошибка', 'Введите номер телефона');
    }

    setIsSaving(true);
    try {
      const updateData = {
        name: form.name,
        birthDate: form.birthDate,
        phone: form.phone,
      };

      if (role === 'employer') {
        if (!form.companyName) {
          Alert.alert('Ошибка', 'Введите наименование организации');
          setIsSaving(false);
          return;
        }
        if (!form.workDistrict) {
          Alert.alert('Ошибка', 'Введите район работы');
          setIsSaving(false);
          return;
        }
        updateData.companyName = form.companyName;
        updateData.workDistrict = form.workDistrict;
      } else if (role === 'worker') {
        if (!form.birthDate) {
          Alert.alert('Ошибка', 'Введите дату рождения');
          setIsSaving(false);
          return;
        }
        if (!form.experience) {
          Alert.alert('Ошибка', 'Введите опыт работы');
          setIsSaving(false);
          return;
        }
        updateData.birthDate = form.birthDate;
        updateData.experience = form.experience;
      }

      const result = await GoogleAuthService.updateProfile(updateData);
      
      if (result.success) {
        Alert.alert('Успешно', 'Данные сохранены', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось сохранить данные');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A8FE7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Личные данные</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* ФИО */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>ФИО</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="Введите ваше ФИО"
            placeholderTextColor="#999"
          />
        </View>

        {/* Дата рождения - только для работника */}
        {role === 'worker' && (
          <View style={styles.inputWrapper} ref={(ref) => inputRefs.current['birthDate'] = ref}>
            <Text style={styles.label}>Дата рождения</Text>
            <TextInput
              style={styles.input}
              value={form.birthDate}
              onChangeText={handleBirthDateChange}
              placeholder="ДД.ММ.ГГГГ"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => {
                setTimeout(() => {
                  const inputRef = inputRefs.current['birthDate'];
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
            />
          </View>
        )}

        {/* Телефон */}
        <View style={styles.inputWrapper} ref={(ref) => inputRefs.current['phone'] = ref}>
          <Text style={styles.label}>Номер телефона</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="+996 XXX XXX XXX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            onFocus={() => {
              setTimeout(() => {
                const inputRef = inputRefs.current['phone'];
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
          />
        </View>

        {/* Поля для работника */}
        {role === 'worker' && (
          <View style={styles.inputWrapper} ref={(ref) => inputRefs.current['experience'] = ref}>
            <Text style={styles.label}>Опыт работы</Text>
            <TextInput
              style={styles.input}
              value={form.experience}
              onChangeText={(text) => updateField('experience', text)}
              placeholder="Например: 5 лет в строительстве"
              placeholderTextColor="#999"
              onFocus={() => {
                setTimeout(() => {
                  const inputRef = inputRefs.current['experience'];
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
            />
          </View>
        )}

        {/* Поля для работодателя */}
        {role === 'employer' && (
          <>
            <View style={styles.inputWrapper} ref={(ref) => inputRefs.current['companyName'] = ref}>
              <Text style={styles.label}>Наименование вашей организации</Text>
              <TextInput
                style={styles.input}
                value={form.companyName}
                onChangeText={(text) => updateField('companyName', text)}
                placeholder="Введите название организации"
                placeholderTextColor="#999"
                onFocus={() => {
                  setTimeout(() => {
                    const inputRef = inputRefs.current['companyName'];
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
              />
            </View>

            <View style={styles.inputWrapper} ref={(ref) => inputRefs.current['workDistrict'] = ref}>
              <Text style={styles.label}>Район работы</Text>
              <TextInput
                style={styles.input}
                value={form.workDistrict}
                onChangeText={(text) => updateField('workDistrict', text)}
                placeholder="Например: Ленинский район"
                placeholderTextColor="#999"
                onFocus={() => {
                  setTimeout(() => {
                    const inputRef = inputRefs.current['workDistrict'];
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
              />
            </View>
          </>
        )}

        {/* Кнопка сохранения */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Regular',
  },
  saveButton: {
    backgroundColor: '#4A8FE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
  },
});

