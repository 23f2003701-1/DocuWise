import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import StatCard from '../../components/dashboard/StatCard';
import RecentDocuments from '../../components/dashboard/RecentDocuments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { DocumentStackParamList, RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';
import DocumentStatusBadge from '../../components/documents/DocumentStatusBadge';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { dashboardStats, isLoading, fetchDashboard } = useDocuments();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatValue = (statusKey: string) => {
    return dashboardStats?.statusCounts?.find((s) => s.status === statusKey)?.count ?? 0;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading && !dashboardStats) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDashboard} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{user?.name?.split(' ')[0] ?? 'User'} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      <View style={styles.banner}>
        <MaterialCommunityIcons name="file-document-multiple" size={32} color={colors.white} />
        <View style={styles.bannerText}>
          <Text style={styles.bannerCount}>{dashboardStats?.totalDocuments ?? 0}</Text>
          <Text style={styles.bannerLabel}>Total Documents</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard title="Valid" value={getStatValue('Valid')} icon="check-circle" color={colors.success} />
        <View style={styles.statGap} />
        <StatCard title="Expiring" value={getStatValue('Expiring Soon')} icon="alert-circle" color={colors.warning} />
        <View style={styles.statGap} />
        <StatCard title="Expired" value={getStatValue('Expired')} icon="close-circle" color={colors.danger} />
      </View>

      {/* Upcoming Expiries */}
      {(dashboardStats?.upcomingExpiries?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Upcoming Expiries</Text>
          {dashboardStats!.upcomingExpiries.slice(0, 3).map((doc) => (
            <TouchableOpacity
              key={doc._id}
              style={styles.expiryRow}
              onPress={() => (navigation as any).navigate('DocumentDetails', { documentId: doc._id })}
            >
              <View style={styles.expiryLeft}>
                <Text style={styles.expiryTitle} numberOfLines={1}>{doc.title}</Text>
                <Text style={styles.expiryDate}>Expires {formatDate(doc.expiryDate)}</Text>
              </View>
              <DocumentStatusBadge status={doc.expiryStatus} expiryDate={doc.expiryDate} compact />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Documents */}
      {(dashboardStats?.recentDocuments?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <RecentDocuments
            documents={dashboardStats!.recentDocuments}
            onDocumentPress={(id) => (navigation as any).navigate('DocumentDetails', { documentId: id })}
            onViewAll={() => (navigation as any).navigate('Documents', { screen: 'MyDocuments' })}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  greeting: { fontSize: 14, color: colors.textSecondary },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  banner: {
    backgroundColor: colors.primary, borderRadius: 16, padding: spacing.xl,
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl,
  },
  bannerText: { marginLeft: spacing.lg },
  bannerCount: { fontSize: 36, fontWeight: '800', color: colors.white },
  bannerLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  statsRow: { flexDirection: 'row', marginBottom: spacing.xl },
  statGap: { width: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  expiryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  expiryLeft: { flex: 1, marginRight: spacing.md },
  expiryTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  expiryDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default HomeScreen;
