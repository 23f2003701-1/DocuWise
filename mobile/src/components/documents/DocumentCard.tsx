import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../common/Card';
import DocumentStatusBadge from './DocumentStatusBadge';
import { colors, getCategoryColor } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentItem } from '../../types';
import { formatFileSize, getRelativeTime, truncateText } from '../../utils/helpers';

interface DocumentCardProps {
  document: DocumentItem;
  onPress: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPress }) => {
  const categoryColor = getCategoryColor(document.category);
  const fileIcon = document.fileType === 'pdf' ? 'file-pdf-box' : 'file-image';
  const fileIconColor = document.fileType === 'pdf' ? '#EF4444' : '#3B82F6';

  return (
    <Card onPress={onPress} style={styles.card} padding={spacing.md}>
      <View style={styles.row}>
        <View style={[styles.fileIcon, { backgroundColor: `${fileIconColor}15` }]}>
          <MaterialCommunityIcons name={fileIcon as any} size={28} color={fileIconColor} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {truncateText(document.title, 40)}
          </Text>
          {document.holderName && (
            <Text style={styles.holder} numberOfLines={1}>
              {document.holderName}
            </Text>
          )}
          <View style={styles.meta}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
              <Text style={[styles.category, { color: categoryColor }]}>{document.category}</Text>
            </View>
            <Text style={styles.size}>{formatFileSize(document.fileSize)}</Text>
          </View>
        </View>
        {document.isAIProcessed && (
          <MaterialCommunityIcons name="robot" size={16} color={colors.primary} style={styles.aiIcon} />
        )}
      </View>
      <View style={styles.footer}>
        <DocumentStatusBadge status={document.expiryStatus} expiryDate={document.expiryDate} compact />
        <Text style={styles.time}>{getRelativeTime(document.createdAt)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  holder: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  category: { fontSize: 11, fontWeight: '600' },
  size: { fontSize: 11, color: colors.textTertiary },
  aiIcon: { marginLeft: spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  time: { fontSize: 11, color: colors.textTertiary },
});

export default DocumentCard;
