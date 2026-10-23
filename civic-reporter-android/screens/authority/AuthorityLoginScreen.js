import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Building2, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { authorityLogin } from '../../services/authorityApi';
import { TABLET_MAX_WIDTH } from '../../constants/layout';
import Toast from 'react-native-toast-message';

const AuthorityLoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please provide officer credentials.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await authorityLogin(email.trim(), password);
      await AsyncStorage.setItem('authorityToken', res.data.token);
      await AsyncStorage.setItem('authorityUser', JSON.stringify(res.data.authority));
      Toast.show({
        type: 'success',
        text1: 'Officer Portal Access',
        text2: 'Logged in as Municipal Authority',
      });
      navigation.navigate('AuthorityDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authority login failed');
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
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Math.max(insets.bottom, 24),
            alignItems: 'center',
          }}
        >
          <View style={{ width: '100%', maxWidth: TABLET_MAX_WIDTH, alignSelf: 'center' }}>
            {/* Authority Header */}
            <View
              style={{
                backgroundColor: '#1E3A8A',
                paddingTop: Math.max(insets.top + 16, 44),
                paddingBottom: 36,
                paddingHorizontal: 24,
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}
              >
                <ArrowLeft size={18} color="#93C5FD" />
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ color: '#93C5FD', fontSize: 13, fontWeight: '600' }}
                >
                  Back to Citizen Portal
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF' }}
                  >
                    Authority Portal
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 12, color: '#BFDBFE' }}
                  >
                    Government & Municipal Officer Access
                  </Text>
                </View>
              </View>

              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#DBEAFE', lineHeight: 18, marginTop: 4 }}
              >
                Panchayat Sarpanch, Municipal Council Chief Officers, and Corporation Commissioners login here to resolve citizen reports.
              </Text>
            </View>

            {/* Login Form Container */}
            <View style={{ padding: 24 }}>
              <View
                style={{
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
                  style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}
                >
                  Officer Sign In
                </Text>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}
                >
                  Use your department email credentials
                </Text>

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
                      maxFontSizeMultiplier={1.3}
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
                    Officer Email <Text style={{ color: '#EF4444' }}>*</Text>
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
                      placeholder="officer@mumbai.gov.in"
                      placeholderTextColor="#94A3B8"
                      maxFontSizeMultiplier={1.3}
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
                      secureTextEntry
                      placeholder="••••••••••••"
                      placeholderTextColor="#94A3B8"
                      maxFontSizeMultiplier={1.3}
                      style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#0F172A' }}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#1E3A8A',
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                    >
                      Login as Authority
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AuthorityLoginScreen;
