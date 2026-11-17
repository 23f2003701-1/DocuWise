import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { documentService } from '../../services/documentService';
import DocumentCard from '../../components/documents/DocumentCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentItem, DocumentStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<DocumentStackParamList>;

type TabKey = 'expiringSoon' | 'expired' | 'valid' | 'noExpiry';

interface ExpiryGroups {
  expiringSoon: DocumentItem[];
  expired: DocumentItem[];
  valid: DocumentItem[];
  noExpiry: DocumentItem[];
}

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
  { key: 'expiringSoon', label: 'Expiring Soon', icon: 'clock-alert', color: colors.warning },
  { key: 'expired', label: 'Expired', icon: 'calendar-remove', color: colors.danger },
  { key: 'valid', label: 'Valid', icon: 'check-circle', color: colors.success },
  { key: 'noExpiry', label: 'No Expiry', icon: 'infinity', color: colors.textTertiary },
];

const ExpiryTrackerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [groups, setGroups] = useState<ExpiryGroups>({
    expiringSoon: [],
    expired: [],
    valid: [],
    noExpiry: [],
  });
  const [activeTab, setActiveTab] = useState<TabKey>('expiringSoon');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await documentService.getExpiryTracker();
      setGroups({
        expiringSoon: data.expiringSoon || [],
        expired: data.expired || [],
        valid: data.valid || [],
        noExpiry: data.noExpiry || [],
      });
    } catch {
      // keep existing state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const activeTab_ = TABS.find(t => t.key === activeTab)!;
  const activeDocs = groups[activeTab];

  if (loading) return <LoadingSpinner fullScreen message="Loading expiry tracker…" />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primary} />
        <Text style={styles.headerTitle}>Expiry Tracker</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const count = groups[tab.key].length;
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && { borderBottomColor: tab.color, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={16}
                color={isActive ? tab.color : colors.textTertiary}
              />
              {count > 0 && (
                <View style={[styles.badge, { backgroundColor: tab.color }]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
              <Text style={[styles.tabLabel, isActive && { color: tab.color }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info strip */}
      <View style={[styles.infoStrip, { backgroundColor: `${activeTab_.color}15` }]}>
        <MaterialCommunityIcons name={activeTab_.icon as any} size={16} color={activeTab_.color} />
        <Text style={[styles.infoText, { color: activeTab_.color }]}>
          {activeDocs.length} document{activeDocs.length !== 1 ? 's' : ''} — {activeTab_.label}
        </Text>
      </View>

      {/* Document list */}
      <FlatList
        data={activeDocs}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onPress={() => navigation.navigate('DocumentDetails', { documentId: item._id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab_.icon}
            title={`No ${activeTab_.label} documents`}
            message={
              activeTab === 'expiringSoon'
                ? 'No documents expiring in the next 30 days.'
                : activeTab === 'expired'
                ? 'No expired documents. Great!'
                : activeTab === 'valid'
                ? 'No valid documents found.'
                : 'No documents without an expiry date.'
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: 10, fontWeight: '600', color: colors.textTertiary },
  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  infoText: { fontSize: 13, fontWeight: '600' },
  list: { padding: spacing.lg, paddingBottom: spacing.section },
});

export default ExpiryTrackerScreen;
