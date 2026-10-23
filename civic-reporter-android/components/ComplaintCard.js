import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Clock, ThumbsUp, ArrowRight } from 'lucide-react-native';
import StatusTracker from './StatusTracker';
import Badge from './Badge';

const severityConfig = {
  High: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  Medium: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  Low: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
};

const statusConfig = {
  'Pending': { iconText: '⏳', color: 'amber' },
  'In Progress': { iconText: '🚀', color: 'blue' },
  'Resolved': { iconText: '✅', color: 'emerald' },
};

const ComplaintCard = ({ complaint }) => {
  const navigation = useNavigation();

  const compId = complaint.id || complaint._id;
  const displayAddress =
    complaint.locationAddress ||
    complaint.location?.address ||
    (complaint.area ? `${complaint.area}, ${complaint.city}` : 'Specified Location');

  const activeStatus = statusConfig[complaint.status] || statusConfig['Pending'];
  const severityStyle = severityConfig[complaint.severity] || severityConfig.Medium;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Details', { id: compId })}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Image & Overlays */}
      <View style={{ height: 180, width: '100%', position: 'relative', backgroundColor: '#0F172A' }}>
        {complaint.imageUrl ? (
          <Image
            source={{ uri: complaint.imageUrl }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
            <Text maxFontSizeMultiplier={1.3} style={{ color: '#94A3B8', fontSize: 13 }}>No Image Available</Text>
          </View>
        )}

        {/* Top Badges */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Priority Pill */}
          <View
            style={{
              backgroundColor: severityStyle.bg,
              borderColor: severityStyle.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text
              maxFontSizeMultiplier={1.3}
              style={{ color: severityStyle.text, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}
            >
              {complaint.severity || 'Medium'} Priority
            </Text>
          </View>

          {/* Status Badge */}
          <Badge color={activeStatus.color}>
            {complaint.status || 'Pending'}
          </Badge>
        </View>

        {/* Bottom Gradient Strip */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
          }}
        >
          <Text
            maxFontSizeMultiplier={1.3}
            style={{
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: '800',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
            numberOfLines={1}
          >
            {complaint.problemType || 'Civic Issue'}
          </Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={{ padding: 16 }}>
        {/* Progress Tracker */}
        <View style={{ marginBottom: 14 }}>
          <StatusTracker status={complaint.status} compact />
        </View>

        {/* Meta Info Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <MapPin size={13} color="#059669" />
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 12, color: '#475569', flex: 1 }} numberOfLines={1}>
                {displayAddress}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color="#94A3B8" />
              <Text maxFontSizeMultiplier={1.3} style={{ fontSize: 11, color: '#94A3B8' }}>
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Recent'}
              </Text>
            </View>
          </View>

          {/* Upvotes Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ECFDF5',
              borderColor: '#A7F3D0',
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 5,
              gap: 4,
            }}
          >
            <ThumbsUp size={13} color="#059669" />
            <Text maxFontSizeMultiplier={1.3} style={{ color: '#065F46', fontWeight: '800', fontSize: 12 }}>
              {complaint.upvotes || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ComplaintCard;
