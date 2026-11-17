import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { validateAddressComplete } from '../utils/addressValidator';

export default function AddressPicker({ 
  visible, 
  onClose, 
  onAddressSelect, 
  initialAddress = '' 
}) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const webViewRef = useRef(null);

  const handleAddressSelect = (address, lat, lng) => {
    setSelectedAddress(address);
    setCoordinates({ latitude: lat, longitude: lng });
  };

  const handleConfirm = async () => {
    if (!selectedAddress || !coordinates) {
      Alert.alert('Ошибка', 'Выберите адрес на карте');
      return;
    }

    // Проверяем адрес перед подтверждением
    setIsValidating(true);
    setValidationError(null);

    try {
      const validation = await validateAddressComplete(selectedAddress, true);
      
      if (!validation.isValid) {
        setValidationError(validation.error);
        Alert.alert(
          'Адрес не найден',
          validation.error + (validation.suggestions?.length > 0 
            ? `\n\nВозможные варианты:\n• ${validation.suggestions.join('\n• ')}`
            : ''),
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Использовать как есть', 
              onPress: () => {
                onAddressSelect(selectedAddress, coordinates.latitude, coordinates.longitude);
                onClose();
              }
            }
          ]
        );
        return;
      }

      // Адрес валиден, используем его
      onAddressSelect(validation.address, coordinates.latitude, coordinates.longitude);
      onClose();
      
    } catch (error) {
      console.error('Ошибка валидации адреса:', error);
      Alert.alert(
        'Ошибка проверки',
        'Не удалось проверить адрес. Использовать выбранный адрес?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Да', 
            onPress: () => {
              onAddressSelect(selectedAddress, coordinates.latitude, coordinates.longitude);
              onClose();
            }
          }
        ]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <title>Выбор адреса</title>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        #searchWrap { position: absolute; top: 20px; left: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; }
        #searchRow { display: flex; flex-direction: row; gap: 8px; align-items: flex-start; }
        #searchInput { height: 40px; padding: 0 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; background: #fff; flex: 1; }
        #suggestList { max-height: 200px; overflow: auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; display: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .suggestItem { padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; line-height: 1.4; }
        .suggestItem:last-child { border-bottom: 0; }
        .suggestItem:hover { background: #f7f9fc; }
        #searchBtn { height: 40px; padding: 0 14px; border: 0; border-radius: 8px; background: #2a8bff; color: #fff; font-size: 16px; white-space: nowrap; }
        #confirmBtn { position: absolute; bottom: 20px; left: 20px; right: 20px; height: 50px; background: #28a745; color: white; border: 0; border-radius: 8px; font-size: 18px; font-weight: bold; z-index: 1000; }
        #selectedAddress { position: absolute; bottom: 80px; left: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 8px; font-size: 14px; z-index: 1000; display: none; }
      </style>
      <script src="https://maps.api.2gis.ru/2.0/loader.js?pkg=full"></script>
    </head>
    <body>
      <div id="map"></div>
      <div id="searchWrap">
        <div id="searchRow">
          <input id="searchInput" placeholder="Поиск адреса в Бишкеке..." value="${initialAddress}" />
          <button id="searchBtn">Найти</button>
        </div>
        <div id="suggestList"></div>
      </div>
        <div id="selectedAddress"></div>
        ${validationError ? `<div id="validationError" style="position: absolute; bottom: 80px; left: 20px; right: 20px; background: rgba(220,53,69,0.9); color: white; padding: 10px; border-radius: 8px; font-size: 14px; z-index: 1000;">⚠️ ${validationError}</div>` : ''}
        <button id="confirmBtn">${isValidating ? 'Проверка адреса...' : 'Выбрать этот адрес'}</button>
      
      <script>
        (function() {
          const API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;
          let map, marker;
          let selectedAddress = '';
          let selectedCoords = null;
          let debounceTimer = null;

          function init() {
            DG.then(function () {
              map = DG.map('map', {
                center: [42.8746, 74.5698], // Бишкек
                zoom: 13
              });
              
              // Обработчик клика на карту
              map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                // Обратный геокодинг для получения адреса
                reverseGeocode(lat, lng);
              });
            });

            document.getElementById('searchBtn').addEventListener('click', geocode);
            const input = document.getElementById('searchInput');
            input.addEventListener('keydown', function(e){
              if (e.key === 'Enter') geocode();
            });
            input.addEventListener('input', function(){
              const q = input.value.trim();
              clearTimeout(debounceTimer);
              if (q.length < 3) { hideSuggest(); return; }
              debounceTimer = setTimeout(function(){ fetchSuggestions(q); }, 350);
            });
            
            document.getElementById('confirmBtn').addEventListener('click', function(){
              if (selectedAddress && selectedCoords) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'addressSelected',
                  address: selectedAddress,
                  latitude: selectedCoords.lat,
                  longitude: selectedCoords.lng
                }));
              }
            });
          }

          function geocode() {
            const q = document.getElementById('searchInput').value.trim();
            if (!q) return;
            
            const url = 'https://catalog.api.2gis.com/3.0/items/geocode' +
              '?q=' + encodeURIComponent(q + ' Бишкек') +
              '&fields=items.point,items.full_name,items.name' +
              '&key=' + API_KEY;

            fetch(url)
              .then(function(r){ 
                if (!r.ok) throw new Error('Network response was not ok');
                return r.json(); 
              })
              .then(function(data){
                var items = (data && data.result && data.result.items) || [];
                if (!items.length) return;
                var p = items[0].point;
                if (!p) return;
                var latlng = [p.lat, p.lon];
                map.setView(latlng, 16);
                if (marker) { marker.remove(); }
                DG.then(function(){
                  marker = DG.marker(latlng).addTo(map);
                });
                selectAddress(items[0].full_name || items[0].name, {lat: p.lat, lng: p.lon});
                hideSuggest();
              })
              .catch(function(err){ 
                console.error('Geocode error:', err);
              });
          }

          function reverseGeocode(lat, lng) {
            const url = 'https://catalog.api.2gis.com/3.0/items/geocode' +
              '?point=' + lng + ',' + lat +
              '&fields=items.full_name,items.name' +
              '&key=' + API_KEY;

            fetch(url)
              .then(function(r){ return r.json(); })
              .then(function(data){
                var items = (data && data.result && data.result.items) || [];
                if (items.length > 0) {
                  const address = items[0].full_name || items[0].name || 'Выбранное место';
                  selectAddress(address, {lat: lat, lng: lng});
                }
              })
              .catch(function(err){ 
                console.error('Reverse geocode error:', err);
                selectAddress('Выбранное место', {lat: lat, lng: lng});
              });
          }

          function selectAddress(address, coords) {
            selectedAddress = address;
            selectedCoords = coords;
            
            // Обновляем отображение
            document.getElementById('selectedAddress').textContent = address;
            document.getElementById('selectedAddress').style.display = 'block';
            
            // Добавляем маркер
            if (marker) { marker.remove(); }
            DG.then(function(){
              marker = DG.marker([coords.lat, coords.lng]).addTo(map);
            });
          }

          function fetchSuggestions(q) {
            const url = 'https://catalog.api.2gis.com/3.0/items/geocode' +
              '?q=' + encodeURIComponent(q + ' Бишкек') +
              '&fields=items.point,items.full_name,items.name' +
              '&key=' + API_KEY;
            fetch(url)
              .then(function(r){ 
                if (!r.ok) return;
                return r.json(); 
              })
              .then(function(data){
                if (!data) return;
                var items = (data && data.result && data.result.items) || [];
                renderSuggest(items.slice(0, 6));
              })
              .catch(function(err){ 
                console.log('Suggestions error:', err);
              });
          }

          function renderSuggest(items) {
            const box = document.getElementById('suggestList');
            if (!items || !items.length) { hideSuggest(); return; }
            box.innerHTML = '';
            items.forEach(function(it){
              var title = it.full_name || it.name || 'Результат';
              var p = it.point;
              var div = document.createElement('div');
              div.className = 'suggestItem';
              div.textContent = title;
              div.addEventListener('click', function(){
                if (p) {
                  var latlng = [p.lat, p.lon];
                  map.setView(latlng, 16);
                  selectAddress(title, {lat: p.lat, lng: p.lon});
                }
                hideSuggest();
              });
              box.appendChild(div);
            });
            box.style.display = 'block';
          }

          function hideSuggest() {
            const box = document.getElementById('suggestList');
            box.style.display = 'none';
            box.innerHTML = '';
          }

          init();
        })();
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'addressSelected') {
        handleAddressSelect(data.address, data.latitude, data.longitude);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Выберите адрес</Text>
          <Text style={styles.subtitle}>Найдите место на карте или введите адрес</Text>
        </View>
        
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          onMessage={handleMessage}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  webView: {
    flex: 1,
  },
});
