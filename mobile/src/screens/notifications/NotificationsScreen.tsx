import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { notificationService } from '../../services/notificationService';
import NotificationItem from '../../components/notifications/NotificationItem';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Reminder } from '../../types';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (pg: number = 1, append = false) => {
    if (pg === 1 && !append) setLoading(true);
    try {
      const result = await notificationService.getNotifications(pg, 20);
      const items: Reminder[] = result.notifications || [];
      setNotifications(prev => (append ? [...prev, ...items] : items));
      const pagination = result.pagination || {};
      setHasMore((pagination.page || 1) < (pagination.pages || 1));
      setPage(pg);
    } catch {
      // keep existing state
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchNotifications(page + 1, true);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading notifications…" />;

  return (
    <View style={styles.container}>
      {/* Header summary */}
      {notifications.length > 0 && (
        <View style={styles.summaryBar}>
          <MaterialCommunityIcons name="bell-outline" size={16} color={colors.primary} />
          <Text style={styles.summaryText}>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => <NotificationItem reminder={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoad}>
              <Text style={styles.footerText}>Loading more…</Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell-off-outline"
            title="No notifications yet"
            message="When documents are approaching their expiry, you'll get reminders here."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  summaryText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  list: { paddingVertical: spacing.sm, paddingBottom: spacing.section },
  footerLoad: { alignItems: 'center', paddingVertical: spacing.lg },
  footerText: { fontSize: 13, color: colors.textTertiary },
});

export default NotificationsScreen;
