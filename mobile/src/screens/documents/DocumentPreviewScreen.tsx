import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Image, ScrollView, Dimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { DocumentStackParamList } from '../../types';

type RouteProps = RouteProp<DocumentStackParamList, 'DocumentPreview'>;
type Nav = NativeStackNavigationProp<DocumentStackParamList>;

const { width, height } = Dimensions.get('window');

const DocumentPreviewScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { fileUrl, fileType, title } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPdf = fileType === 'pdf';

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color={colors.danger} />
        <Text style={styles.errorTitle}>Failed to load preview</Text>
        <Text style={styles.errorSubtitle}>The document could not be displayed.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => setError(false)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.headerRight}>
          <MaterialCommunityIcons
            name={isPdf ? 'file-pdf-box' : 'file-image'}
            size={22}
            color={isPdf ? colors.danger : colors.primary}
          />
        </View>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading preview...</Text>
        </View>
      )}

      {/* PDF Preview via WebView */}
      {isPdf ? (
        <WebView
          source={{ uri: fileUrl }}
          style={[styles.webview, loading && styles.hidden]}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          onHttpError={() => { setLoading(false); setError(true); }}
          startInLoadingState={false}
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        /* Image Preview */
        <ScrollView
          style={styles.imageScroll}
          contentContainerStyle={styles.imageContainer}
          maximumZoomScale={4}
          minimumZoomScale={1}
          bouncesZoom
        >
          <Image
            source={{ uri: fileUrl }}
            style={[styles.image, loading && styles.hidden]}
            resizeMode="contain"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        </ScrollView>
      )}

      {/* File type badge */}
      {!loading && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{isPdf ? 'PDF' : 'IMAGE'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 10,
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  headerRight: { padding: spacing.xs },
  webview: { flex: 1 },
  hidden: { opacity: 0 },
  imageScroll: { flex: 1, backgroundColor: '#111' },
  imageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  image: {
    width: width - spacing.lg * 2,
    height: height * 0.75,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 5,
  },
  loadingText: { marginTop: spacing.md, fontSize: 14, color: colors.textSecondary },
  badge: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  errorTitle: {
    fontSize: 18, fontWeight: '700', color: colors.textPrimary,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  errorSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.xl, backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: borderRadius.md,
  },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});

export default DocumentPreviewScreen;
