import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react-native';

const steps = [
  { key: 'Pending', label: 'Submitted', icon: AlertTriangle, color: '#F97316' },
  { key: 'In Progress', label: 'In Progress', icon: Clock, color: '#3B82F6' },
  { key: 'Resolved', label: 'Resolved', icon: CheckCircle2, color: '#10B981' },
];

const statusIndex = { 'Pending': 0, 'In Progress': 1, 'Resolved': 2 };

const StatusTracker = ({ status = 'Pending', compact = false }) => {
  const currentIdx = statusIndex[status] ?? 0;

  if (compact) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx;
          return (
            <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: isActive ? step.color : '#E2E8F0',
                }}
              />
              {idx < steps.length - 1 && (
                <View
                  style={{
                    width: 14,
                    height: 2,
                    backgroundColor: idx < currentIdx ? steps[idx + 1].color : '#E2E8F0',
                    marginHorizontal: 2,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center', flex: idx === steps.length - 1 ? 0 : 1 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isCurrent ? `${step.color}20` : isActive ? `${step.color}10` : '#F1F5F9',
                  borderWidth: isCurrent ? 2 : 1,
                  borderColor: isCurrent ? step.color : isActive ? `${step.color}60` : '#CBD5E1',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} color={isActive ? step.color : '#94A3B8'} />
              </View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? step.color : isActive ? '#334155' : '#94A3B8',
                }}
              >
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: idx < currentIdx ? '#10B981' : '#E2E8F0',
                  marginHorizontal: 6,
                  marginBottom: 16,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default StatusTracker;
