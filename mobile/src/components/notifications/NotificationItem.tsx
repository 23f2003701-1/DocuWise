import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { Reminder } from '../../types';
import { getRelativeTime } from '../../utils/helpers';

interface NotificationItemProps {
  reminder: Reminder;
  onPress?: () => void;
}

const reminderConfig: Record<string, { icon: string; color: string; label: string }> = {
  '30_day': { icon: 'calendar-clock', color: colors.info, label: '30-day reminder' },
  '7_day': { icon: 'calendar-alert', color: colors.warning, label: '7-day reminder' },
  '1_day': { icon: 'alert-circle', color: colors.danger, label: 'Expires tomorrow' },
};

const NotificationItem: React.FC<NotificationItemProps> = ({ reminder, onPress }) => {
  const config = reminderConfig[reminder.reminderType] || reminderConfig['30_day'];
  const docTitle =
    typeof reminder.documentId === 'object' && reminder.documentId !== null
      ? (reminder.documentId as any).title
      : null;

  return (
    <TouchableOpacity
      style={[styles.container, !reminder.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: `${config.color}15` }]}>
        <MaterialCommunityIcons name={config.icon as any} size={22} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>{config.label}</Text>
          {!reminder.isRead && <View style={styles.dot} />}
        </View>
        {docTitle && <Text style={styles.docTitle} numberOfLines={1}>{docTitle}</Text>}
        <Text style={styles.message} numberOfLines={2}>{reminder.message}</Text>
        <Text style={styles.time}>{getRelativeTime(reminder.sentAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  unread: { backgroundColor: colors.primaryBg },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  docTitle: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginTop: 2 },
  message: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: colors.textTertiary, marginTop: spacing.xs },
});

export default NotificationItem;
