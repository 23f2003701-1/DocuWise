import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, logout, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateUser({ name: name.trim(), email: email.trim() });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const getInitials = (n: string) =>
    n
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name || 'U')}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.createdAt && (
          <Text style={styles.memberSince}>Member since {formatDate(user.createdAt)}</Text>
        )}
      </View>

      {/* Edit profile card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <TouchableOpacity
            onPress={() => {
              if (editing) {
                setName(user?.name || '');
                setEmail(user?.email || '');
              }
              setEditing(e => !e);
            }}
          >
            <MaterialCommunityIcons
              name={editing ? 'close' : 'pencil'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {editing ? (
          <>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-outline" size={16} color={colors.textTertiary} />
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color={colors.textTertiary} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </>
        )}
      </View>

      {/* Quick links */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => (navigation as any).navigate('Notifications')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primaryBg }]}>
            <MaterialCommunityIcons name="bell-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => (navigation as any).navigate('Settings')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primaryBg }]}>
            <MaterialCommunityIcons name="cog-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Settings</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.section },

  avatarSection: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  userEmail: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  memberSince: { fontSize: 12, color: colors.textTertiary },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },

  inputLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.xs },
  textInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.textPrimary, marginBottom: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.sm,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1.5, textAlign: 'right' },

  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  actionIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { flex: 1, fontSize: 14, color: colors.textPrimary },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginHorizontal: spacing.lg,
    paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});

export default ProfileScreen;
