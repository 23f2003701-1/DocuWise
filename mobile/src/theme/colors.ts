export const colors = {
  // Primary palette
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#93C5FD',
  primaryBg: '#EFF6FF',

  // Secondary
  secondary: '#7C3AED',
  secondaryLight: '#C4B5FD',

  // Status colors
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Expiry status
  expiryValid: '#10B981',
  expiryExpiringSoon: '#F59E0B',
  expiryExpired: '#EF4444',
  expiryNoExpiry: '#6B7280',

  // Category colors
  categoryIdentity: '#3B82F6',
  categoryEducational: '#8B5CF6',
  categoryVehicle: '#EC4899',
  categoryInsurance: '#14B8A6',
  categoryFinancial: '#F59E0B',
  categoryProperty: '#EF4444',
  categoryMedical: '#10B981',
  categoryLegal: '#6366F1',
  categoryOther: '#6B7280',

  // Shadows
  shadow: '#000000',
};

export const getCategoryColor = (category: string): string => {
  const map: Record<string, string> = {
    Identity: colors.categoryIdentity,
    Educational: colors.categoryEducational,
    Vehicle: colors.categoryVehicle,
    Insurance: colors.categoryInsurance,
    Financial: colors.categoryFinancial,
    Property: colors.categoryProperty,
    Medical: colors.categoryMedical,
    Legal: colors.categoryLegal,
    Other: colors.categoryOther,
  };
  return map[category] || colors.categoryOther;
};

export const getExpiryColor = (status: string): string => {
  const map: Record<string, string> = {
    Valid: colors.expiryValid,
    'Expiring Soon': colors.expiryExpiringSoon,
    Expired: colors.expiryExpired,
    'No Expiry': colors.expiryNoExpiry,
  };
  return map[status] || colors.expiryNoExpiry;
};

export const getExpiryBgColor = (status: string): string => {
  const map: Record<string, string> = {
    Valid: colors.successBg,
    'Expiring Soon': colors.warningBg,
    Expired: colors.dangerBg,
    'No Expiry': '#F3F4F6',
  };
  return map[status] || '#F3F4F6';
};
