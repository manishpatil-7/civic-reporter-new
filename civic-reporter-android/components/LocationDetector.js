import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react-native';

const SOURCE_LABELS = {
  EXIF_GPS: { label: 'GPS Data', icon: '🛰️', color: '#10B981' },
  PLUS_CODE: { label: 'Plus Code', icon: '📍', color: '#3B82F6' },
  ADDRESS_STRING: { label: 'Image Metadata', icon: '🏷️', color: '#8B5CF6' },
  MANUAL: { label: 'Manual Pin', icon: '👆', color: '#F97316' },
  BROWSER_GPS: { label: 'Device GPS', icon: '📱', color: '#06B6D4' },
};

const LocationDetector = ({ status, source, address, onManualSelect }) => {
  if (status === 'idle') return null;

  const sourceInfo = SOURCE_LABELS[source] || SOURCE_LABELS.MANUAL;

  if (status === 'detecting') {
    return (
      <View
        style={{
          backgroundColor: '#EFF6FF',
          borderWidth: 1,
          borderColor: '#BFDBFE',
          borderRadius: 16,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginVertical: 10,
        }}
      >
        <ActivityIndicator size="small" color="#2563EB" />
        <View style={{ flex: 1 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 13, fontWeight: '700', color: '#1E3A8A' }}>
            Detecting location from photo...
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#1D4ED8', marginTop: 2 }}>
            Scanning GPS tags and reverse geocoding
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'found') {
    return (
      <View
        style={{
          backgroundColor: '#ECFDF5',
          borderWidth: 1,
          borderColor: '#A7F3D0',
          borderRadius: 16,
          padding: 14,
          marginVertical: 10,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={18} color="#059669" />
            <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 13, fontWeight: '700', color: '#065F46' }}>
              {source === 'BROWSER_GPS' ? '📱 Mobile GPS Location' : '📍 Location detected from photo'}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 10, fontWeight: '700', color: '#334155' }}>
              {sourceInfo.icon} {sourceInfo.label}
            </Text>
          </View>
        </View>

        {address?.fullAddress && (
          <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 12, color: '#475569', marginVertical: 4, lineHeight: 16 }} numberOfLines={2}>
            {address.fullAddress}
          </Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {address?.city && <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#64748B' }}>🏙️ {address.city}</Text>}
            {address?.district && <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#64748B' }}>📍 {address.district}</Text>}
            {address?.state && <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#64748B' }}>🗺️ {address.state}</Text>}
          </View>

          {onManualSelect && (
            <TouchableOpacity onPress={onManualSelect} activeOpacity={0.7}>
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#2563EB', fontWeight: '600', textDecorationLine: 'underline' }}>
                Adjust Pin
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (status === 'not_found') {
    return (
      <View
        style={{
          backgroundColor: '#FFF7ED',
          borderWidth: 1,
          borderColor: '#FED7AA',
          borderRadius: 16,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginVertical: 10,
        }}
      >
        <AlertCircle size={20} color="#EA580C" />
        <View style={{ flex: 1 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 13, fontWeight: '700', color: '#9A3412' }}>
            📍 No GPS found in photo
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#C2410C', marginTop: 2 }}>
            Using device location fallback. You can drag the map pin to adjust.
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View
        style={{
          backgroundColor: '#FEF2F2',
          borderWidth: 1,
          borderColor: '#FECACA',
          borderRadius: 16,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginVertical: 10,
        }}
      >
        <AlertCircle size={20} color="#DC2626" />
        <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 12, color: '#B91C1C', flex: 1 }}>
          Location detection failed. Using device location fallback.
        </Text>
      </View>
    );
  }

  return null;
};

export default LocationDetector;
