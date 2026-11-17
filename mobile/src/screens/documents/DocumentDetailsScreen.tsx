import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, RefreshControl,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { documentService } from '../../services/documentService';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DocumentStatusBadge from '../../components/documents/DocumentStatusBadge';
import { colors, getCategoryColor } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentItem, DocumentStackParamList } from '../../types';
import { formatDate, formatDateLong, formatFileSize, getRelativeTime } from '../../utils/helpers';

type RouteProps = RouteProp<DocumentStackParamList, 'DocumentDetails'>;
type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const DocumentDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { documentId } = route.params;
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const doc = await documentService.getDocumentById(documentId);
      setDocument(doc);
    } catch {
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocument(); }, [documentId]);

  const handleDelete = () => {
    Alert.alert('Delete Document', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await documentService.deleteDocument(documentId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete document');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!document) return <View style={styles.container}><Text>Document not found</Text></View>;

  const categoryColor = getCategoryColor(document.category);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDocument} />}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={[styles.fileIcon, { backgroundColor: `${categoryColor}15` }]}>
          <MaterialCommunityIcons
            name={document.fileType === 'pdf' ? 'file-pdf-box' : 'file-image'}
            size={40}
            color={categoryColor}
          />
        </View>
        <Text style={styles.docTitle}>{document.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.catBadge, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={[styles.catText, { color: categoryColor }]}>{document.category}</Text>
          </View>
          <DocumentStatusBadge status={document.expiryStatus} expiryDate={document.expiryDate} />
        </View>
        {document.isAIProcessed && (
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons name="robot" size={12} color={colors.primary} />
            <Text style={styles.aiText}>AI Analyzed</Text>
          </View>
        )}
      </View>

      {/* Document Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Document Information</Text>
        <InfoRow label="Holder Name" value={document.holderName} />
        <InfoRow label="Document Number" value={document.documentNumber} />
        <InfoRow label="Issuing Authority" value={document.issuingAuthority} />
        <InfoRow label="Issue Date" value={formatDateLong(document.issueDate)} />
        <InfoRow label="Expiry Date" value={formatDateLong(document.expiryDate)} />
        {document.description && (
          <View style={styles.descRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.descValue}>{document.description}</Text>
          </View>
        )}
      </View>

      {/* File Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>File Information</Text>
        <InfoRow label="File Type" value={document.fileType.toUpperCase()} />
        <InfoRow label="File Size" value={formatFileSize(document.fileSize)} />
        <InfoRow label="Original Name" value={document.originalFileName} />
        <InfoRow label="Uploaded" value={getRelativeTime(document.createdAt)} />
        <InfoRow label="Last Updated" value={getRelativeTime(document.updatedAt)} />
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <Button
          title="Preview Document"
          onPress={() => navigation.navigate('DocumentPreview', {
            fileUrl: document.fileUrl,
            fileType: document.fileType,
            title: document.title,
          })}
          variant="outline"
          icon="eye"
          style={styles.actionBtn}
        />
        <Button
          title={document.isAIProcessed ? 'View AI Analysis & Summary' : 'Analyze with AI'}
          onPress={() => navigation.navigate('AIAnalysis', { documentId: document._id })}
          variant="secondary"
          icon="robot"
          style={styles.actionBtn}
        />
        <Button
          title="Delete Document"
          onPress={handleDelete}
          variant="danger"
          loading={deleting}
          icon="delete"
          style={styles.actionBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.section },
  headerCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  fileIcon: {
    width: 72, height: 72, borderRadius: borderRadius.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  docTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  catBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  catText: { fontSize: 13, fontWeight: '600' },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryBg, paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.sm,
  },
  aiText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  infoCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', flex: 1.5, textAlign: 'right' },
  descRow: { paddingVertical: spacing.sm },
  descValue: { fontSize: 13, color: colors.textPrimary, lineHeight: 20, marginTop: spacing.xs },
  actionsCard: { gap: spacing.md },
  actionBtn: { marginBottom: 0 },
});

export default DocumentDetailsScreen;
