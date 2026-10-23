import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Linking, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UploadCloud, Image as ImageIcon, X, Camera } from 'lucide-react-native';

const UploadBox = ({ onUpload, initialPreview = null, detections = [] }) => {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 360;
  const [preview, setPreview] = useState(initialPreview);

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Camera Permission Required',
            'Camera access is blocked in device settings. Please allow camera permissions to capture live evidence.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Camera Access Needed',
            'Camera permission is required to take live photos of civic issues.'
          );
        }
        return false;
      }
      return true;
    } else {
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Gallery Permission Required',
            'Media library access is blocked in device settings. Please allow media permissions to choose photos.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Gallery Access Needed',
            'Media library permission is required to choose photos from your device.'
          );
        }
        return false;
      }
      return true;
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermission('gallery');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        const fileObj = {
          uri: asset.uri,
          name: asset.fileName || 'upload.jpg',
          type: asset.mimeType || 'image/jpeg',
          exif: asset.exif || null,
        };
        onUpload(fileObj, asset.uri);
      }
    } catch (err) {
      console.error('Gallery picker error:', err);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        const fileObj = {
          uri: asset.uri,
          name: asset.fileName || 'camera.jpg',
          type: asset.mimeType || 'image/jpeg',
          exif: asset.exif || null,
        };
        onUpload(fileObj, asset.uri);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      Alert.alert('Error', 'Failed to capture photo with camera.');
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUpload(null, null);
  };

  return (
    <View style={{ width: '100%', marginVertical: 12 }}>
      {preview ? (
        <View
          style={{
            position: 'relative',
            width: '100%',
            height: Math.min(280, Math.max(200, windowWidth * 0.65)),
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#0F172A',
            borderWidth: 1,
            borderColor: '#CBD5E1',
          }}
        >
          <Image
            source={{ uri: preview }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />

          {/* AI Detection Bounding Boxes Overlay */}
          {detections && detections.length > 0 && detections.map((det, idx) => {
            const norm = det.normalized || (det.box_2d ? {
              y1: det.box_2d[0] / 1000,
              x1: det.box_2d[1] / 1000,
              y2: det.box_2d[2] / 1000,
              x2: det.box_2d[3] / 1000,
            } : null);
            if (!norm) return null;
            const left = `${Math.max(0, norm.x1 * 100)}%`;
            const top = `${Math.max(0, norm.y1 * 100)}%`;
            const width = `${Math.min(100, (norm.x2 - norm.x1) * 100)}%`;
            const height = `${Math.min(100, (norm.y2 - norm.y1) * 100)}%`;
            const confPercent = Math.round((det.confidence || 0.85) * 100);

            return (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width,
                  height,
                  borderWidth: 2,
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  borderRadius: 4,
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: -18,
                    left: 0,
                    backgroundColor: '#059669',
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                    {det.label || 'Detected'} {confPercent}%
                  </Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            onPress={removeImage}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              backgroundColor: '#FFFFFF',
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <X size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#E2E8F0',
            borderStyle: 'dashed',
            padding: isSmallScreen ? 16 : 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#ECFDF5',
              borderWidth: 1,
              borderColor: '#A7F3D0',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <UploadCloud size={32} color="#059669" />
          </View>

          <Text
            maxFontSizeMultiplier={1.3}
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 4,
              textAlign: 'center',
            }}
          >
            Upload issue evidence
          </Text>
          <Text
            maxFontSizeMultiplier={1.3}
            style={{
              fontSize: 13,
              color: '#64748B',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Take a live photo or select from gallery
          </Text>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: isSmallScreen ? 'column' : 'row',
              gap: 10,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              style={{
                flex: isSmallScreen ? undefined : 1,
                width: isSmallScreen ? '100%' : undefined,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#059669',
                paddingVertical: 13,
                paddingHorizontal: isSmallScreen ? 10 : 16,
                borderRadius: 14,
                gap: 6,
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Camera size={18} color="#FFFFFF" />
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickImage}
              activeOpacity={0.7}
              style={{
                flex: isSmallScreen ? undefined : 1,
                width: isSmallScreen ? '100%' : undefined,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F1F5F9',
                borderWidth: 1,
                borderColor: '#CBD5E1',
                paddingVertical: 13,
                paddingHorizontal: isSmallScreen ? 10 : 16,
                borderRadius: 14,
                gap: 6,
              }}
            >
              <ImageIcon size={18} color="#334155" />
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={{ color: '#334155', fontWeight: '600', fontSize: 14 }}
              >
                Gallery
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            maxFontSizeMultiplier={1.3}
            style={{
              fontSize: 11,
              color: '#94A3B8',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Supports JPG, PNG with automatic GPS location extraction
          </Text>
        </View>
      )}
    </View>
  );
};

export default UploadBox;
