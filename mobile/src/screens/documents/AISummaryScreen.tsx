import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, getCategoryColor } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type RouteProps = RouteProp<DocumentStackParamList, 'AISummary'>;
type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const SectionCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({
  title, icon, children,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const AISummaryScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { analysis } = route.params;

  const categoryColor = getCategoryColor(analysis.category);
  const confidencePct = Math.round((analysis.confidence || 0) * 100);

  const extractedEntries = Object.entries(analysis.extractedFields || {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Doc type header */}
      <View style={styles.headerCard}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}18` }]}>
          <MaterialCommunityIcons name="robot" size={36} color={colors.primary} />
        </View>
        <Text style={styles.docType}>{analysis.documentType}</Text>
        <View style={[styles.catBadge, { backgroundColor: `${categoryColor}18` }]}>
          <Text style={[styles.catText, { color: categoryColor }]}>{analysis.category}</Text>
        </View>

        {/* Confidence bar */}
        <View style={styles.confidenceWrap}>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <Text style={styles.confidencePct}>{confidencePct}%</Text>
          </View>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                {
                  width: `${confidencePct}%`,
                  backgroundColor: confidencePct >= 80 ? colors.success
                    : confidencePct >= 50 ? colors.warning : colors.danger,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Summary */}
      {analysis.summary ? (
        <SectionCard title="AI Summary" icon="text-box-outline">
          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </SectionCard>
      ) : null}

      {/* Important details */}
      {analysis.importantDetails && analysis.importantDetails.length > 0 && (
        <SectionCard title="Key Highlights" icon="star-outline">
          {analysis.importantDetails.map((detail, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>{detail}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Extracted fields */}
      {extractedEntries.length > 0 && (
        <SectionCard title="Extracted Information" icon="magnify">
          {extractedEntries.map(([key, value]) => (
            <View key={key} style={styles.fieldRow}>
              <Text style={styles.fieldKey}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              </Text>
              <Text style={styles.fieldValue}>{String(value)}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Dates */}
      {(analysis.issueDate || analysis.expiryDate) && (
        <SectionCard title="Dates" icon="calendar">
          {analysis.issueDate && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldKey}>Issue Date</Text>
              <Text style={styles.fieldValue}>{formatDate(analysis.issueDate)}</Text>
            </View>
          )}
          {analysis.expiryDate && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldKey}>Expiry Date</Text>
              <Text style={[styles.fieldValue, { color: colors.warning }]}>
                {formatDate(analysis.expiryDate)}
              </Text>
            </View>
          )}
        </SectionCard>
      )}

      {/* Meta */}
      <View style={styles.metaRow}>
        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textTertiary} />
        <Text style={styles.metaText}>
          Analysed on {formatDate(analysis.createdAt)}
        </Text>
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={18} color={colors.white} />
        <Text style={styles.backBtnText}>Back to Document</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.section },

  headerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconWrap: {
    width: 68, height: 68, borderRadius: borderRadius.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  docType: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  catBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginBottom: spacing.md },
  catText: { fontSize: 13, fontWeight: '600' },

  confidenceWrap: { width: '100%' },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  confidenceLabel: { fontSize: 12, color: colors.textSecondary },
  confidencePct: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  confidenceBar: { height: 8, backgroundColor: colors.borderLight, borderRadius: borderRadius.full, overflow: 'hidden' },
  confidenceFill: { height: 8, borderRadius: borderRadius.full },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },

  summaryText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  bulletText: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

  fieldRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  fieldKey: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  fieldValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1.5, textAlign: 'right' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  metaText: { fontSize: 12, color: colors.textTertiary },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    paddingVertical: spacing.md, borderRadius: borderRadius.md,
  },
  backBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});

export default AISummaryScreen;
