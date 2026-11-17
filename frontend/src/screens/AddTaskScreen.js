CreateTaskScreen.js


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateTaskScreen() {
  return (
    <View style={styles.container}>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Создание задачи</Text>

        {/* Название */}
        <TextInput
          placeholder="Название работы"
          placeholderTextColor="#A8A8A8"
          style={styles.input}
        />

        {/* Описание */}
        <TextInput
          placeholder="Описание дела"
          placeholderTextColor="#A8A8A8"
          style={[styles.input, styles.textArea]}
          multiline
        />

        {/* Оплата */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Оплата за 1 человека"
            placeholderTextColor="#A8A8A8"
            style={[styles.input, styles.flex]}
            keyboardType="numeric"
          />
          <Text style={styles.currency}>сом</Text>
        </View>

        {/* Количество */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Кол-во человек"
            placeholderTextColor="#A8A8A8"
            style={[styles.input, styles.flex]}
            keyboardType="numeric"
          />
          <Text style={styles.counter}>1</Text>
        </View>

        {/* Дата */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Дата</Text>
          <Text style={styles.dateValue}>24.04.2025</Text>
        </View>

        {/* Время */}
        <Text style={styles.sectionLabel}>Время</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>От</Text>
            <Text style={styles.timeValue}>09:00</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>До</Text>
            <Text style={styles.timeValue}>18:00</Text>
          </View>
        </View>

        {/* Адрес */}
        <View style={styles.addressRow}>
          <Text style={styles.addressPlaceholder}>Адрес</Text>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Опубликовать задачу</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 15,
    color: '#0A090E',
  },

  input: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    shadowColor: '#51A2EE',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  flex: {
    flex: 1,
    marginHorizontal: 0,
  },

  currency: {
    marginLeft: 10,
    fontSize: 14,
    color: '#777',
  },

  counter: {
    marginLeft: 10,
    fontSize: 14,
    color: '#777',
  },

  dateRow: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#51A2EE',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  dateLabel: {
    color: '#777',
  },

  dateValue: {
    color: '#777',
  },

  sectionLabel: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: '#777',
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  timeBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#51A2EE',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  timeLabel: {
    fontSize: 12,
    color: '#777',
  },

  timeValue: {
    fontSize: 14,
    marginTop: 4,
    color: '#0A090E',
  },

  addressRow: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#51A2EE',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  addressPlaceholder: {
    color: '#A8A8A8',
  },

  },

  button: {
    backgroundColor: '#1B84F1',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});