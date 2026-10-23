import React from 'react';
import { View, Text } from 'react-native';

const Badge = ({ children, icon, color = 'purple', className = '' }) => {
  const colorMap = {
    purple: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
    emerald: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    amber: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    blue: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    red: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  };

  const style = colorMap[color] || colorMap.purple;

  return (
    <View
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
      }}
      className={className}
    >
      {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
      <Text style={{ color: style.text, fontSize: 11, fontWeight: '700' }}>
        {children}
      </Text>
    </View>
  );
};

export default Badge;
