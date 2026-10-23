import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, AccessibilityInfo, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Enterprise Native Shimmer Skeleton Loader
 * Complies with Section 9 & Task 2 of MOBILE_PARITY_HANDOFF.md
 * 1.6s bezier cycle with emerald tint (rgba(209, 250, 229, 0.45))
 * Full reduced-motion compliance rendering flat #F1F5F9 backgrounds.
 */

export const SkeletonBox = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReducedMotion(enabled))
      .catch(() => {});

    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReducedMotion(enabled)
    );

    return () => {
      listener?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const shimmerAnim = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1600, // 1.6s cycle
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    );
    shimmerAnim.start();

    return () => shimmerAnim.stop();
  }, [reducedMotion, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 250],
  });

  const opacityPulse = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.75, 1, 0.75],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#F1F5F9', // Slate-100 base
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}
    >
      {!reducedMotion && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: opacityPulse,
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(241, 245, 249, 0)',
              'rgba(209, 250, 229, 0.45)', // Emerald-100 45% tint
              'rgba(255, 255, 255, 0.65)',
              'rgba(209, 250, 229, 0.45)',
              'rgba(241, 245, 249, 0)',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>
      )}
    </View>
  );
};

export const SkeletonCard = ({ style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          overflow: 'hidden',
          marginBottom: 16,
          paddingBottom: 16,
        },
        style,
      ]}
    >
      {/* Image Banner */}
      <SkeletonBox width="100%" height={180} borderRadius={0} />

      {/* Body */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        {/* Status Tracker Bar placeholder */}
        <SkeletonBox width="60%" height={10} borderRadius={5} style={{ marginBottom: 12 }} />

        {/* Address and Date placeholder */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <SkeletonBox width="85%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonBox width="45%" height={12} borderRadius={6} />
          </View>
          <SkeletonBox width={48} height={26} borderRadius={13} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonStatCard = ({ style }) => {
  return (
    <View
      style={[
        {
          flex: 1,
          minWidth: '45%',
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <SkeletonBox width={16} height={16} borderRadius={8} />
        <SkeletonBox width={70} height={12} borderRadius={6} />
      </View>
      <SkeletonBox width={50} height={28} borderRadius={8} />
    </View>
  );
};

export const SkeletonDetail = () => {
  return (
    <View style={{ padding: 16 }}>
      {/* Top Header Placeholder */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <SkeletonBox width={120} height={22} borderRadius={8} />
        <SkeletonBox width={80} height={22} borderRadius={11} />
      </View>

      {/* Hero Image */}
      <SkeletonBox width="100%" height={260} borderRadius={20} style={{ marginBottom: 16 }} />

      {/* Tracker Card */}
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <SkeletonBox width="50%" height={14} borderRadius={6} style={{ marginBottom: 14 }} />
        <SkeletonBox width="100%" height={32} borderRadius={16} />
      </View>

      {/* Description Card */}
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <SkeletonBox width="40%" height={16} borderRadius={6} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox width="90%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox width="60%" height={14} borderRadius={6} />
      </View>
    </View>
  );
};

export const SkeletonList = ({ count = 3, itemHeight = 60, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            height: itemHeight,
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 8,
            justifyContent: 'center',
          }}
        >
          <SkeletonBox width="70%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
          <SkeletonBox width="40%" height={11} borderRadius={5} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonFeed = ({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
};

export default {
  SkeletonBox,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonDetail,
  SkeletonList,
  SkeletonFeed,
};
