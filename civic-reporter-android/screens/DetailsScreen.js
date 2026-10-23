import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  ArrowLeft,
  ThumbsUp,
  MapPin,
  Clock,
  Building2,
  Copy,
  Share2,
  Maximize2,
  X,
  CheckCircle2,
  Globe,
  RefreshCw,
} from 'lucide-react-native';
import { getComplaintById, upvoteComplaint } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { copyToClipboard } from '../utils/clipboard';
import StatusTracker from '../components/StatusTracker';
import Badge from '../components/Badge';
import { SkeletonDetail } from '../components/Skeleton';
import Toast from 'react-native-toast-message';
import { TABLET_MAX_WIDTH } from '../constants/layout';

const DetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showAfterImage, setShowAfterImage] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fetchDetail = async () => {
    setError(false);
    try {
      const res = await getComplaintById(id);
      setComplaint(res.data);
      if (user && res.data.upvotedBy) {
        setHasUpvoted(res.data.upvotedBy.includes(user.uid));
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, user]);

  // Hardware Back Button for Lightbox modal
  useEffect(() => {
    if (!lightboxVisible) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setLightboxVisible(false);
      return true;
    });
    return () => backHandler.remove();
  }, [lightboxVisible]);

  const handleUpvote = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Required',
        text2: 'Please log in to upvote complaints',
      });
      return;
    }

    if (upvoting) return;
    setUpvoting(true);

    try {
      const res = await upvoteComplaint(id, user.uid);
      setComplaint(res.data);
      if (res.data.upvotedBy) {
        setHasUpvoted(res.data.upvotedBy.includes(user.uid));
      }
      Toast.show({
        type: 'success',
        text1: hasUpvoted ? 'Vote Removed' : 'Thanks for your support! 👍',
        text2: hasUpvoted ? 'Upvote retracted' : 'Your vote increases priority.',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Upvote Failed',
        text2: 'Could not record vote. Try again.',
      });
    } finally {
      setUpvoting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!complaint) return;
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b;">
            <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 24px;">
              <h1 style="color: #059669; margin: 0;">CIVIC ISSUE REPORT</h1>
              <p style="margin: 4px 0; color: #64748b;">Tracking ID: <strong>${complaint._id || complaint.id}</strong></p>
            </div>
            <h3>To: ${complaint.authorityBody || 'Municipal Authority'}</h3>
            <p><strong>Category:</strong> ${complaint.problemType} (${complaint.severity} Priority)</p>
            <p><strong>Status:</strong> ${complaint.status}</p>
            <p><strong>Location:</strong> ${complaint.locationAddress || complaint.location?.address || 'Specified Location'}</p>
            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
            <h4>Formal Complaint Letter</h4>
            <div style="white-space: pre-wrap; line-height: 1.6;">${complaint.formalLetter || complaint.description}</div>
            ${
              complaint.translatedLetter
                ? `<hr style="margin: 20px 0;" /><h4>Translated Version (${complaint.translatedLanguage || 'Regional'})</h4><div style="white-space: pre-wrap; line-height: 1.6;">${complaint.translatedLetter}</div>`
                : ''
            }
          </body>
        </html>
      `;

      try {
        await Print.printAsync({ html: htmlContent });
      } catch {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        Toast.show({ type: 'success', text1: 'PDF Created', text2: `Saved to ${uri.split('/').pop()}` });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 16,
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F1F5F9',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={20} color="#334155" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center', width: '100%' }}>
          <SkeletonDetail />
        </ScrollView>
      </View>
    );
  }

  if (error || !complaint) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignItems: 'center' }}>
          <Text
            maxFontSizeMultiplier={1.3}
            style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 12, textAlign: 'center' }}
          >
            {error ? 'Failed to Load Complaint' : 'Complaint Not Found'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {error && (
              <TouchableOpacity
                onPress={fetchDetail}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <RefreshCw size={16} color="#334155" />
                <Text style={{ color: '#334155', fontWeight: '700' }}>Retry</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={{ backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const hasAfterImage = complaint.status === 'Resolved' && complaint.afterImageUrl;
  const currentImage = showAfterImage && complaint.afterImageUrl ? complaint.afterImageUrl : complaint.imageUrl;
  const displayAddress = complaint.locationAddress || complaint.location?.address || 'Specified Location';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Header Bar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
          width: '100%',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={20} color="#334155" />
            <Text
              maxFontSizeMultiplier={1.2}
              style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExportPDF}
            activeOpacity={0.7}
            style={{ padding: 6 }}
          >
            <Share2 size={20} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center' }}>
          {/* Photo Gallery with Before/After Toggle */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 20,
            }}
          >
            {/* Before/After Tabs if Resolved */}
            {hasAfterImage && (
              <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4 }}>
                <TouchableOpacity
                  onPress={() => setShowAfterImage(false)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: 'center',
                    backgroundColor: !showAfterImage ? '#FFFFFF' : 'transparent',
                    borderRadius: 10,
                  }}
                >
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 13, fontWeight: '700', color: !showAfterImage ? '#0F172A' : '#64748B' }}
                  >
                    Before Evidence
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowAfterImage(true)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: 'center',
                    backgroundColor: showAfterImage ? '#059669' : 'transparent',
                    borderRadius: 10,
                  }}
                >
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 13, fontWeight: '700', color: showAfterImage ? '#FFFFFF' : '#64748B' }}
                  >
                    After Resolution ✨
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Image Display */}
            <View style={{ height: 260, position: 'relative', backgroundColor: '#0F172A' }}>
              <Image
                source={{ uri: currentImage }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />

              {/* AI Detections Bounding Box Overlay */}
              {!showAfterImage && complaint.detections && complaint.detections.length > 0 && complaint.detections.map((det, idx) => {
                const norm = det.normalized || (det.box_2d ? {
                  y1: det.box_2d[0] / 1000,
                  x1: det.box_2d[1] / 1000,
                  y2: det.box_2d[2] / 1000,
                  x2: det.box_2d[3] / 1000,
                } : null);
                if (!norm) return null;
                const left = `${Math.max(0, norm.x1 * 100)}%`;
                const top = `${Math.max(0, norm.y1 * 100)}%`;
                const width = `${Math.min(100, (norm.x2 - norm.x1) * 100)}%`;
                const height = `${Math.min(100, (norm.y2 - norm.y1) * 100)}%`;
                const confPercent = Math.round((det.confidence || 0.85) * 100);

                return (
                  <View
                    key={idx}
                    style={{
                      position: 'absolute',
                      left,
                      top,
                      width,
                      height,
                      borderWidth: 2,
                      borderColor: '#10B981',
                      borderRadius: 6,
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        top: -20,
                        left: 0,
                        backgroundColor: '#10B981',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                        {det.label || 'Defect'} {confPercent}%
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Tap to Fullscreen Button */}
              <TouchableOpacity
                onPress={() => {
                  setLightboxUrl(currentImage);
                  setLightboxVisible(true);
                }}
                activeOpacity={0.7}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Maximize2 size={14} color="#FFFFFF" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}
                >
                  Fullscreen
                </Text>
              </TouchableOpacity>

              {/* Badges on Top */}
              <View style={{ position: 'absolute', top: 12, left: 12 }}>
                <Badge color={complaint.severity === 'High' ? 'red' : complaint.severity === 'Medium' ? 'amber' : 'emerald'}>
                  {complaint.severity} Priority
                </Badge>
              </View>
            </View>
          </View>

          {/* Complaint Title & Upvote Button */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 4 }}
                >
                  {complaint.problemType}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} color="#059669" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 12, color: '#475569', flex: 1 }}
                  >
                    {displayAddress}
                  </Text>
                </View>
              </View>

              {/* Upvote Button */}
              <TouchableOpacity
                onPress={handleUpvote}
                disabled={upvoting}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: hasUpvoted ? '#ECFDF5' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: hasUpvoted ? '#A7F3D0' : '#CBD5E1',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  gap: 6,
                }}
              >
                {upvoting ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <>
                    <ThumbsUp size={16} color={hasUpvoted ? '#059669' : '#64748B'} />
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{ fontSize: 14, fontWeight: '800', color: hasUpvoted ? '#059669' : '#334155' }}
                    >
                      {complaint.upvotes || 0}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Tracking ID Pill */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
                padding: 10,
                borderRadius: 12,
              }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 12, color: '#64748B' }}
              >
                Ref ID: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{complaint._id || complaint.id}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(complaint._id || complaint.id, 'Complaint ID copied')}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Copy size={12} color="#059669" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ fontSize: 11, color: '#059669', fontWeight: '700' }}
                >
                  Copy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Live Status Timeline */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 16,
            }}
          >
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 16 }}
            >
              Status Progression
            </Text>
            <StatusTracker status={complaint.status} />
          </View>

          {/* Jurisdiction & Routing Details */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 16,
            }}
          >
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}
            >
              Assigned Authority & Jurisdiction
            </Text>

            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Building2 size={16} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}
                  >
                    Responsible Body
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}
                  >
                    {complaint.authorityBody || 'Municipal Corporation'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Clock size={16} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}
                  >
                    Reported On
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}
                  >
                    {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Official Complaint Letter */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}
              >
                Formal Complaint Letter
              </Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(complaint.formalLetter || complaint.description, 'Letter copied to clipboard!')
                }
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Copy size={13} color="#059669" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ fontSize: 12, fontWeight: '700', color: '#059669' }}
                >
                  Copy Letter
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, lineHeight: 20, color: '#334155', fontStyle: 'italic' }}
              >
                {complaint.formalLetter || complaint.description || 'No letter generated.'}
              </Text>
            </View>

            {/* Regional Translated Version */}
            {complaint.translatedLetter ? (
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Globe size={14} color="#059669" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}
                  >
                    Regional Translation ({complaint.translatedLanguage?.toUpperCase() || 'REGIONAL'})
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#ECFDF5',
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: '#A7F3D0',
                  }}
                >
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, lineHeight: 20, color: '#065F46' }}
                  >
                    {complaint.translatedLetter}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Lightbox Modal */}
      <Modal
        visible={lightboxVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setLightboxVisible(false)}
            activeOpacity={0.7}
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 }}
          >
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {lightboxUrl && (
            <Image
              source={{ uri: lightboxUrl }}
              style={{ width: '90%', height: '70%', resizeMode: 'contain' }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default DetailsScreen;
