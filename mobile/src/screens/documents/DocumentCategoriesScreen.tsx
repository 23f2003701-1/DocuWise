import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDocuments } from '../../context/DocumentContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { colors, getCategoryColor } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentStackParamList } from '../../types';
import { getCategoryIcon } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const ALL_CATEGORIES = ['Identity', 'Educational', 'Vehicle', 'Insurance', 'Financial', 'Property', 'Medical', 'Legal', 'Other'];

const DocumentCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { categories, isLoading, fetchCategories } = useDocuments();

  useEffect(() => { fetchCategories(); }, []);

  const getCount = (cat: string) => categories.find((c) => c.category === cat)?.count ?? 0;

  if (isLoading && categories.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCategories} />}
        ListEmptyComponent={<EmptyState icon="view-grid-outline" title="No Categories" message="Upload documents to see categories." />}
        renderItem={({ item }) => {
          const color = getCategoryColor(item);
          const count = getCount(item);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('MyDocuments' as any, { category: item } as any)
              }
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={getCategoryIcon(item) as any} size={32} color={color} />
              </View>
              <Text style={styles.catName}>{item}</Text>
              <Text style={[styles.catCount, { color }]}>{count} doc{count !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  row: { justifyContent: 'space-between', marginBottom: spacing.md },
  card: {
    width: '48%', backgroundColor: colors.white,
    borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center',
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  iconBox: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  catName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  catCount: { fontSize: 12, fontWeight: '500' },
});

export default DocumentCategoriesScreen;
