import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const html = useMemo(() => `<!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>2GIS Map</title>
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      #searchWrap { position: absolute; top: 50px; left: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; }
      #searchRow { display: flex; flex-direction: row; gap: 8px; align-items: flex-start; }
      #searchInput { height: 40px; padding: 0 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; background: #fff; flex: 1; }
      #suggestList { max-height: 220px; overflow: auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; display: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .suggestItem { padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; line-height: 1.4; }
      .suggestItem:last-child { border-bottom: 0; }
      .suggestItem:hover { background: #f7f9fc; }
      #searchBtn { height: 40px; padding: 0 14px; border: 0; border-radius: 8px; background: #2a8bff; color: #fff; font-size: 16px; white-space: nowrap; }
    </style>
    <script src="https://maps.api.2gis.ru/2.0/loader.js?pkg=full"></script>
  </head>
  <body>
    <div id="map"></div>
    <div id="searchWrap">
      <div id="searchRow">
        <input id="searchInput" placeholder="Поиск в Бишкеке: улица, дом, место..." />
        <button id="searchBtn">Найти</button>
      </div>
      <div id="suggestList"></div>
    </div>
    <script>
      (function() {
        const API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;
        let map, marker;
        let debounceTimer = null;

        function init() {
          console.log('Initializing map with API key:', API_KEY);
          DG.then(function () {
            map = DG.map('map', {
              center: [42.8746, 74.5698], // Бишкек по умолчанию
              zoom: 13
            });
            console.log('Map initialized successfully');
            
            // Закрытие подсказок при клике на карту
            map.on('click', function() {
              hideSuggest();
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
          
          // Закрытие подсказок при клике вне поисковика
          document.addEventListener('click', function(e) {
            if (!e.target.closest('#searchWrap')) {
              hideSuggest();
            }
          });
        }

        function geocode() {
          const q = document.getElementById('searchInput').value.trim();
          if (!q) return;
          
          // Простой и надежный поиск через 2GIS
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
              console.log('Geocode response:', data);
              var items = (data && data.result && data.result.items) || [];
              if (!items.length) {
                console.log('No results found');
                return;
              }
              var p = items[0].point; // { lat, lon }
              if (!p) return;
              var latlng = [p.lat, p.lon];
              map.setView(latlng, 16);
              if (marker) { marker.remove(); }
              DG.then(function(){
                marker = DG.marker(latlng).addTo(map);
              });
              hideSuggest();
            })
            .catch(function(err){ 
              console.error('Geocode error:', err);
              // Fallback: попробуем поиск через встроенный поиск 2GIS
              searchWithBuiltInSearch(q);
            });
        }

        function searchWithBuiltInSearch(q) {
          // Fallback: используем встроенный поиск 2GIS
          console.log('Using built-in search for:', q);
          DG.then(function() {
            // Создаем поиск через 2GIS
            var searchControl = DG.control.search({
              placeholder: 'Поиск',
              noPopup: true
            });
            
            // Выполняем поиск
            searchControl.search(q, function(results) {
              if (results && results.length > 0) {
                var result = results[0];
                var latlng = [result.lat, result.lon];
                map.setView(latlng, 16);
                if (marker) { marker.remove(); }
                marker = DG.marker(latlng).addTo(map);
                hideSuggest();
              }
            });
          });
        }

        function fetchSuggestions(q) {
          // Простые подсказки
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
              // Показываем простые подсказки
              showSimpleSuggestions(q);
            });
        }

        function renderSuggest(items) {
          const box = document.getElementById('suggestList');
          if (!items || !items.length) { hideSuggest(); return; }
          box.innerHTML = '';
          items.forEach(function(it){
            var title = it.full_name || it.name || 'Результат';
            var address = it.address || '';
            var p = it.point;
            var div = document.createElement('div');
            div.className = 'suggestItem';
            
            // Создаем более информативное отображение
            var titleDiv = document.createElement('div');
            titleDiv.style.fontWeight = 'bold';
            titleDiv.textContent = title;
            
            var addressDiv = document.createElement('div');
            addressDiv.style.fontSize = '14px';
            addressDiv.style.color = '#666';
            addressDiv.textContent = address;
            
            div.appendChild(titleDiv);
            if (address) {
              div.appendChild(addressDiv);
            }
            
            div.addEventListener('click', function(){
              if (p) {
                // Если есть координаты, используем их
                var latlng = [p.lat, p.lon];
                map.setView(latlng, 16);
                if (marker) { marker.remove(); }
                DG.then(function(){
                  marker = DG.marker(latlng).addTo(map);
                });
              } else {
                // Если нет координат, выполняем поиск
                document.getElementById('searchInput').value = title;
                geocode();
                return;
              }
              document.getElementById('searchInput').value = title;
              hideSuggest();
            });
            box.appendChild(div);
          });
          box.style.display = 'block';
        }

        function showSimpleSuggestions(q) {
          // Простые подсказки для популярных мест в Бишкеке
          const suggestions = [
            'Чуй проспект',
            'Ала-Тоо площадь',
            'Токтогула улица',
            'Дордой рынок',
            'Ошский рынок',
            'Центральный парк',
            'Бишкек центр',
            'Манаса проспект'
          ].filter(item => item.toLowerCase().includes(q.toLowerCase()));
          
          if (suggestions.length > 0) {
            const items = suggestions.map(suggestion => ({
              full_name: suggestion,
              name: suggestion,
              point: null // Будет найдено при клике
            }));
            renderSuggest(items);
          }
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
  </html>`, []);

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});