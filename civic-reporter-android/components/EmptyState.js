import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Inbox } from 'lucide-react-native';

const EmptyState = ({
  icon: Icon = Inbox,
  heading = 'No results found',
  message = 'Try adjusting your filters or search terms.',
  ctaText,
  onPress,
}) => {
  return (
    <View
      style={{
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginVertical: 16,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#ECFDF5',
          borderWidth: 1,
          borderColor: '#D1FAE5',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={32} color="#059669" />
      </View>
      <Text
        maxFontSizeMultiplier={1.3}
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {heading}
      </Text>
      <Text
        maxFontSizeMultiplier={1.3}
        style={{
          fontSize: 14,
          color: '#64748B',
          textAlign: 'center',
          marginBottom: ctaText ? 20 : 0,
          lineHeight: 20,
          maxWidth: 280,
        }}
      >
        {message}
      </Text>

      {ctaText && onPress && (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={{
            backgroundColor: '#059669',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text maxFontSizeMultiplier={1.3} style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
            {ctaText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;
