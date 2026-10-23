import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, ActivityIndicator, BackHandler } from 'react-native';
import { AlertTriangle, ThumbsUp, X, MapPin, ArrowRight } from 'lucide-react-native';
import { upvoteComplaint } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../constants/layout';
import Toast from 'react-native-toast-message';

const DuplicateModal = ({
  isOpen,
  onClose,
  similarComplaints = [],
  onSubmitAnyway,
  isSubmitting = false,
}) => {
  const { userData } = useAuth();
  const { isTablet } = useResponsive();
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [upvotingId, setUpvotingId] = useState(null);
  const [localComplaints, setLocalComplaints] = useState(similarComplaints);

  useEffect(() => {
    if (!isOpen) return;
    const onBackPress = () => {
      onClose();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpvote = async (complaintId) => {
    if (!userData?.uid) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please log in to upvote complaints',
      });
      return;
    }

    setUpvotingId(complaintId);
    try {
      const res = await upvoteComplaint(complaintId, userData.uid);
      const updated = res.data;

      setLocalComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId || c._id === complaintId
            ? { ...c, upvotes: updated.upvotes }
            : c
        )
      );

      setUpvotedIds((prev) => {
        const next = new Set(prev);
        if (next.has(complaintId)) next.delete(complaintId);
        else next.add(complaintId);
        return next;
      });

      Toast.show({
        type: 'success',
        text1: 'Support Registered 👍',
        text2: 'Thank you for upvoting this existing issue!',
      });
    } catch (err) {
      console.error('Upvote failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Vote Failed',
        text2: 'Could not register upvote. Try again.',
      });
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          justifyContent: isTablet ? 'center' : 'flex-end',
          alignItems: 'center',
          padding: isTablet ? 24 : 0,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderRadius: isTablet ? 28 : 0,
            width: '100%',
            maxWidth: isTablet ? 540 : '100%',
            maxHeight: '85%',
            padding: 24,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}
                >
                  Similar Issues Found
                </Text>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 12, color: '#64748B' }}
                >
                  {similarComplaints.length} potential duplicate(s) nearby
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text
            maxFontSizeMultiplier={1.3}
            style={{ fontSize: 13, color: '#475569', marginBottom: 16, lineHeight: 18 }}
          >
            Our AI detected complaints that match this problem. Upvoting an existing issue increases its priority and gets it resolved faster!
          </Text>

          {/* List of similar complaints */}
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {(localComplaints.length > 0 ? localComplaints : similarComplaints).map((item) => {
              const compId = item.id || item._id;
              const hasVoted = upvotedIds.has(compId);
              const isItemVoting = upvotingId === compId;

              return (
                <View
                  key={compId}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {item.imageUrl && (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 70, height: 70, borderRadius: 12, backgroundColor: '#CBD5E1' }}
                      />
                    )}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text
                        maxFontSizeMultiplier={1.3}
                        style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 }}
                      >
                        {item.problemType || 'Reported Issue'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <MapPin size={12} color="#64748B" />
                        <Text
                          maxFontSizeMultiplier={1.3}
                          style={{ fontSize: 11, color: '#64748B', flex: 1 }}
                          numberOfLines={1}
                        >
                          {item.locationAddress || item.area || 'Nearby location'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {item.similarity != null && (
                          <View
                            style={{
                              backgroundColor: '#FEF3C7',
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              maxFontSizeMultiplier={1.3}
                              style={{ fontSize: 10, fontWeight: '700', color: '#D97706' }}
                            >
                              {Math.round(item.similarity * 100)}% match
                            </Text>
                          </View>
                        )}
                        <Text
                          maxFontSizeMultiplier={1.3}
                          style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}
                        >
                          Status: {item.status || 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Upvote button */}
                  <TouchableOpacity
                    onPress={() => handleUpvote(compId)}
                    disabled={isItemVoting}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: hasVoted ? '#ECFDF5' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: hasVoted ? '#A7F3D0' : '#CBD5E1',
                      borderRadius: 10,
                      paddingVertical: 8,
                      marginTop: 10,
                      gap: 6,
                    }}
                  >
                    {isItemVoting ? (
                      <ActivityIndicator size="small" color="#059669" />
                    ) : (
                      <>
                        <ThumbsUp size={15} color={hasVoted ? '#059669' : '#475569'} />
                        <Text
                          maxFontSizeMultiplier={1.3}
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: hasVoted ? '#059669' : '#334155',
                          }}
                        >
                          {hasVoted ? 'Supported' : 'Support Issue'} ({item.upvotes || 0})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Action Footer */}
          <View style={{ marginTop: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={onSubmitAnyway}
              disabled={isSubmitting}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#059669',
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}
                  >
                    Submit as New Complaint
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{ paddingVertical: 8, alignItems: 'center' }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ color: '#64748B', fontWeight: '600', fontSize: 13 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DuplicateModal;
