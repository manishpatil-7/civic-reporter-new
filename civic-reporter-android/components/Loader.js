import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import { Sparkles, ScanSearch } from 'lucide-react-native';

const aiSteps = [
  "Scanning with Local YOLO11n Model...",
  "Inspecting road surface & waste accumulation...",
  "Evaluating severity & municipal jurisdiction...",
  "Drafting complaint letter with official template..."
];

const Loader = ({ text, subtitle }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1 < aiSteps.length ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [text]);

  const displayText = text || aiSteps[stepIndex];
  const displaySubtitle = subtitle || "Civic Vision Inference & Verification";

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Outer Circle Container with Pulsing Radar Effect */}
      <Animated.View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#ECFDF5',
          borderWidth: 2,
          borderColor: '#A7F3D0',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          position: 'relative',
          transform: [{ scale: pulseAnim }],
          shadowColor: '#059669',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <ActivityIndicator size="large" color="#059669" style={{ position: 'absolute' }} />
        <ScanSearch size={42} color="#059669" />
      </Animated.View>

      {/* Step Text with Sparkles */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 16 }}>
        <Sparkles size={18} color="#059669" style={{ marginRight: 6 }} />
        <Text
          maxFontSizeMultiplier={1.3}
          style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}
        >
          {displayText}
        </Text>
      </View>

      <Text
        maxFontSizeMultiplier={1.3}
        style={{
          fontSize: 11.5,
          color: '#64748B',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {displaySubtitle}
      </Text>

      {/* Progress pill dots */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
        {aiSteps.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === stepIndex ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i <= stepIndex ? '#059669' : '#CBD5E1',
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default Loader;
