import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, getCategoryColor } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentItem } from '../../types';
import { getRelativeTime, truncateText } from '../../utils/helpers';

interface RecentDocumentsProps {
  documents: DocumentItem[];
  onDocumentPress: (id: string) => void;
  onViewAll?: () => void;
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({
  documents,
  onDocumentPress,
  onViewAll,
}) => {
  if (documents.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Documents</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {documents.map((doc) => {
          const color = getCategoryColor(doc.category);
          const fileIcon = doc.fileType === 'pdf' ? 'file-pdf-box' : 'file-image';
          return (
            <TouchableOpacity
              key={doc._id}
              style={styles.card}
              onPress={() => onDocumentPress(doc._id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={fileIcon as any} size={28} color={color} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {truncateText(doc.title, 24)}
              </Text>
              <Text style={styles.cardCategory}>{doc.category}</Text>
              <Text style={styles.cardTime}>{getRelativeTime(doc.createdAt)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  viewAll: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  scroll: { paddingRight: spacing.lg },
  card: {
    width: 130,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  cardCategory: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  cardTime: { fontSize: 10, color: colors.textTertiary },
});

export default RecentDocuments;
