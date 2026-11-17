import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { documentService } from '../../services/documentService';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { AIAnalysisResult, DocumentItem, DocumentStackParamList, DocumentCategory } from '../../types';
import Input from '../../components/common/Input';

type RouteProps = RouteProp<DocumentStackParamList, 'AIAnalysis'>;
type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const AIAnalysisScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { documentId } = route.params;

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(route.params.analysis || null);
  const [document, setDocument] = useState<DocumentItem | null>(route.params.document || null);
  const [editing, setEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<DocumentItem>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (analysis) return;

    const loadSavedOrRun = async () => {
      setLoading(true);
      try {
        const saved = await documentService.getAIAnalysis(documentId);
        if (saved && saved.summary) {
          setAnalysis(saved);
          const doc = await documentService.getDocumentById(documentId);
          setDocument(doc);
          setLoading(false);
          return;
        }
      } catch {
        // No saved analysis found in database, trigger fresh analysis
      } finally {
        setLoading(false);
      }
      runAnalysis();
    };

    loadSavedOrRun();
  }, [documentId]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await documentService.analyzeDocument(documentId);
      setAnalysis(result.analysis);
      setDocument(result.document);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err?.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;
    setSaving(true);
    try {
      await documentService.updateDocument(document._id, editedFields);
      Alert.alert('Saved', 'Document information updated successfully', [
        { text: 'View Document', onPress: () => navigation.navigate('DocumentDetails', { documentId: document._id }) },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (analyzing) {
    return <LoadingSpinner fullScreen message="🤖 Analyzing document with Gemini AI..." />;
  }

  if (!analysis) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="robot-confused-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.noAnalysisText}>No analysis available</Text>
        <Button title="Analyze with AI" onPress={runAnalysis} loading={loading} icon="robot" />
      </View>
    );
  }

  const confidencePercent = Math.round(analysis.confidence * 100);
  const confidenceColor = confidencePercent >= 80 ? colors.success : confidencePercent >= 60 ? colors.warning : colors.danger;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI Result Header */}
      <View style={styles.resultHeader}>
        <View style={styles.robotIcon}>
          <MaterialCommunityIcons name="robot" size={32} color={colors.primary} />
        </View>
        <View style={styles.resultHeaderText}>
          <Text style={styles.documentType}>{analysis.documentType}</Text>
          <Text style={styles.category}>{analysis.category}</Text>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>AI Confidence: </Text>
            <Text style={[styles.confidenceValue, { color: confidenceColor }]}>{confidencePercent}%</Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <TouchableOpacity
        style={styles.summaryCard}
        onPress={() => navigation.navigate('AISummary', { analysis })}
      >
        <Text style={styles.summaryLabel}>AI Summary</Text>
        <Text style={styles.summaryText} numberOfLines={3}>{analysis.summary}</Text>
        <Text style={styles.viewMore}>View Full Summary →</Text>
      </TouchableOpacity>

      {/* Extracted Fields */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Extracted Information</Text>
          <TouchableOpacity onPress={() => { setEditing(!editing); setEditedFields({}); }}>
            <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {!editing ? (
          <View style={styles.fieldsCard}>
            {[
              { label: 'Holder Name', value: analysis.holderName },
              { label: 'Document Number', value: analysis.documentNumber },
              { label: 'Issuing Authority', value: analysis.issuingAuthority },
              { label: 'Issue Date', value: analysis.issueDate },
              { label: 'Expiry Date', value: analysis.expiryDate },
            ].map(({ label, value }) =>
              value ? (
                <View key={label} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <Text style={styles.fieldValue}>{value}</Text>
                </View>
              ) : null
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.editNote}>Review and correct the AI-extracted information before saving:</Text>
            <Input label="Holder Name" value={editedFields.holderName ?? document?.holderName ?? ''} onChangeText={(v) => setEditedFields((p) => ({ ...p, holderName: v }))} />
            <Input label="Document Number" value={editedFields.documentNumber ?? document?.documentNumber ?? ''} onChangeText={(v) => setEditedFields((p) => ({ ...p, documentNumber: v }))} />
            <Input label="Issuing Authority" value={editedFields.issuingAuthority ?? document?.issuingAuthority ?? ''} onChangeText={(v) => setEditedFields((p) => ({ ...p, issuingAuthority: v }))} />
            <Input label="Issue Date (YYYY-MM-DD)" value={editedFields.issueDate ?? document?.issueDate ?? ''} onChangeText={(v) => setEditedFields((p) => ({ ...p, issueDate: v }))} keyboardType="numbers-and-punctuation" />
            <Input label="Expiry Date (YYYY-MM-DD)" value={editedFields.expiryDate ?? document?.expiryDate ?? ''} onChangeText={(v) => setEditedFields((p) => ({ ...p, expiryDate: v }))} keyboardType="numbers-and-punctuation" />
            <Button title="Save Changes" onPress={handleSave} loading={saving} />
          </View>
        )}
      </View>

      {/* Important Details */}
      {analysis.importantDetails?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Details</Text>
          {analysis.importantDetails.map((detail, idx) => (
            <View key={idx} style={styles.detailRow}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors.success} />
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Re-analyze" onPress={runAnalysis} variant="outline" icon="refresh" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.section },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  noAnalysisText: { fontSize: 16, color: colors.textSecondary, marginVertical: spacing.xl },
  resultHeader: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  robotIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg,
  },
  resultHeaderText: { flex: 1 },
  documentType: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  category: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  confidenceRow: { flexDirection: 'row', alignItems: 'center' },
  confidenceLabel: { fontSize: 13, color: colors.textSecondary },
  confidenceValue: { fontSize: 13, fontWeight: '700' },
  summaryCard: {
    backgroundColor: colors.primaryBg, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primaryLight,
  },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: colors.primary, marginBottom: spacing.sm },
  summaryText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  viewMore: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  editBtn: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  fieldsCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight,
  },
  fieldRow: {
    flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  fieldValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: spacing.md },
  editNote: { fontSize: 13, color: colors.warning, marginBottom: spacing.md, lineHeight: 18 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  detailText: { fontSize: 14, color: colors.textPrimary, flex: 1, lineHeight: 20 },
  actions: { gap: spacing.md },
});

export default AIAnalysisScreen;
