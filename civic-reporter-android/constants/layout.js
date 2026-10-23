import { useWindowDimensions } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const TYPOGRAPHY = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const BREAKPOINTS = {
  smallPhone: 360,
  standardPhone: 412,
  tablet: 600,
};

export const TABLET_MAX_WIDTH = 640;

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < BREAKPOINTS.smallPhone;
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLandscape = width > height;

  const tabletContainerStyle = isTablet
    ? {
        maxWidth: TABLET_MAX_WIDTH,
        width: '100%',
        alignSelf: 'center',
      }
    : {
        width: '100%',
      };

  return {
    width,
    height,
    isSmallPhone,
    isTablet,
    isLandscape,
    tabletContainerStyle,
    TABLET_MAX_WIDTH,
  };
};

export default {
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  BREAKPOINTS,
  TABLET_MAX_WIDTH,
  useResponsive,
};
