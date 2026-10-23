import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import {
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Trash2,
  Camera,
  Check,
  X,
  UserCheck,
  UserX,
  FileText,
  ArrowLeft,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getComplaints,
  getUsers,
  updateComplaint,
  deleteComplaint,
  promoteUser,
  demoteUser,
  uploadImage,
} from '../../services/api';
import Badge from '../../components/Badge';
import CustomHeader from '../../components/CustomHeader';
import HorizontalChipSelector from '../../components/HorizontalChipSelector';
import { SkeletonStatCard, SkeletonCard } from '../../components/Skeleton';
import { useResponsive, TABLET_MAX_WIDTH } from '../../constants/layout';
import Toast from 'react-native-toast-message';

const AdminScreen = () => {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const { isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'complaints' | 'users'
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complaints filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Resolve modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionRemark, setResolutionRemark] = useState('');
  const [resolvePhoto, setResolvePhoto] = useState(null);
  const [resolving, setResolving] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [compRes, usersRes] = await Promise.all([
        getComplaints().catch(() => ({ data: [] })),
        getUsers().catch(() => ({ data: [] })),
      ]);
      setComplaints(compRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (!resolveModalOpen) return;
    const onBackPress = () => {
      setResolveModalOpen(false);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [resolveModalOpen]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Shield size={48} color="#DC2626" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>
          Administrator Access Required
        </Text>
        <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 }}>
          This portal is restricted to authorized civic administrators and officers.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{ backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Stats
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  // Chart data
  const statusPieData = [
    { value: pending || 1, color: '#F97316', text: `${pending}` },
    { value: inProgress || 1, color: '#3B82F6', text: `${inProgress}` },
    { value: resolved || 1, color: '#10B981', text: `${resolved}` },
  ];

  const severityBarData = [
    { value: complaints.filter((c) => c.severity === 'High').length, label: 'High', frontColor: '#EF4444' },
    { value: complaints.filter((c) => c.severity === 'Medium').length, label: 'Med', frontColor: '#F59E0B' },
    { value: complaints.filter((c) => c.severity === 'Low').length, label: 'Low', frontColor: '#10B981' },
  ];

  // Actions
  const handleUpdateStatus = async (complaintId, newStatus) => {
    if (newStatus === 'Resolved') {
      const comp = complaints.find((c) => (c.id || c._id) === complaintId);
      setSelectedComplaint(comp);
      setResolveModalOpen(true);
      return;
    }

    try {
      await updateComplaint(complaintId, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => ((c.id || c._id) === complaintId ? { ...c, status: newStatus } : c))
      );
      Toast.show({ type: 'success', text1: 'Status Updated', text2: `Set to ${newStatus}` });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: 'Could not update status' });
    }
  };

  const handlePickResolutionPhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!res.canceled && res.assets && res.assets[0]) {
      setResolvePhoto(res.assets[0]);
    }
  };

  const handleConfirmResolve = async () => {
    if (!selectedComplaint) return;
    setResolving(true);
    try {
      let afterImageUrl = null;
      if (resolvePhoto) {
        const uploadRes = await uploadImage(resolvePhoto);
        afterImageUrl = uploadRes.data?.url;
      }

      const compId = selectedComplaint.id || selectedComplaint._id;
      await updateComplaint(compId, {
        status: 'Resolved',
        afterImageUrl,
        adminRemarks: resolutionRemark,
      });

      setComplaints((prev) =>
        prev.map((c) =>
          (c.id || c._id) === compId
            ? { ...c, status: 'Resolved', afterImageUrl, adminRemarks: resolutionRemark }
            : c
        )
      );

      Toast.show({ type: 'success', text1: 'Issue Resolved! 🎉', text2: 'Evidence photo and remarks saved.' });
      setResolveModalOpen(false);
      setResolvePhoto(null);
      setResolutionRemark('');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to resolve complaint' });
    } finally {
      setResolving(false);
    }
  };

  const handleDeleteComplaint = (compId) => {
    Alert.alert('Delete Complaint', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComplaint(compId);
            setComplaints((prev) => prev.filter((c) => (c.id || c._id) !== compId));
            Toast.show({ type: 'success', text1: 'Deleted', text2: 'Complaint removed.' });
          } catch {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete.' });
          }
        },
      },
    ]);
  };

  const handlePromoteUser = async (userId) => {
    try {
      await promoteUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.uid === userId || u._id === userId ? { ...u, role: 'admin' } : u))
      );
      Toast.show({ type: 'success', text1: 'User Promoted', text2: 'Admin rights granted.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to promote user' });
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await demoteUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.uid === userId || u._id === userId ? { ...u, role: 'citizen' } : u))
      );
      Toast.show({ type: 'success', text1: 'User Demoted', text2: 'Set back to citizen role.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to demote user' });
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.problemType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c._id || c.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <CustomHeader title="Admin Portal" />

      {/* Admin Tab Switcher */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            maxWidth: TABLET_MAX_WIDTH,
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          {[
            { key: 'dashboard', label: 'Analytics' },
            { key: 'complaints', label: `Issues (${complaints.length})` },
            { key: 'users', label: `Users (${users.length})` },
          ].map((t) => {
            const isSelected = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: isSelected ? '#ECFDF5' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: isSelected ? '#A7F3D0' : '#E2E8F0',
                }}
              >
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: isSelected ? '#059669' : '#64748B',
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: TABLET_MAX_WIDTH, alignSelf: 'center' }}>
          {loading ? (
            <View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <View style={{ flex: isTablet ? 1 : 0, width: isTablet ? undefined : '48%' }}>
                  <SkeletonStatCard />
                </View>
                <View style={{ flex: isTablet ? 1 : 0, width: isTablet ? undefined : '48%' }}>
                  <SkeletonStatCard />
                </View>
                <View style={{ flex: isTablet ? 1 : 0, width: isTablet ? undefined : '48%' }}>
                  <SkeletonStatCard />
                </View>
                <View style={{ flex: isTablet ? 1 : 0, width: isTablet ? undefined : '48%' }}>
                  <SkeletonStatCard />
                </View>
              </View>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <>
              {/* TAB 1: ANALYTICS DASHBOARD */}
              {activeTab === 'dashboard' && (
                <View>
                  {/* Quick Stats Grid */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                    <View
                      style={{
                        flex: isTablet ? 1 : 0,
                        width: isTablet ? undefined : '48%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
                        TOTAL FILED
                      </Text>
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 2 }}>
                        {total}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: isTablet ? 1 : 0,
                        width: isTablet ? undefined : '48%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, fontWeight: '700', color: '#F97316' }}>
                        PENDING
                      </Text>
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 24, fontWeight: '900', color: '#F97316', marginTop: 2 }}>
                        {pending}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: isTablet ? 1 : 0,
                        width: isTablet ? undefined : '48%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6' }}>
                        IN PROGRESS
                      </Text>
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 24, fontWeight: '900', color: '#3B82F6', marginTop: 2 }}>
                        {inProgress}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: isTablet ? 1 : 0,
                        width: isTablet ? undefined : '48%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>
                        RESOLVED
                      </Text>
                      <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 24, fontWeight: '900', color: '#10B981', marginTop: 2 }}>
                        {resolved}
                      </Text>
                    </View>
                  </View>

                  {/* Severity Breakdown Bar Chart */}
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 20,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      marginBottom: 20,
                    }}
                  >
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 14 }}
                    >
                      Severity Distribution
                    </Text>
                    <BarChart
                      data={severityBarData}
                      barWidth={40}
                      noOfSections={4}
                      barBorderRadius={6}
                      frontColor="#10B981"
                      yAxisThickness={0}
                      xAxisThickness={1}
                      xAxisColor="#CBD5E1"
                    />
                  </View>
                </View>
              )}

              {/* TAB 2: COMPLAINTS MANAGEMENT */}
              {activeTab === 'complaints' && (
                <View>
                  {/* Search Input */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      paddingHorizontal: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Search size={18} color="#94A3B8" />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search issues by name or ID..."
                      placeholderTextColor="#94A3B8"
                      maxFontSizeMultiplier={1.3}
                      style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: '#0F172A' }}
                    />
                  </View>

                  {/* Status Pills */}
                  <View style={{ marginBottom: 16 }}>
                    <HorizontalChipSelector
                      items={['All', 'Pending', 'In Progress', 'Resolved']}
                      selected={statusFilter}
                      onSelect={(st) => setStatusFilter(st)}
                      activeColor="#059669"
                      fadeColor="#FFFFFF"
                      contentPaddingHorizontal={2}
                    />
                  </View>

                  {/* List - 2 columns on tablet */}
                  <View
                    style={{
                      flexDirection: isTablet ? 'row' : 'column',
                      flexWrap: isTablet ? 'wrap' : 'nowrap',
                      justifyContent: isTablet ? 'space-between' : 'flex-start',
                    }}
                  >
                    {filteredComplaints.map((item) => {
                      const compId = item.id || item._id;
                      return (
                        <View
                          key={compId}
                          style={{
                            width: isTablet ? '48.8%' : '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 18,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            marginBottom: 14,
                          }}
                        >
                          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                            {item.imageUrl && (
                              <Image
                                source={{ uri: item.imageUrl }}
                                style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#E2E8F0' }}
                              />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}
                              >
                                {item.problemType}
                              </Text>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}
                                numberOfLines={1}
                              >
                                {item.locationAddress || item.location?.address || 'Location'}
                              </Text>
                              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                                <Badge>{item.status}</Badge>
                                <Badge color={item.severity === 'High' ? 'red' : 'amber'}>
                                  {item.severity}
                                </Badge>
                              </View>
                            </View>
                          </View>

                          {/* Action Buttons Row */}
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              borderTopWidth: 1,
                              borderTopColor: '#F1F5F9',
                              paddingTop: 12,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => handleUpdateStatus(compId, 'In Progress')}
                              activeOpacity={0.7}
                              style={{
                                flex: 1,
                                backgroundColor: '#EFF6FF',
                                borderWidth: 1,
                                borderColor: '#BFDBFE',
                                borderRadius: 10,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={{ fontSize: 11, fontWeight: '700', color: '#2563EB' }}
                              >
                                In Progress
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleUpdateStatus(compId, 'Resolved')}
                              activeOpacity={0.7}
                              style={{
                                flex: 1,
                                backgroundColor: '#ECFDF5',
                                borderWidth: 1,
                                borderColor: '#A7F3D0',
                                borderRadius: 10,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}
                              >
                                Resolve ✨
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleDeleteComplaint(compId)}
                              activeOpacity={0.7}
                              style={{
                                backgroundColor: '#FEF2F2',
                                borderWidth: 1,
                                borderColor: '#FECACA',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* TAB 3: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <View
                  style={{
                    flexDirection: isTablet ? 'row' : 'column',
                    flexWrap: isTablet ? 'wrap' : 'nowrap',
                    justifyContent: isTablet ? 'space-between' : 'flex-start',
                  }}
                >
                  {users.map((u) => {
                    const uId = u.uid || u._id;
                    const isUserAdmin = u.role === 'admin';

                    return (
                      <View
                        key={uId}
                        style={{
                          width: isTablet ? '48.8%' : '100%',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 16,
                          padding: 14,
                          borderWidth: 1,
                          borderColor: '#E2E8F0',
                          marginBottom: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text
                            maxFontSizeMultiplier={1.3}
                            style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}
                          >
                            {u.name || 'Citizen'}
                          </Text>
                          <Text
                            maxFontSizeMultiplier={1.3}
                            style={{ fontSize: 12, color: '#64748B' }}
                          >
                            {u.email}
                          </Text>
                          <View style={{ marginTop: 4 }}>
                            <Badge color={isUserAdmin ? 'emerald' : 'gray'}>
                              {isUserAdmin ? 'Admin' : 'Citizen'}
                            </Badge>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => (isUserAdmin ? handleDemoteUser(uId) : handlePromoteUser(uId))}
                          activeOpacity={0.7}
                          style={{
                            backgroundColor: isUserAdmin ? '#FEF2F2' : '#ECFDF5',
                            borderWidth: 1,
                            borderColor: isUserAdmin ? '#FECACA' : '#A7F3D0',
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                          }}
                        >
                          <Text
                            maxFontSizeMultiplier={1.3}
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: isUserAdmin ? '#DC2626' : '#059669',
                            }}
                          >
                            {isUserAdmin ? 'Demote' : 'Promote Admin'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* RESOLUTION PHOTO MODAL */}
      <Modal visible={resolveModalOpen} transparent animationType="slide" onRequestClose={() => setResolveModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: isTablet ? 'center' : 'flex-end',
            alignItems: 'center',
            padding: isTablet ? 24 : 0,
          }}
        >
          <KeyboardAwareScrollView
            bottomOffset={24}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            bounces={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: isTablet ? 'center' : 'flex-end',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderRadius: isTablet ? 24 : 0,
                width: '100%',
                maxWidth: isTablet ? 540 : '100%',
                padding: 24,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}
                >
                  Resolve Complaint
                </Text>
                <TouchableOpacity onPress={() => setResolveModalOpen(false)} activeOpacity={0.7}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}
              >
                Take a resolution evidence photo to prove the civic issue has been fixed on the ground.
              </Text>

              {/* Photo capture button */}
              <TouchableOpacity
                onPress={handlePickResolutionPhoto}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderWidth: 1.5,
                  borderColor: '#CBD5E1',
                  borderStyle: 'dashed',
                  borderRadius: 14,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                {resolvePhoto ? (
                  <Image source={{ uri: resolvePhoto.uri }} style={{ width: '100%', height: 140, borderRadius: 10 }} />
                ) : (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Camera size={24} color="#059669" />
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}
                    >
                      Snap Resolution Proof Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                value={resolutionRemark}
                onChangeText={setResolutionRemark}
                placeholder="Officer resolution remarks (e.g. Pothole filled and sealed)..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                maxFontSizeMultiplier={1.3}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 13,
                  marginBottom: 20,
                  textAlignVertical: 'top',
                }}
              />

              <TouchableOpacity
                onPress={handleConfirmResolve}
                disabled={resolving}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#059669',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {resolving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                  >
                    Confirm Resolution
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default AdminScreen;
