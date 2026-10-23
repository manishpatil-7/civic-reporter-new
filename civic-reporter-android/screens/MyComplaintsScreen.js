import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  FileText,
  Search,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getComplaintsByUser } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import EmptyState from '../components/EmptyState';
import CustomHeader from '../components/CustomHeader';
import { SkeletonCard, SkeletonStatCard } from '../components/Skeleton';
import { TABLET_MAX_WIDTH } from '../constants/layout';

const MyComplaintsScreen = () => {
  const navigation = useNavigation();
  const { user, userData } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyComplaints = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(false);
    try {
      const res = await getComplaintsByUser(user.uid);
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Error fetching user complaints:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyComplaints();
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <CustomHeader title="My Reports" />
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignItems: 'center' }}>
            <FileText size={48} color="#059669" style={{ marginBottom: 16 }} />
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' }}
            >
              Sign In to View Your Reports
            </Text>
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 }}
            >
              Track the live progress of all civic issues you have reported.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#059669',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 14,
              }}
            >
              <Text
                maxFontSizeMultiplier={1.2}
                style={{ color: '#FFFFFF', fontWeight: '700' }}
              >
                Sign In Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Filtered by ID
  const filtered = complaints.filter((c) =>
    (c.id || c._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <CustomHeader title="My Reports" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center' }}>
          {/* Welcome Banner */}
          <View style={{ marginBottom: 16 }}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 22, fontWeight: '900', color: '#0F172A' }}
            >
              My Civic Reports
            </Text>
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}
            >
              Track the status of issues you've reported, {userData?.name || 'Citizen'}.
            </Text>
          </View>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              paddingHorizontal: 12,
              marginBottom: 16,
            }}
          >
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by Complaint ID..."
              placeholderTextColor="#94A3B8"
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: '#0F172A' }}
            />
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 18, fontWeight: '900', color: '#059669' }}>{complaints.length}</Text>
              <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>Total</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 18, fontWeight: '900', color: '#F97316' }}>{pendingCount}</Text>
              <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>Pending</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 18, fontWeight: '900', color: '#3B82F6' }}>{inProgressCount}</Text>
              <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>In Prog</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 18, fontWeight: '900', color: '#10B981' }}>{resolvedCount}</Text>
              <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>Resolved</Text>
            </View>
          </View>

          {/* Content Feed with Skeleton & Error Handling */}
          {loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
              <View style={{ width: isTablet ? '48.5%' : '100%' }}>
                <SkeletonCard />
              </View>
              <View style={{ width: isTablet ? '48.5%' : '100%' }}>
                <SkeletonCard />
              </View>
            </View>
          ) : error ? (
            <View
              style={{
                padding: 32,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#FECACA',
                marginVertical: 16,
              }}
            >
              <AlertTriangle size={36} color="#DC2626" style={{ marginBottom: 12 }} />
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 16, fontWeight: '800', color: '#991B1B', textAlign: 'center', marginBottom: 6 }}
              >
                Failed to load your complaints
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 }}
              >
                Please check your connection and try again.
              </Text>
              <TouchableOpacity
                onPress={fetchMyComplaints}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#059669',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : complaints.length === 0 ? (
            <EmptyState
              heading="No complaints yet"
              message="You haven't reported any civic issues yet. File your first complaint today!"
              ctaText="Report Issue Now"
              onPress={() => navigation.navigate('Submit')}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              heading="No matching reports"
              message={`No complaint found with ID matching "${searchTerm}".`}
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
              {filtered.map((item) => (
                <View key={item.id || item._id} style={{ width: isTablet ? '48.5%' : '100%' }}>
                  <ComplaintCard complaint={item} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyComplaintsScreen;
