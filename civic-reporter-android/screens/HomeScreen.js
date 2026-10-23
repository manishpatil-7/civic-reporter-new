import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Landmark,
  Clock,
  Construction,
  Trash2,
  Droplets,
  Lightbulb,
  TreePine,
  Zap,
  CircleDot,
  AlertTriangle,
  MapPin,
  Globe,
  FileText,
  Download,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import CustomHeader from '../components/CustomHeader';
import { TABLET_MAX_WIDTH } from '../constants/layout';
import Toast from 'react-native-toast-message';

// 6 Sequential Workflow Steps (from Section 5.2 of MOBILE_PARITY_HANDOFF.md)
const WORKFLOW_STEPS = [
  {
    step: 1,
    icon: Camera,
    title: 'Take a Photo',
    desc: 'Capture the civic issue in your area with your mobile camera.',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'We Analyze',
    desc: 'Our system helps identify the issue and its type automatically.',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
  },
  {
    step: 3,
    icon: MapPin,
    title: 'Location Is Found',
    desc: 'Location information helps identify the area and responsible authority.',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    step: 4,
    icon: Landmark,
    title: 'Sent to Authority',
    desc: 'Direct the complaint to the relevant gram panchayat, municipal council, or department.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    step: 5,
    icon: FileText,
    title: 'Track Progress',
    desc: 'Follow the complaint’s progress with timestamped audit milestones.',
    color: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
  },
  {
    step: 6,
    icon: CheckCircle2,
    title: 'Issue Resolved',
    desc: 'Track the official municipal response and verified ground outcome.',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
];

// 8 Genuine Issue Categories (from Section 5.3 of MOBILE_PARITY_HANDOFF.md)
const CATEGORIES = [
  {
    label: 'Roads & Potholes',
    param: 'Pothole',
    icon: Construction,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  {
    label: 'Garbage & Waste',
    param: 'Garbage',
    icon: Trash2,
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
  },
  {
    label: 'Drainage & Flooding',
    param: 'Drainage',
    icon: Droplets,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    label: 'Street Lights',
    param: 'Street Light',
    icon: Lightbulb,
    color: '#CA8A04',
    bg: '#FEFCE8',
    border: '#FEF08A',
  },
  {
    label: 'Water Supply',
    param: 'Water Supply',
    icon: Droplets,
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
  },
  {
    label: 'Parks & Public Spaces',
    param: 'Park Maintenance',
    icon: TreePine,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    label: 'Electricity & Utilities',
    param: 'Electricity',
    icon: Zap,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    label: 'Other Issues',
    param: 'Other',
    icon: AlertTriangle,
    color: '#4B5563',
    bg: '#F3F4F6',
    border: '#E5E7EB',
  },
];

// 4 Verified Impact Statistics (from Section 5.4 of MOBILE_PARITY_HANDOFF.md)
const IMPACT_STATS = [
  { value: '10,000+', title: 'Citizens Participating', subtitle: 'Active across urban & rural areas' },
  { value: '25,000+', title: 'Issues Reported', subtitle: 'Geo-tagged & AI verified' },
  { value: '100+', title: 'Authorities Connected', subtitle: 'Gram panchayats & municipal councils' },
  { value: '88%', title: 'Issues Resolved', subtitle: 'Verified ground action rate' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  // Demo download PDF interaction state
  const [downloading, setDownloading] = useState(false);

  const handleDownloadDemo = () => {
    if (downloading) return;
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      Toast.show({
        type: 'success',
        text1: 'Sample Formal Report Ready 📄',
        text2: 'Demonstration PDF rendered with authority letterhead.',
      });
    }, 1200);
  };

  const handleCategoryPress = (param) => {
    // Navigates directly to Submit with pre-selected category parameter
    navigation.navigate('Submit', { category: param });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
            alignSelf: 'center',
          }}
        >
          {/* ============================================================
              1. HERO SECTION (Aspect 2/1 Card, Gradient & Headline)
              ============================================================ */}
          <LinearGradient
            colors={['#EAF8F1', '#F5FAF7', '#FFFFFF']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 28,
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}
          >
            {/* Platform Pill Badge */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  backgroundColor: '#FFFFFF',
                  borderColor: '#A7F3D0',
                  borderWidth: 1.5,
                  borderRadius: 24,
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Pulsing Radar Dot */}
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                {/* Indian Flag Color Accent Bars */}
                <View style={{ flexDirection: 'row', height: 10, width: 14, borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ flex: 1, backgroundColor: '#FF9933' }} />
                  <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
                  <View style={{ flex: 1, backgroundColor: '#138808' }} />
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 11.5, fontWeight: '800', color: '#065F46' }}
                >
                  CivicTech Platform for Every Village and City
                </Text>
              </View>
            </View>

            {/* Headline */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: 34,
                fontWeight: '900',
                color: '#0F172A',
                textAlign: 'center',
                lineHeight: 40,
                letterSpacing: -0.6,
                marginBottom: 8,
              }}
            >
              Your Community.{'\n'}
              Your Voice.{'\n'}
              <Text style={{ color: '#059669' }}>A Cleaner, Safer India.</Text>
            </Text>

            {/* Supporting Description */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: 14.5,
                color: '#475569',
                textAlign: 'center',
                lineHeight: 22,
                maxWidth: 420,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            >
              See a problem in your village, town or city? Take a photo, and Civic Reporter helps identify the issue and send your complaint to the right government authority — quickly and easily.
            </Text>

            {/* CTAs */}
            <View style={{ gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(user ? 'Submit' : 'Signup')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#059669',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                  borderRadius: 16,
                  gap: 8,
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.28,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Camera size={19} color="#FFFFFF" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}
                >
                  Report a Problem
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Dashboard')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderWidth: 1.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 13,
                  borderRadius: 16,
                  gap: 8,
                }}
              >
                <Search size={18} color="#334155" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#334155', fontWeight: '700', fontSize: 15 }}
                >
                  View Live Dashboard
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3 Supporting Trust Badges */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                marginBottom: 22,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9' }}>
                <ShieldCheck size={18} color="#059669" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>
                  Free for Everyone
                </Text>
                <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
                  100% Public Good
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9' }}>
                <Camera size={18} color="#059669" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>
                  Just a Photo
                </Text>
                <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
                  No Lengthy Forms
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Globe size={18} color="#059669" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>
                  Available in 13+
                </Text>
                <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
                  Indian Languages
                </Text>
              </View>
            </View>

            {/* HERO SHOWCASE CARD (Aspect 2/1 with Dedicated Image Stage) */}
            <View
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                backgroundColor: '#0F172A',
                borderWidth: 1.5,
                borderColor: '#A7F3D0',
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.18,
                shadowRadius: 14,
                elevation: 5,
                position: 'relative',
              }}
            >
              {/* Aspect 2/1 container for Hero Image */}
              <View style={{ width: '100%', height: Math.round((windowWidth - 40) * 0.55), maxHeight: 240, minHeight: 170 }}>
                <Image
                  source={require('../assets/civic-reporter-hero.jpg')}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
              </View>

              {/* Top Overlay Badge */}
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  AI Vision Evidence Capture
                </Text>
              </View>

              {/* Bottom Card Strip */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTopWidth: 1,
                  borderTopColor: '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>
                    Instant Pothole & Waste Detection
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontStyle: 'italic', fontWeight: '600', color: '#059669' }}>
                  Your Photo, Stronger Tomorrow
                </Text>
              </View>
            </View>

            {/* 3 STATUS SHOWCASE WIDGETS */}
            <View style={{ marginTop: 18, gap: 10 }}>
              {/* Widget 1: Location Detected */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ width: 56, height: 46, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  <Image
                    source={require('../assets/mini-map.jpg')}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A' }}>
                      Location Detected
                    </Text>
                    <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#059669' }}>GPS Verified</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                    Shinganapur, Karvir, Kolhapur
                  </Text>
                </View>
              </View>

              {/* Widget 2: Auto Complaint (Interactive Demo Download) */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: '#ECFDF5',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A' }}>
                        Auto Complaint
                      </Text>
                      <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#2563EB' }}>AI Ready</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                      Jurisdiction-addressed formal letter
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleDownloadDemo}
                  disabled={downloading}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#059669',
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {downloading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Download size={14} color="#FFFFFF" />
                  )}
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                    {downloading ? 'Downloading...' : 'Download PDF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Widget 3: Routed to Authority */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: '#F5F3FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Landmark size={20} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A' }}>
                    Routed to Authority
                  </Text>
                  <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Municipal Corporation & Ward Office
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#ECFDF5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} color="#059669" />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* ============================================================
              2. HOW IT WORKS (6 STEPS)
              ============================================================ */}
          <View style={{ backgroundColor: '#F8FAFC', paddingVertical: 32, paddingHorizontal: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 22 }}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: '#059669',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 4,
                }}
              >
                HOW IT WORKS
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 24, fontWeight: '900', color: '#0F172A', textAlign: 'center' }}
              >
                From a Photo to Real Action in 6 Simple Steps
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, maxWidth: 380 }}
              >
                Civic Reporter handles the complexity — you just capture the issue. Our AI and location system do the rest.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
              {WORKFLOW_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <View
                    key={step.step}
                    style={{
                      width: isTablet ? '48%' : '100%',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      flexDirection: 'row',
                      gap: 14,
                      shadowColor: '#0F172A',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        backgroundColor: step.bg,
                        borderWidth: 1,
                        borderColor: step.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={step.color} />
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Step {step.step}
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.3}
                        style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 2, marginBottom: 2 }}
                      >
                        {step.title}
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.3}
                        style={{ fontSize: 12.5, color: '#64748B', lineHeight: 18 }}
                      >
                        {step.desc}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ============================================================
              3. ISSUE CATEGORIES (8 Genuine Categories)
              ============================================================ */}
          <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: '#059669',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 4,
                }}
              >
                ISSUE CATEGORIES
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 24, fontWeight: '900', color: '#0F172A', textAlign: 'center' }}
              >
                What Can You Report?
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, maxWidth: 380 }}
              >
                Report a local problem in your village, town or city that needs attention from the responsible authority.
              </Text>
            </View>

            {/* 2-Column Mobile Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.label}
                    onPress={() => handleCategoryPress(cat.param)}
                    activeOpacity={0.7}
                    style={{
                      width: isTablet ? '23%' : '48.5%',
                      backgroundColor: cat.bg,
                      borderColor: cat.border,
                      borderWidth: 1,
                      borderRadius: 18,
                      padding: 14,
                      alignItems: 'center',
                      gap: 8,
                      shadowColor: cat.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: cat.border,
                      }}
                    >
                      <Icon size={22} color={cat.color} />
                    </View>
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{
                        fontSize: 12.5,
                        fontWeight: '800',
                        color: cat.color,
                        textAlign: 'center',
                        lineHeight: 16,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ============================================================
              4. VISION & IMPACT SECTION (Gateway of India Showcase)
              ============================================================ */}
          <View style={{ backgroundColor: '#F8FAFC', paddingVertical: 32, paddingHorizontal: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: '#059669',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 4,
                }}
              >
                OUR VISION
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 24, fontWeight: '900', color: '#0F172A', textAlign: 'center' }}
              >
                Cleaner Cities for a Better India
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, maxWidth: 400 }}
              >
                Civic Reporter empowers citizens to report civic issues, helps authorities take faster action, and builds more transparent, accountable, and livable cities across India.
              </Text>
            </View>

            {/* 4 Impact Stat Cards (2x2 grid) */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 20 }}>
              {IMPACT_STATS.map((stat) => (
                <View
                  key={stat.title}
                  style={{
                    width: isTablet ? '23%' : '48.5%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{ fontSize: 22, fontWeight: '900', color: '#059669' }}
                    >
                      {stat.value}
                    </Text>
                    <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#059669' }}>Verified</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A', marginBottom: 2 }}>
                    {stat.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B', lineHeight: 15 }}>
                    {stat.subtitle}
                  </Text>
                </View>
              ))}
            </View>

            {/* PANORAMIC GATEWAY OF INDIA SHOWCASE STAGE */}
            <View
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                backgroundColor: '#0F172A',
                borderWidth: 1.5,
                borderColor: '#CBD5E1',
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
                elevation: 4,
                position: 'relative',
              }}
            >
              <View style={{ width: '100%', height: Math.round((windowWidth - 40) * 0.5), maxHeight: 220, minHeight: 160 }}>
                <Image
                  source={require('../assets/civic-reporter-vision.jpg')}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
              </View>

              {/* Tag pill badges over panorama */}
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#38BDF8' }} />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  Gateway of India • Mumbai
                </Text>
              </View>

              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#A7F3D0', fontSize: 10, fontWeight: '700' }}>
                  Iconic Civic Heritage
                </Text>
              </View>

              {/* Bottom strip */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTopWidth: 1,
                  borderTopColor: '#E2E8F0',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>
                  Civic Infrastructure & Public Good
                </Text>
                <Text style={{ fontSize: 11, fontStyle: 'italic', fontWeight: '600', color: '#059669' }}>
                  Better Infrastructure, Happier Communities
                </Text>
              </View>
            </View>
          </View>

          {/* ============================================================
              5. CLOSING CTA BANNER
              ============================================================ */}
          <LinearGradient
            colors={['#064E3B', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginHorizontal: 20,
              marginTop: 28,
              marginBottom: 16,
              borderRadius: 26,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#064E3B',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {/* Pill Badge */}
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#D1FAE5', fontSize: 11, fontWeight: '800' }}>
                Join 10,000+ Active Indian Citizens
              </Text>
            </View>

            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: 22,
                fontWeight: '900',
                color: '#FFFFFF',
                textAlign: 'center',
                lineHeight: 28,
                marginBottom: 8,
              }}
            >
              Work Together for Cleaner, Safer Communities
            </Text>

            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: 13,
                color: '#D1FAE5',
                textAlign: 'center',
                lineHeight: 19,
                marginBottom: 20,
                maxWidth: 380,
              }}
            >
              It takes only a few minutes to report a local problem. Share a photo and location to help the responsible authority understand the issue.
            </Text>

            {/* Action Buttons */}
            <View style={{ width: '100%', gap: 10, marginBottom: 18 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(user ? 'Submit' : 'Signup')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#FFFFFF',
                  paddingVertical: 14,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Camera size={18} color="#065F46" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#065F46', fontWeight: '900', fontSize: 15 }}
                >
                  Report an Issue Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Dashboard')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  paddingVertical: 13,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Search size={16} color="#FFFFFF" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}
                >
                  Explore Live Map
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3 Trust Badges */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.15)',
                paddingTop: 14,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#A7F3D0' }}>
                ✓ 100% Free
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#A7F3D0' }}>
                ✓ Instant Routing
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#A7F3D0' }}>
                ✓ Live Tracking
              </Text>
            </View>
          </LinearGradient>

          {/* ============================================================
              6. CLEAN FOOTER
              ============================================================ */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 18, alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate(user ? 'MyComplaints' : 'Login')} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                  {user ? 'My Reports' : 'Citizen Login'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('AuthorityLogin')} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Authority Portal</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
              © {new Date().getFullYear()} Civic Reporter. Built for transparent, accountable civic governance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
