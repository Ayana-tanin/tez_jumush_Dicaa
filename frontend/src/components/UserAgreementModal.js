import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Импортируем JSON через require для React Native
const userAgreementData = require('../data/userAgreement.json');

export default function UserAgreementModal({ visible, onClose }) {
  const [agreementText, setAgreementText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadAgreement();
    }
  }, [visible]);

  const loadAgreement = async () => {
    setLoading(true);
    try {
      // Загружаем из JSON
      const sections = userAgreementData.sections || [];
      const formattedText = sections
        .map((section) => `${section.title}\n\n${section.content}\n`)
        .join('\n');
      
      setAgreementText(
        `${userAgreementData.title}\n\n` +
        `Последнее обновление: ${userAgreementData.lastUpdated}\n\n` +
        formattedText +
        `\n\nКонтакты:\n` +
        `Email: ${userAgreementData.contact?.email || 'support@tezjumush.kg'}\n` +
        `Телефон: ${userAgreementData.contact?.phone || '+996 XXX XXX XXX'}`
      );
    } catch (error) {
      console.error('Error loading agreement:', error);
      setAgreementText('Ошибка загрузки соглашения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Пользовательское соглашение</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A8FE7" />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.agreementText}>{agreementText}</Text>
            </ScrollView>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButtonFooter} onPress={onClose}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  agreementText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  closeButtonFooter: {
    backgroundColor: '#4A8FE7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily:
      Platform.OS === 'web'
        ? 'AGAvantGardeCyr, sans-serif'
        : 'AGAvantGardeCyr',
  },
});