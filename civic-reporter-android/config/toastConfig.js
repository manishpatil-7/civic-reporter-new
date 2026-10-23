import React from 'react';
import { View, Text } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10B981',
        borderLeftWidth: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 64,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
      }}
      text2Style={{
        fontSize: 13,
        color: '#4B5563',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#DC2626',
        borderLeftWidth: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 64,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
      }}
      text2Style={{
        fontSize: 13,
        color: '#4B5563',
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        borderLeftWidth: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 64,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
      }}
      text2Style={{
        fontSize: 13,
        color: '#4B5563',
      }}
    />
  ),
};

export default toastConfig;
