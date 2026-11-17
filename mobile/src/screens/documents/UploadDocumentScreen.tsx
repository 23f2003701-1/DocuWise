import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { documentService } from '../../services/documentService';
import { useDocuments } from '../../context/DocumentContext';
import { DocumentCategory, DocumentStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const CATEGORIES: DocumentCategory[] = ['Identity', 'Educational', 'Vehicle', 'Insurance', 'Financial', 'Property', 'Medical', 'Legal', 'Other'];

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

const UploadDocumentScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { refreshAll } = useDocuments();

  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [autoExtract, setAutoExtract] = useState(true);
  const [showManualFields, setShowManualFields] = useState(false);

  // Form fields (all optional when autoExtract is enabled)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Other');
  const [description, setDescription] = useState('');
  const [holderName, setHolderName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
      });
      if (!title) {
        setTitle(asset.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: `doc_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        size: asset.fileSize || 0,
      });
      if (!title) {
        setTitle(`Document ${new Date().toLocaleDateString()}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!pickedFile) errs.file = 'Please select a PDF or image file first';
    if (!autoExtract && !title.trim()) errs.title = 'Title is required when manual entry is chosen';
    if (issueDate && !/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) errs.issueDate = 'Use YYYY-MM-DD format';
    if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) errs.expiryDate = 'Use YYYY-MM-DD format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpload = async () => {
    if (!validate() || !pickedFile) return;

    setLoading(true);
    try {
      const defaultTitle = title.trim() || pickedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'New Document';
      
      const metadata: Record<string, string> = {
        title: defaultTitle,
        category: category || 'Other',
        description: description.trim(),
        holderName: holderName.trim(),
        documentNumber: documentNumber.trim(),
        issuingAuthority: issuingAuthority.trim(),
        issueDate: issueDate.trim(),
        expiryDate: expiryDate.trim(),
      };

      const doc = await documentService.uploadDocument(
        pickedFile.uri,
        pickedFile.name,
        pickedFile.mimeType,
        metadata
      );

      await refreshAll();

      if (autoExtract) {
        // Automatically route straight to AI analysis
        (navigation as any).navigate('AIAnalysis', { documentId: doc._id });
      } else {
        Alert.alert(
          '✅ Uploaded Successfully',
          'Document has been stored in your vault.',
          [
            {
              text: 'View Document',
              onPress: () =>
                (navigation as any).navigate('DocumentDetails', { documentId: doc._id }),
            },
            { text: 'Done', style: 'cancel' },
          ]
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload document. Please check server connection.';
      Alert.alert('Upload Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Step 1: Select File */}
        <Text style={styles.sectionTitle}>1. Select Document</Text>
        <View style={styles.pickerRow}>
          <TouchableOpacity style={styles.pickerBtn} onPress={pickDocument}>
            <MaterialCommunityIcons name="file-pdf-box" size={36} color={colors.danger} />
            <Text style={styles.pickerLabel}>Upload PDF</Text>
            <Text style={styles.pickerSubLabel}>From files / drive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerBtn} onPress={pickImage}>
            <MaterialCommunityIcons name="camera-image" size={36} color={colors.primary} />
            <Text style={styles.pickerLabel}>Upload Photo</Text>
            <Text style={styles.pickerSubLabel}>From photo library</Text>
          </TouchableOpacity>
        </View>

        {pickedFile && (
          <View style={styles.filePreview}>
            <MaterialCommunityIcons
              name={pickedFile.mimeType === 'application/pdf' ? 'file-pdf-box' : 'file-image'}
              size={28}
              color={colors.primary}
            />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{pickedFile.name}</Text>
              <Text style={styles.fileSize}>{(pickedFile.size / 1024).toFixed(1)} KB</Text>
            </View>
            <TouchableOpacity onPress={() => setPickedFile(null)}>
              <MaterialCommunityIcons name="close-circle" size={22} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}
        {errors.file && <Text style={styles.errorText}>{errors.file}</Text>}

        {/* Step 2: AI Auto-Extract Banner */}
        <View style={styles.aiCard}>
          <View style={styles.aiRow}>
            <View style={styles.aiIconBox}>
              <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI Automatic Extraction</Text>
              <Text style={styles.aiSubtitle}>
                Gemini AI will automatically extract document type, holder name, document number, issue date, and expiry date.
              </Text>
            </View>
            <Switch
              value={autoExtract}
              onValueChange={setAutoExtract}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={autoExtract ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>

        {/* Optional Manual Overrides */}
        <TouchableOpacity
          style={styles.toggleManualBtn}
          onPress={() => setShowManualFields(!showManualFields)}
        >
          <MaterialCommunityIcons
            name={showManualFields ? 'chevron-down' : 'chevron-right'}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.toggleManualText}>
            {showManualFields ? 'Hide manual details' : 'Enter details manually instead (Optional)'}
          </Text>
        </TouchableOpacity>

        {showManualFields && (
          <View style={styles.manualCard}>
            <Text style={styles.subSectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Passport, Driver License" error={errors.title} />
            <Input label="Holder Name" value={holderName} onChangeText={setHolderName} placeholder="Name on document" leftIcon="account-outline" />
            <Input label="Document Number" value={documentNumber} onChangeText={setDocumentNumber} placeholder="ID/Reference number" leftIcon="identifier" />
            <Input label="Issuing Authority" value={issuingAuthority} onChangeText={setIssuingAuthority} placeholder="e.g. Govt of India" leftIcon="office-building-outline" />
            <Input label="Issue Date (YYYY-MM-DD)" value={issueDate} onChangeText={setIssueDate} placeholder="2022-01-15" keyboardType="numbers-and-punctuation" leftIcon="calendar-plus" error={errors.issueDate} />
            <Input label="Expiry Date (YYYY-MM-DD)" value={expiryDate} onChangeText={setExpiryDate} placeholder="2032-01-14" keyboardType="numbers-and-punctuation" leftIcon="calendar-clock" error={errors.expiryDate} />
            <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional notes..." multiline numberOfLines={3} />
          </View>
        )}

        <View style={styles.actionWrap}>
          <Button
            title={autoExtract ? 'Upload & Auto-Extract with AI ✨' : 'Upload Document'}
            onPress={handleUpload}
            loading={loading}
            icon={autoExtract ? 'robot' : 'cloud-upload'}
          />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.section },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.md },
  pickerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  pickerBtn: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
  },
  pickerLabel: { fontSize: 14, color: colors.textPrimary, marginTop: spacing.sm, fontWeight: '600' },
  pickerSubLabel: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  filePreview: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.primaryLight,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  fileSize: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  errorText: { fontSize: 12, color: colors.danger, marginBottom: spacing.sm },

  aiCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: spacing.lg,
  },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  aiIconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
  },
  aiTextContainer: { flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  aiSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },

  toggleManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleManualText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  manualCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  subSectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  catScroll: { marginBottom: spacing.md },
  catChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight, marginRight: spacing.sm,
  },
  catChipActive: { backgroundColor: colors.primary },
  catChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  catChipTextActive: { color: colors.white, fontWeight: '600' },

  actionWrap: { marginTop: spacing.md },
});

export default UploadDocumentScreen;
