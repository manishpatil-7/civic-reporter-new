export const COLORS = {
  // Primary brand — Emerald green
  primary: '#10B981',
  primaryDark: '#059669',
  primaryDeep: '#047857',
  primaryLight: '#D1FAE5',
  primarySoft: '#ECFDF5',

  // Backgrounds
  bgPrimary: '#ECFDF5',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#F8FAFC',
  bgCard: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textInverted: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderHover: '#D1D5DB',

  // Status Colors
  status: {
    pending: '#D97706',
    pendingBg: '#FFFBEB',
    pendingBorder: '#FCD34D',

    inProgress: '#2563EB',
    inProgressBg: '#EFF6FF',
    inProgressBorder: '#93C5FD',

    resolved: '#059669',
    resolvedBg: '#ECFDF5',
    resolvedBorder: '#6EE7B7',

    critical: '#DC2626',
    criticalBg: '#FEF2F2',
    criticalBorder: '#FCA5A5',
  },

  // Severity Colors
  severity: {
    High: {
      text: '#DC2626',
      bg: '#FEF2F2',
      border: '#FCA5A5',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
    },
    Medium: {
      text: '#D97706',
      bg: '#FFFBEB',
      border: '#FCD34D',
      badgeBg: 'rgba(245, 158, 11, 0.1)',
    },
    Low: {
      text: '#059669',
      bg: '#ECFDF5',
      border: '#6EE7B7',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
    },
  },
};

export default COLORS;
