import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({
  latitude = 28.6139,
  longitude = 77.2090,
  zoom = 15,
  draggable = false,
  markers = [],
  onLocationSelect = null,
  onInteractionChange = null,
  style = {},
  height = 200,
  borderRadius = 18,
}) => {
  const webViewRef = useRef(null);
  const releaseTimerRef = useRef(null);

  const validLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 28.6139;
  const validLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 77.2090;

  const handleInteraction = (interacting) => {
    if (interacting) {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }
      if (onInteractionChange) {
        onInteractionChange(true);
      }
    } else {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
      // Debounce release by 250ms so finger lifts during pinch don't trigger parent scroll
      releaseTimerRef.current = setTimeout(() => {
        if (onInteractionChange) {
          onInteractionChange(false);
        }
        releaseTimerRef.current = null;
      }, 250);
    }
  };

  useEffect(() => {
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #F1F5F9;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    #map {
      width: 100%;
      height: 100%;
      background: #F1F5F9;
      touch-action: none;
    }
    .custom-pin {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #059669;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: transform 0.15s ease;
    }
    .custom-pin.high { background: #DC2626; }
    .custom-pin.medium { background: #D97706; }
    .custom-pin.low { background: #059669; }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ctrl-btn {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 19px;
      font-weight: 700;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
    }
    .ctrl-btn:active {
      background: #E2E8F0;
      transform: scale(0.92);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-controls">
    <button class="ctrl-btn" id="btn-zoom-in" title="Zoom In">+</button>
    <button class="ctrl-btn" id="btn-zoom-out" title="Zoom Out">−</button>
    <button class="ctrl-btn" id="btn-recenter" title="Recenter">⌖</button>
  </div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      tapHold: false,
      bounceAtZoomLimits: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 60
    }).setView([${validLat}, ${validLng}], ${zoom});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 6
    }).addTo(map);

    function recenterMap() {
      map.setView([${validLat}, ${validLng}], ${zoom}, { animate: true });
    }

    var btnIn = document.getElementById('btn-zoom-in');
    var btnOut = document.getElementById('btn-zoom-out');
    var btnRecenter = document.getElementById('btn-recenter');

    L.DomEvent.disableClickPropagation(btnIn);
    L.DomEvent.disableClickPropagation(btnOut);
    L.DomEvent.disableClickPropagation(btnRecenter);

    btnIn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      map.zoomIn(1, { animate: true });
    });

    btnOut.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      map.zoomOut(1, { animate: true });
    });

    btnRecenter.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      recenterMap();
    });

    ${draggable ? `
      var markerIcon = L.divIcon({
        className: 'custom-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      var mainMarker = L.marker([${validLat}, ${validLng}], {
        draggable: true,
        icon: markerIcon
      }).addTo(map);

      mainMarker.on('dragend', function(e) {
        var coord = e.target.getLatLng();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PIN_MOVED',
          latitude: coord.lat,
          longitude: coord.lng
        }));
      });

      map.on('click', function(e) {
        mainMarker.setLatLng(e.latlng);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PIN_MOVED',
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        }));
      });
    ` : ''}

    ${markers.length > 0 ? `
      var markersData = ${JSON.stringify(markers)};
      var group = [];
      markersData.forEach(function(m) {
        if (!m.latitude || !m.longitude) return;
        var mIcon = L.divIcon({
          className: 'custom-pin ' + (m.severity ? m.severity.toLowerCase() : 'low'),
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        var marker = L.marker([m.latitude, m.longitude], { icon: mIcon }).addTo(map);
        if (m.title) {
          marker.bindPopup('<b>' + m.title + '</b><br/>' + (m.description || ''));
        }
        group.push([m.latitude, m.longitude]);
      });
      if (group.length > 0 && !${draggable}) {
        map.fitBounds(group, { padding: [30, 30], maxZoom: 14 });
      }
    ` : ''}

    window.updatePosition = function(newLat, newLng, newZoom) {
      if (${draggable}) {
        if (mainMarker) {
          mainMarker.setLatLng([newLat, newLng]);
        }
      }
      if (newZoom) {
        map.setView([newLat, newLng], newZoom, { animate: true });
      } else {
        map.panTo([newLat, newLng], { animate: true });
      }
    };

    var activeTouches = 0;
    document.addEventListener('touchstart', function(e) {
      activeTouches = e.touches.length;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOUCH_START', count: activeTouches }));
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      activeTouches = e.touches.length;
      if (activeTouches === 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOUCH_END' }));
      }
    }, { passive: true });

    document.addEventListener('touchcancel', function(e) {
      activeTouches = 0;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOUCH_END' }));
    }, { passive: true });
  </script>
</body>
</html>
  `;

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updatePosition) {
          window.updatePosition(${validLat}, ${validLng}, ${zoom});
        }
        true;
      `);
    }
  }, [validLat, validLng, zoom]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PIN_MOVED' && onLocationSelect) {
        onLocationSelect({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
      } else if (data.type === 'TOUCH_START') {
        handleInteraction(true);
      } else if (data.type === 'TOUCH_END') {
        handleInteraction(false);
      }
    } catch (err) {
      console.warn('Leaflet message parse error:', err);
    }
  };

  return (
    <View
      onStartShouldSetResponderCapture={() => {
        handleInteraction(true);
        return false;
      }}
      onMoveShouldSetResponderCapture={() => {
        handleInteraction(true);
        return false;
      }}
      onTouchStart={() => handleInteraction(true)}
      onTouchEnd={() => handleInteraction(false)}
      onTouchCancel={() => handleInteraction(false)}
      style={[{ height, borderRadius, overflow: 'hidden', backgroundColor: '#F8FAFC' }, style]}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        nestedScrollEnabled={false}
        overScrollMode="never"
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidHardwareAccelerationDisabled={false}
        renderLoading={() => (
          <View style={StyleSheet.absoluteFill}>
            <ActivityIndicator size="small" color="#059669" style={{ marginTop: height / 2 - 12 }} />
          </View>
        )}
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        scrollEnabled={false}
      />
    </View>
  );
};

export default LeafletMap;
