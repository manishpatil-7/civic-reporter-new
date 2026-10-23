import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, Star } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { TABLET_MAX_WIDTH } from '../../constants/layout';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      Toast.show({
        type: 'success',
        text1: 'Welcome back! 👋',
        text2: 'Signed in successfully.',
      });
      navigation.navigate('MainTabs');
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      };
      setError(messages[err.code] || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) + 20 }}
        >
          {/* Brand Banner */}
          <View
            style={{
              backgroundColor: '#065F46',
              paddingTop: Math.max(insets.top + 24, 48),
              paddingBottom: 36,
              paddingHorizontal: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              alignItems: 'center',
            }}
          >
            <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Leaf size={24} color="#059669" />
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 24, fontWeight: '800', color: '#FFFFFF' }}
                >
                  Civic Reporter
                </Text>
              </View>

              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 28, fontWeight: '900', color: '#FFFFFF', lineHeight: 34, marginBottom: 8 }}
              >
                Real impact.{'\n'}Better neighborhoods.
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 14, color: '#A7F3D0', lineHeight: 20, marginBottom: 20 }}
              >
                Report civic issues instantly, track their progress, and build a better community together.
              </Text>

              {/* Trust Stat Badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 16,
                  padding: 12,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(254, 240, 138, 0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Star size={20} color="#FACC15" fill="#FACC15" />
                </View>
                <View>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}
                  >
                    4.9 / 5.0 Rating
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ color: '#D1FAE5', fontSize: 12 }}
                  >
                    Trusted by Citizens across India
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Login Form Container */}
          <View style={{ padding: 24, alignItems: 'center' }}>
            <View
              style={{
                width: '100%',
                maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}
              >
                Welcome Back
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}
              >
                Sign in to manage and report issues
              </Text>

              {/* Error Message */}
              {error ? (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FECACA',
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={18} color="#DC2626" />
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 13, color: '#B91C1C', flex: 1, fontWeight: '600' }}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Email Field */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 }}
                >
                  Email Address <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Mail size={18} color="#94A3B8" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#0F172A' }}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 }}
                >
                  Password <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Lock size={18} color="#94A3B8" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor="#94A3B8"
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#0F172A' }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} style={{ padding: 4 }}>
                    {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#059669',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                  >
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Links */}
              <View style={{ marginTop: 24, alignItems: 'center', gap: 14 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 14, color: '#64748B' }}
                  >
                    Don't have an account?{' '}
                    <Text style={{ color: '#059669', fontWeight: '800' }}>Create one →</Text>
                  </Text>
                </TouchableOpacity>

                <View style={{ width: '100%', height: 1, backgroundColor: '#F1F5F9' }} />

                <TouchableOpacity onPress={() => navigation.navigate('AuthorityLogin')} activeOpacity={0.7}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 12, color: '#94A3B8', fontWeight: '600' }}
                  >
                    Authority / Officer Login →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
