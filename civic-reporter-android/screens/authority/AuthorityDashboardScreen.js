import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Building2, LogOut, ArrowRight, MapPin, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { getAuthorityStats, getAuthorityComplaints } from '../../services/authorityApi';
import Badge from '../../components/Badge';
import HorizontalChipSelector from '../../components/HorizontalChipSelector';
import { SkeletonStatCard, SkeletonCard } from '../../components/Skeleton';
import { TABLET_MAX_WIDTH } from '../../constants/layout';

const AuthorityDashboardScreen = () => {
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('');
  const [authFilter, setAuthFilter] = useState('');

  const fetchDashboard = async () => {
    setError(false);
    try {
      const statsRes = await getAuthorityStats();
      setStats(statsRes.data);
      const compRes = await getAuthorityComplaints(filter, authFilter);
      setComplaints(compRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('authorityToken');
        navigation.navigate('AuthorityLogin');
        return;
      }
      console.error('Error fetching authority dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filter, authFilter]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authorityToken');
    await AsyncStorage.removeItem('authorityUser');
    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Officer Header */}
      <View
        style={{
          backgroundColor: '#1E3A8A',
          paddingTop: 48,
          paddingBottom: 20,
          paddingHorizontal: 20,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}
              >
                Authority Portal
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 11, color: '#BFDBFE' }}
              >
                Municipal Resolution Dashboard
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <LogOut size={14} color="#FCA5A5" />
            <Text
              maxFontSizeMultiplier={1.2}
              style={{ color: '#FCA5A5', fontSize: 12, fontWeight: '700' }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center' }}>
          {/* Stats Row */}
          {loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
              <SkeletonStatCard style={{ minWidth: isTablet ? '23%' : '47%' }} />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Total', value: stats.total, color: '#059669' },
                { label: 'Open', value: stats.open, color: '#D97706' },
                { label: 'In Progress', value: stats.inProgress, color: '#2563EB' },
                { label: 'Resolved', value: stats.resolved, color: '#10B981' },
              ].map((s) => (
                <View
                  key={s.label}
                  style={{
                    flex: 1,
                    minWidth: isTablet ? '23%' : '47%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}
                  >
                    {s.label}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 24, fontWeight: '900', color: s.color, marginTop: 4 }}
                  >
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Status Filter Pills (uses brand emerald #059669) */}
          <View style={{ marginBottom: 16 }}>
            <HorizontalChipSelector
              items={['', 'OPEN', 'IN_PROGRESS', 'RESOLVED']}
              selected={filter}
              onSelect={(st) => setFilter(st)}
              getLabel={(st) => (st === '' ? 'All Status' : st.replace('_', ' '))}
              activeColor="#059669"
              fadeColor="#F8FAFC"
              contentPaddingHorizontal={2}
            />
          </View>

          {/* Complaints Feed */}
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
                Failed to load assigned complaints
              </Text>
              <TouchableOpacity
                onPress={fetchDashboard}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#059669',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  marginTop: 8,
                }}
              >
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : complaints.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ color: '#94A3B8', fontSize: 14 }}
              >
                No complaints assigned.
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
              {complaints.map((c) => (
                <View
                  key={c._id}
                  style={{
                    width: isTablet ? '48.5%' : '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    overflow: 'hidden',
                    marginBottom: 14,
                  }}
                >
                  {c.imageUrl && (
                    <Image source={{ uri: c.imageUrl }} style={{ width: '100%', height: 160 }} />
                  )}
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text
                        maxFontSizeMultiplier={1.3}
                        style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1, marginRight: 8 }}
                      >
                        {c.problemType}
                      </Text>
                      <Badge color={c.status === 'Resolved' ? 'emerald' : c.status === 'In Progress' ? 'blue' : 'amber'}>
                        {c.status}
                      </Badge>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                      <MapPin size={13} color="#64748B" />
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{ fontSize: 12, color: '#64748B', flex: 1 }}
                        numberOfLines={1}
                      >
                        {c.location?.address || `${c.area || ''}, ${c.city || ''}`}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('AuthorityComplaintDetail', { id: c._id })}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: '#1E3A8A',
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                      }}
                    >
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}
                      >
                        View & Update Status
                      </Text>
                      <ArrowRight size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AuthorityDashboardScreen;
