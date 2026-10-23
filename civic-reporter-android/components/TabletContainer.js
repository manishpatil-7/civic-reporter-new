import React from 'react';
import { View } from 'react-native';
import { useResponsive } from '../constants/layout';

const TabletContainer = ({ children, style, contentStyle }) => {
  const { isTablet, tabletContainerStyle } = useResponsive();

  return (
    <View style={[{ width: '100%' }, isTablet && { alignItems: 'center' }, style]}>
      <View style={[tabletContainerStyle, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

export default TabletContainer;
