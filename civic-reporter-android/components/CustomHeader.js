import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Leaf, Bell, User, LogIn, X, Shield } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TABLET_MAX_WIDTH } from '../constants/layout';
import { SkeletonList } from './Skeleton';

const CustomHeader = ({ title }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();

  // Responsive flags
  const isNarrowScreen = windowWidth < 360;
  const isTablet = windowWidth >= 600;

  const { user, isAdmin, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifs();
    }
  }, [user]);

  // Back button handler for notification modal
  useEffect(() => {
    if (!showNotifications) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowNotifications(false);
      return true;
    });
    return () => backHandler.remove();
  }, [showNotifications]);

  const fetchNotifs = async () => {
    setLoadingNotifs(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      // Non-blocking
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  return (
    <>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
          paddingHorizontal: 16,
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: 12,
          width: '100%',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
            alignSelf: 'center',
          }}
        >
          {/* Left: Brand or Screen Title */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#059669',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Leaf size={20} color="#FFFFFF" />
            </View>
            <View style={{ flexShrink: 1, maxWidth: isNarrowScreen ? 130 : 210 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 }}
              >
                Civic Reporter
              </Text>
              {title && (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}
                >
                  {title}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Right Actions */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: isNarrowScreen ? 6 : 10,
              flexShrink: 0,
            }}
          >
            {user ? (
              <>
                {/* Notification Icon */}
                <TouchableOpacity
                  onPress={() => {
                    fetchNotifs();
                    setShowNotifications(true);
                  }}
                  activeOpacity={0.7}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Bell size={18} color="#475569" />
                  {unreadCount > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        backgroundColor: '#EF4444',
                      }}
                    />
                  )}
                </TouchableOpacity>

                {/* Admin Shield Badge if Admin — collapses to icon below 360dp */}
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Admin')}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: '#EDE9FE',
                      paddingHorizontal: isNarrowScreen ? 7 : 9,
                      paddingVertical: 5,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Shield size={14} color="#7C3AED" />
                    {!isNarrowScreen && (
                      <Text
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                        style={{ fontSize: 11, fontWeight: '700', color: '#7C3AED' }}
                      >
                        Admin
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                {/* User Avatar / Logout */}
                <TouchableOpacity
                  onPress={handleLogout}
                  activeOpacity={0.7}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#ECFDF5',
                    borderWidth: 1,
                    borderColor: '#A7F3D0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={18} color="#059669" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#059669',
                  paddingHorizontal: isNarrowScreen ? 10 : 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  gap: 6,
                }}
              >
                <LogIn size={15} color="#FFFFFF" />
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 20,
              maxHeight: '70%',
              width: '100%',
              maxWidth: 520,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}
              >
                Notifications
              </Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                activeOpacity={0.7}
                style={{ padding: 4 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {loadingNotifs ? (
                <SkeletonList count={3} itemHeight={60} />
              ) : notifications.length === 0 ? (
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ textAlign: 'center', color: '#94A3B8', paddingVertical: 20 }}
                >
                  No notifications yet
                </Text>
              ) : (
                notifications.map((n) => (
                  <TouchableOpacity
                    key={n.id || n._id}
                    onPress={() => handleRead(n.id || n._id)}
                    activeOpacity={0.7}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: n.read ? '#F8FAFC' : '#ECFDF5',
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: n.read ? '#E2E8F0' : '#A7F3D0',
                    }}
                  >
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{
                        fontSize: 13,
                        fontWeight: n.read ? '500' : '700',
                        color: '#0F172A',
                      }}
                    >
                      {n.message || n.title}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}
                    >
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CustomHeader;
