import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Leaf,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { sendOTP, verifyOTP } from '../../services/api';
import Toast from 'react-native-toast-message';
import { TABLET_MAX_WIDTH } from '../../constants/layout';

// Password Strength Meter
const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const levels = [
    { label: 'Weak', color: '#EF4444', percent: '25%' },
    { label: 'Fair', color: '#F59E0B', percent: '50%' },
    { label: 'Good', color: '#EAB308', percent: '75%' },
    { label: 'Strong', color: '#10B981', percent: '100%' },
  ];

  if (!password) return null;
  const level = levels[Math.max(0, strength - 1)] || levels[0];

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: '#64748B' }}>Password strength</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: level.color }}>
          {level.label}
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: level.percent,
            backgroundColor: level.color,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
};

const SignupScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // OTP states
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Hardware back button returns to Step 1 if in Step 2
  useEffect(() => {
    if (step !== 2) return;
    const onBackPress = () => {
      setStep(1);
      setError('');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [step]);

  const handleSendOTP = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your full name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setOtpSending(true);
    try {
      await sendOTP(email.trim(), name.trim());
      Toast.show({
        type: 'success',
        text1: 'OTP Sent! ✉️',
        text2: `A 6-digit code was sent to ${email.trim()}`,
      });
      setStep(2);
      setCountdown(300);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean.slice(-1);
    setOtp(newOtp);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerifyAndSignup = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setError('');
    setOtpVerifying(true);
    try {
      const verifyRes = await verifyOTP(email.trim(), otpString);
      if (!verifyRes.data.verified) {
        setError('Invalid OTP code. Please try again.');
        setOtpVerifying(false);
        return;
      }

      await signup(name.trim(), email.trim(), password);
      Toast.show({
        type: 'success',
        text1: 'Account Created! 🎉',
        text2: 'Welcome to Civic Reporter.',
      });
      navigation.navigate('MainTabs');
    } catch (err) {
      const msg = err.response?.data?.message || err.code;
      const messages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      setError(messages[msg] || msg || 'Signup failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtpSending(true);
    setError('');
    try {
      await sendOTP(email.trim(), name.trim());
      Toast.show({
        type: 'success',
        text1: 'OTP Resent 🔄',
        text2: 'A new code has been sent to your email.',
      });
      setCountdown(300);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
          {/* Header */}
          <View
            style={{
              backgroundColor: '#065F46',
              paddingTop: Math.max(insets.top + 20, 44),
              paddingBottom: 28,
              paddingHorizontal: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              alignItems: 'center',
            }}
          >
            <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%' }}>
              <TouchableOpacity
                onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}
              >
                <ArrowLeft size={18} color="#A7F3D0" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#A7F3D0', fontSize: 13, fontWeight: '700' }}
                >
                  {step === 2 ? 'Back to details' : 'Back to login'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Leaf size={20} color="#059669" />
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 20, fontWeight: '800', color: '#FFFFFF' }}
                >
                  Join Civic Reporter
                </Text>
              </View>

              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#A7F3D0', lineHeight: 18 }}
              >
                Help improve your city by reporting civic problems with instant AI assistance.
              </Text>
            </View>
          </View>

          {/* Form Container */}
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
                style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}
              >
                {step === 1 ? 'Create Your Account' : 'Verify Email Address'}
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}
              >
                {step === 1 ? 'Step 1 of 2: Profile setup' : `Step 2 of 2: Code sent to ${email}`}
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

              {step === 1 ? (
                /* Step 1: Form */
                <View>
                  {/* Full Name */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 }}
                    >
                      Full Name <Text style={{ color: '#EF4444' }}>*</Text>
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
                      <User size={18} color="#94A3B8" />
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Your full name"
                        placeholderTextColor="#94A3B8"
                        style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#0F172A' }}
                      />
                    </View>
                  </View>

                  {/* Email Address */}
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

                  {/* Password */}
                  <View style={{ marginBottom: 20 }}>
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
                        placeholder="Minimum 6 characters"
                        placeholderTextColor="#94A3B8"
                        style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#0F172A' }}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} style={{ padding: 4 }}>
                        {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                      </TouchableOpacity>
                    </View>
                    <PasswordStrength password={password} />
                  </View>

                  {/* Submit OTP Button */}
                  <TouchableOpacity
                    onPress={handleSendOTP}
                    disabled={otpSending}
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
                    {otpSending ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <UserPlus size={18} color="#FFFFFF" />
                        <Text
                          maxFontSizeMultiplier={1.2}
                          style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                        >
                          Continue with OTP
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Already have account */}
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{ fontSize: 14, color: '#64748B' }}
                      >
                        Already have an account?{' '}
                        <Text style={{ color: '#059669', fontWeight: '800' }}>Sign in →</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Step 2: OTP Verification */
                <View>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 }}
                  >
                    Enter the 6-digit code sent to your email
                  </Text>

                  {/* OTP Boxes */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                    {otp.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(idx, val)}
                        keyboardType="number-pad"
                        maxLength={1}
                        style={{
                          width: 44,
                          height: 52,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: digit ? '#059669' : '#CBD5E1',
                          backgroundColor: '#F8FAFC',
                          textAlign: 'center',
                          fontSize: 20,
                          fontWeight: '800',
                          color: '#0F172A',
                        }}
                      />
                    ))}
                  </View>

                  {/* Resend Timer */}
                  {countdown > 0 ? (
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 20 }}
                    >
                      Resend code in{' '}
                      <Text style={{ color: '#059669', fontWeight: '700' }}>{formatTime(countdown)}</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendOTP}
                      disabled={otpSending}
                      activeOpacity={0.7}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}
                    >
                      <RefreshCw size={16} color="#059669" />
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{ color: '#059669', fontWeight: '700', fontSize: 13 }}
                      >
                        Resend OTP Code
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Verify Button */}
                  <TouchableOpacity
                    onPress={handleVerifyAndSignup}
                    disabled={otpVerifying || otp.join('').length !== 6}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: otp.join('').length === 6 ? '#059669' : '#94A3B8',
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {otpVerifying ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <ShieldCheck size={18} color="#FFFFFF" />
                        <Text
                          maxFontSizeMultiplier={1.2}
                          style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                        >
                          Verify & Create Account
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Back to Form */}
                  <TouchableOpacity
                    onPress={() => {
                      setStep(1);
                      setError('');
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <ArrowLeft size={16} color="#64748B" />
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{ color: '#64748B', fontWeight: '600', fontSize: 13 }}
                    >
                      Back to registration
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
