import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react-native';
import { getComplaints } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import EmptyState from '../components/EmptyState';
import CustomHeader from '../components/CustomHeader';
import HorizontalChipSelector from '../components/HorizontalChipSelector';
import { SkeletonStatCard, SkeletonCard, SkeletonBox } from '../components/Skeleton';
import { TABLET_MAX_WIDTH } from '../constants/layout';
import LeafletMap from '../components/LeafletMap';

const defaultRegion = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 12.0,
  longitudeDelta: 12.0,
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All' | 'High' | 'Medium' | 'Low' | 'Resolved'
  const [mapRegion, setMapRegion] = useState(defaultRegion);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  const fetchAllComplaints = async () => {
    try {
      setError(false);
      const res = await getComplaints();
      const data = res.data || [];
      setComplaints(data);

      // Focus map on first complaint with valid location if available
      const firstValid = data.find(
        (c) => c.location && c.location.lat && c.location.lng
      );
      if (firstValid) {
        setMapRegion({
          latitude: firstValid.location.lat,
          longitude: firstValid.location.lng,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard complaints:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setMapRegion((prev) => {
            if (prev.latitude === defaultRegion.latitude && prev.longitude === defaultRegion.longitude) {
              return {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              };
            }
            return prev;
          });
        }
      } catch (e) {
        // GPS permission or detection silent fallback
      }
    })();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllComplaints();
  }, []);

  // Stats calculation
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;

  // Filtered complaints
  const filtered = complaints.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'Resolved') return c.status === 'Resolved';
    return c.severity === filter;
  });

  const getMarkerColor = (complaint) => {
    if (complaint.status === 'Resolved') return '#10B981';
    if (complaint.severity === 'High') return '#EF4444';
    if (complaint.severity === 'Medium') return '#F59E0B';
    return '#10B981';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <CustomHeader title="City Dashboard" />

      <ScrollView
        scrollEnabled={!isMapInteracting}
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
          {/* STATS OVERVIEW */}
          {loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {/* Total */}
              <View
                style={{
                  flex: 1,
                  minWidth: isTablet ? '23%' : '47%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Activity size={16} color="#059669" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}
                  >
                    Total Filed
                  </Text>
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 26, fontWeight: '900', color: '#0F172A' }}
                >
                  {totalCount}
                </Text>
              </View>

              {/* Resolved */}
              <View
                style={{
                  flex: 1,
                  minWidth: isTablet ? '23%' : '47%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}
                  >
                    Resolved
                  </Text>
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 26, fontWeight: '900', color: '#10B981' }}
                >
                  {resolvedCount}
                </Text>
              </View>

              {/* In Progress */}
              <View
                style={{
                  flex: 1,
                  minWidth: isTablet ? '23%' : '47%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Clock size={16} color="#3B82F6" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}
                  >
                    In Progress
                  </Text>
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 26, fontWeight: '900', color: '#3B82F6' }}
                >
                  {inProgressCount}
                </Text>
              </View>

              {/* Pending */}
              <View
                style={{
                  flex: 1,
                  minWidth: isTablet ? '23%' : '47%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <AlertTriangle size={16} color="#F97316" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}
                  >
                    Pending
                  </Text>
                </View>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 26, fontWeight: '900', color: '#F97316' }}
                >
                  {pendingCount}
                </Text>
              </View>
            </View>
          )}

          {/* INTERACTIVE OPENSTREETMAP DASHBOARD MAP */}
          {loading ? (
            <SkeletonBox width="100%" height={260} borderRadius={20} style={{ marginBottom: 20 }} />
          ) : (
            <View
              onTouchStart={() => setIsMapInteracting(true)}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                height: 260,
                marginBottom: 20,
              }}
            >
              <LeafletMap
                latitude={mapRegion.latitude}
                longitude={mapRegion.longitude}
                zoom={11}
                height={260}
                borderRadius={20}
                onInteractionChange={setIsMapInteracting}
                markers={complaints
                  .map((c) => {
                    const lat = c.location?.lat || (Array.isArray(c.location) ? c.location[0] : null);
                    const lng = c.location?.lng || (Array.isArray(c.location) ? c.location[1] : null);
                    if (!lat || !lng) return null;
                    return {
                      id: c.id || c._id,
                      latitude: Number(lat),
                      longitude: Number(lng),
                      title: c.problemType,
                      description: `${c.severity} Priority • ${c.status}`,
                      severity: c.severity,
                    };
                  })
                  .filter(Boolean)}
              />
            </View>
          )}

          {/* FILTERS STRIP */}
          <View style={{ marginBottom: 16 }}>
            <HorizontalChipSelector
              items={['All', 'High', 'Medium', 'Low', 'Resolved']}
              selected={filter}
              onSelect={(pill) => setFilter(pill)}
              getLabel={(pill) => (pill === 'All' ? 'All Issues' : pill)}
              activeColor="#059669"
              fadeColor="#F8FAFC"
              contentPaddingHorizontal={2}
            />
          </View>

          {/* COMPLAINTS FEED */}
          {loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
              <View style={{ width: isTablet ? '48.5%' : '100%' }}>
                <SkeletonCard />
              </View>
              <View style={{ width: isTablet ? '48.5%' : '100%' }}>
                <SkeletonCard />
              </View>
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
                Failed to load dashboard complaints
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 }}
              >
                Please check your network connection and try again.
              </Text>
              <TouchableOpacity
                onPress={fetchAllComplaints}
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
          ) : filtered.length === 0 ? (
            <EmptyState
              heading="No Complaints Found"
              message={`No issues matching the "${filter}" filter.`}
              ctaText="Reset Filter"
              onPress={() => setFilter('All')}
            />
          ) : (
            <View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}
              >
                Recent Public Issues ({filtered.length})
              </Text>

              {/* Two column layout on tablets */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
                {filtered.map((item) => (
                  <View key={item.id || item._id} style={{ width: isTablet ? '48.5%' : '100%' }}>
                    <ComplaintCard complaint={item} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
