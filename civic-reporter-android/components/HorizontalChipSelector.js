import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HorizontalChipSelector = ({
  items = [],
  selected,
  onSelect,
  getKey = (item) => (typeof item === 'object' ? item.code || item.id || item.key : item),
  getLabel = (item) => (typeof item === 'object' ? item.nativeName || item.label || item.name : item),
  activeColor = '#059669',
  activeTextColor = '#FFFFFF',
  inactiveColor = '#334155',
  inactiveBg = '#FFFFFF',
  inactiveBorder = '#CBD5E1',
  fadeColor = '#FFFFFF',
  contentPaddingHorizontal = 16,
  containerStyle,
}) => {
  const scrollRef = useRef(null);
  const itemLayouts = useRef({});
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Auto-scroll selected chip into view
  useEffect(() => {
    if (!selected) return;
    const layout = itemLayouts.current[selected];
    if (layout && scrollRef.current && containerWidth > 0) {
      // Center the selected chip in view
      const targetX = Math.max(0, layout.x - containerWidth / 2 + layout.width / 2);
      scrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [selected, containerWidth]);

  const canScrollLeft = scrollX > 10;
  const canScrollRight = contentWidth > containerWidth && scrollX < contentWidth - containerWidth - 10;

  // Resolve fade gradient colors based on fadeColor
  const isDarkish = fadeColor.toLowerCase() === '#f8fafc' || fadeColor.toLowerCase() === '#f1f5f9';
  const fadeStart = isDarkish ? 'rgba(248, 250, 252, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const fadeEnd = isDarkish ? 'rgba(248, 250, 252, 0)' : 'rgba(255, 255, 255, 0)';

  return (
    <View
      style={[{ position: 'relative' }, containerStyle]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        onContentSizeChange={(w) => setContentWidth(w)}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: contentPaddingHorizontal,
          paddingVertical: 4,
          alignItems: 'center',
        }}
      >
        {items.map((item) => {
          const key = getKey(item);
          const label = getLabel(item);
          const isSelected = selected === key;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelect(item)}
              onLayout={(e) => {
                itemLayouts.current[key] = e.nativeEvent.layout;
              }}
              activeOpacity={0.75}
              style={{
                minHeight: 44,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 14,
                backgroundColor: isSelected ? activeColor : inactiveBg,
                borderWidth: 1.5,
                borderColor: isSelected ? activeColor : inactiveBorder,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                shadowColor: isSelected ? activeColor : '#000',
                shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                shadowOpacity: isSelected ? 0.2 : 0,
                shadowRadius: 4,
                elevation: isSelected ? 2 : 0,
              }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? activeTextColor : inactiveColor,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Left Edge Gradient Fade */}
      {canScrollLeft && (
        <LinearGradient
          colors={[fadeStart, fadeEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 32,
            zIndex: 10,
          }}
        />
      )}

      {/* Right Edge Gradient Fade */}
      {canScrollRight && (
        <LinearGradient
          colors={[fadeEnd, fadeStart]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 32,
            zIndex: 10,
          }}
        />
      )}

      {/* Subtle Scroll Indicator Bar below when content overflows */}
      {contentWidth > containerWidth && containerWidth > 0 && (
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <View style={{ width: 36, height: 3, borderRadius: 2, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
            <View
              style={{
                width: 12,
                height: '100%',
                borderRadius: 2,
                backgroundColor: activeColor,
                transform: [
                  {
                    translateX: Math.min(
                      24,
                      Math.max(0, (scrollX / Math.max(1, contentWidth - containerWidth)) * 24)
                    ),
                  },
                ],
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default HorizontalChipSelector;
