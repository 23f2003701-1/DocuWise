import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, getExpiryColor, getExpiryBgColor } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { ExpiryStatus } from '../../types';
import { getExpiryStatusText } from '../../utils/helpers';

interface DocumentStatusBadgeProps {
  status: ExpiryStatus;
  expiryDate?: string;
  compact?: boolean;
}

const statusIcons: Record<ExpiryStatus, string> = {
  Valid: 'check-circle',
  'Expiring Soon': 'alert-circle',
  Expired: 'close-circle',
  'No Expiry': 'minus-circle',
};

const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  expiryDate,
  compact = false,
}) => {
  const bgColor = getExpiryBgColor(status);
  const textColor = getExpiryColor(status);
  const icon = statusIcons[status];
  const label = compact ? status : getExpiryStatusText(status, expiryDate);

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <MaterialCommunityIcons name={icon as any} size={12} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 3,
  },
  text: { fontSize: 11, fontWeight: '600' },
});

export default DocumentStatusBadge;
