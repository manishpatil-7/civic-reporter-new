import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { updateComplaintStatus } from '../../services/authorityApi';
import api from '../../services/api';
import { SkeletonDetail } from '../../components/Skeleton';
import Toast from 'react-native-toast-message';
import { TABLET_MAX_WIDTH } from '../../constants/layout';

const STATUS_OPTIONS = [
  { key: 'Pending', color: '#D97706', bgUnselected: '#FFFBEB' },
  { key: 'In Progress', color: '#2563EB', bgUnselected: '#EFF6FF' },
  { key: 'Resolved', color: '#059669', bgUnselected: '#ECFDF5' },
];

const AuthorityComplaintDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data);
        setStatus(res.data.status || 'Pending');
      } catch (err) {
        console.error('Error fetching complaint for authority:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateComplaintStatus(id, status);
      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Complaint marked as ${status}`,
      });
      navigation.navigate('AuthorityDashboard');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err.response?.data?.message || 'Could not update status',
      });
    } finally {
      setUpdating(false);
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
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center', width: '100%' }}>
          <SkeletonDetail />
        </ScrollView>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignItems: 'center' }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 16, color: '#64748B', marginBottom: 12 }}>
            Complaint not found.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={{ backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
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
            gap: 12,
            maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text
            maxFontSizeMultiplier={1.3}
            style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}
          >
            Officer Status Review
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center' }}>
          {/* Photo Evidence */}
          {complaint.imageUrl && (
            <View
              style={{
                height: 220,
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Image source={{ uri: complaint.imageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            </View>
          )}

          {/* Title & Info */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 }}
            >
              {complaint.problemType}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 }}>
              <MapPin size={14} color="#059669" />
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 12, color: '#64748B' }}
              >
                {complaint.location?.address || complaint.locationAddress || 'Specified Location'}
              </Text>
            </View>

            {/* Status Options */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 }}
            >
              Update Municipal Status:
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setStatus(opt.key)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: isSelected ? opt.color : opt.bgUnselected,
                      borderWidth: 1.5,
                      borderColor: opt.color,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{ fontSize: 12, fontWeight: '800', color: isSelected ? '#FFFFFF' : opt.color }}
                    >
                      {opt.key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={updating || status === complaint.status}
              activeOpacity={0.7}
              style={{
                backgroundColor: status === complaint.status ? '#94A3B8' : '#059669',
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                >
                  Save Updated Status
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Description & Letter */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 }}
            >
              Citizen Description
            </Text>
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 16 }}
            >
              {complaint.description || 'No additional remarks.'}
            </Text>

            {complaint.formalLetter ? (
              <>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 }}
                >
                  Formal Complaint Notice
                </Text>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 12, color: '#334155', fontStyle: 'italic', lineHeight: 18, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}
                >
                  {complaint.formalLetter}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AuthorityComplaintDetailScreen;
