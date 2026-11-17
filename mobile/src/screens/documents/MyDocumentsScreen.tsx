import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DocumentCard from '../../components/documents/DocumentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDocuments } from '../../context/DocumentContext';
import { DocumentItem, DocumentStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const MyDocumentsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { documents, isLoading, fetchDocuments, pagination } = useDocuments();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDocumentPress = (doc: DocumentItem) => {
    navigation.navigate('DocumentDetails', { documentId: doc._id });
  };

  if (isLoading && documents.length === 0) {
    return <LoadingSpinner fullScreen message="Loading documents..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.count}>{pagination?.total ?? documents.length} documents</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('DocumentCategories')}>
            <MaterialCommunityIcons name="view-grid-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.uploadBtn]}
            onPress={() => navigation.navigate('UploadDocument')}
          >
            <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DocumentCard document={item} onPress={() => handleDocumentPress(item)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchDocuments()} />}
        ListEmptyComponent={
          <EmptyState
            icon="file-document-outline"
            title="No Documents Yet"
            message="Upload your first document to get started."
            actionLabel="Upload Document"
            onAction={() => navigation.navigate('UploadDocument')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  count: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center',
  },
  uploadBtn: { backgroundColor: colors.primary },
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
});

export default MyDocumentsScreen;
