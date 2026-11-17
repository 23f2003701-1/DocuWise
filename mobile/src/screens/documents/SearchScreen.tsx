import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { documentService } from '../../services/documentService';
import DocumentCard from '../../components/documents/DocumentCard';
import EmptyState from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentItem, DocumentCategory, ExpiryStatus, DocumentStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const CATEGORIES: (DocumentCategory | 'All')[] = [
  'All', 'Identity', 'Educational', 'Vehicle', 'Insurance', 'Financial', 'Property', 'Medical', 'Legal', 'Other',
];
const STATUSES: (ExpiryStatus | 'All')[] = ['All', 'Valid', 'Expiring Soon', 'Expired', 'No Expiry'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt', order: 'desc' },
  { label: 'Oldest', value: 'createdAt', order: 'asc' },
  { label: 'Name A–Z', value: 'title', order: 'asc' },
  { label: 'Expiry Date', value: 'expiryDate', order: 'asc' },
];

const ChipRow: React.FC<{
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}> = ({ items, selected, onSelect }) => (
  <View style={chipStyles.row}>
    {items.map(item => (
      <TouchableOpacity
        key={item}
        style={[chipStyles.chip, selected === item && chipStyles.chipActive]}
        onPress={() => onSelect(item)}
      >
        <Text style={[chipStyles.chipText, selected === item && chipStyles.chipTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const chipStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.white, fontWeight: '600' },
});

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [sortIdx, setSortIdx] = useState(0);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string, cat: string, st: string, si: number, pg: number, append = false) => {
      setLoading(true);
      try {
        const sort = SORT_OPTIONS[si];
        const params: Record<string, any> = {
          page: pg,
          limit: 20,
          sortBy: sort.value,
          order: sort.order,
        };
        if (q.trim()) params.search = q.trim();
        if (cat !== 'All') params.category = cat;
        if (st !== 'All') params.status = st;

        const result = await documentService.getDocuments(params);
        const docs = result.documents || [];
        setDocuments(prev => (append ? [...prev, ...docs] : docs));
        setHasMore(result.pagination.page < result.pagination.pages);
        setPage(pg);
      } catch {
        // silent — show empty state
      } finally {
        setLoading(false);
        setSearched(true);
      }
    },
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      runSearch(text, category, status, sortIdx, 1);
    }, 300);
  };

  const handleFilterChange = (cat: string, st: string, si: number) => {
    setCategory(cat);
    setStatus(st);
    setSortIdx(si);
    runSearch(query, cat, st, si, 1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      runSearch(query, category, status, sortIdx, page + 1, true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setDocuments([]);
    setSearched(false);
    setCategory('All');
    setStatus('All');
    setSortIdx(0);
    setPage(1);
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder="Search documents…"
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={handleQueryChange}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(f => !f)}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={18}
            color={showFilters ? colors.white : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Category</Text>
          <ChipRow
            items={CATEGORIES as string[]}
            selected={category}
            onSelect={cat => handleFilterChange(cat, status, sortIdx)}
          />
          <Text style={styles.filterLabel}>Status</Text>
          <ChipRow
            items={STATUSES as string[]}
            selected={status}
            onSelect={st => handleFilterChange(category, st, sortIdx)}
          />
          <Text style={styles.filterLabel}>Sort By</Text>
          <ChipRow
            items={SORT_OPTIONS.map(s => s.label)}
            selected={SORT_OPTIONS[sortIdx].label}
            onSelect={label => {
              const idx = SORT_OPTIONS.findIndex(s => s.label === label);
              handleFilterChange(category, status, idx);
            }}
          />
        </View>
      )}

      {/* Loading indicator */}
      {loading && documents.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching…</Text>
        </View>
      )}

      {/* Results */}
      {(!loading || documents.length > 0) && (
        <FlatList
          data={documents}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading && documents.length > 0}
              onRefresh={() => runSearch(query, category, status, sortIdx, 1)}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onPress={() => navigation.navigate('DocumentDetails', { documentId: item._id })}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && documents.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.lg }} />
            ) : undefined
          }
          ListEmptyComponent={
            searched ? (
              <EmptyState
                icon="file-search-outline"
                title="No results found"
                message={
                  query ? `No documents match "${query}"` : 'Try different filters or search terms.'
                }
              />
            ) : (
              <View style={styles.hintWrap}>
                <MaterialCommunityIcons name="magnify" size={48} color={colors.borderLight} />
                <Text style={styles.hintText}>Search by title, category, or document number</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  filterBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryBg,
  },
  filterBtnActive: { backgroundColor: colors.primary },
  filterPanel: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.section },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 14 },
  hintWrap: { alignItems: 'center', marginTop: 80, paddingHorizontal: spacing.xxl },
  hintText: { marginTop: spacing.md, fontSize: 14, color: colors.textTertiary, textAlign: 'center' },
});

export default SearchScreen;
