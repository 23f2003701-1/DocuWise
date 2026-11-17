import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { NotificationPreferences } from '../../types';

const SettingsScreen: React.FC = () => {
  const { user, logout, changePassword, refreshProfile } = useAuth();

  // Notification prefs
  const [expiryReminders, setExpiryReminders] = useState(
    user?.notificationPreferences?.expiryReminders ?? true
  );
  const [reminderDays, setReminderDays] = useState<number[]>(
    user?.notificationPreferences?.reminderDays ?? [30, 7, 1]
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwdSection, setShowPwdSection] = useState(false);

  const toggleDay = (day: number) => {
    setReminderDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      const prefs: NotificationPreferences = { expiryReminders, reminderDays };
      await authService.updateNotificationPreferences(prefs);
      await refreshProfile();
      Alert.alert('Saved', 'Notification preferences updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (newPwd.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setChangingPwd(true);
    try {
      await changePassword(currentPwd, newPwd);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setShowPwdSection(false);
      Alert.alert('Success', 'Password changed successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Notification Preferences */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="bell-outline" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Expiry Reminders</Text>
            <Text style={styles.switchDesc}>Receive alerts before documents expire</Text>
          </View>
          <Switch
            value={expiryReminders}
            onValueChange={setExpiryReminders}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={expiryReminders ? colors.primary : colors.textTertiary}
          />
        </View>

        {expiryReminders && (
          <>
            <Text style={styles.inputLabel}>Remind me before expiry:</Text>
            <View style={styles.daysRow}>
              {[30, 7, 1].map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    reminderDays.includes(day) && styles.dayChipActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <MaterialCommunityIcons
                    name={reminderDays.includes(day) ? 'check-circle' : 'circle-outline'}
                    size={16}
                    color={reminderDays.includes(day) ? colors.primary : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.dayChipText,
                      reminderDays.includes(day) && styles.dayChipTextActive,
                    ]}
                  >
                    {day === 1 ? '1 day' : `${day} days`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.btn, savingPrefs && { opacity: 0.7 }]}
          onPress={handleSavePrefs}
          disabled={savingPrefs}
        >
          <Text style={styles.btnText}>{savingPrefs ? 'Saving…' : 'Save Preferences'}</Text>
        </TouchableOpacity>
      </View>

      {/* Security */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="shield-lock-outline" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Security</Text>
      </View>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.collapsibleRow}
          onPress={() => setShowPwdSection(s => !s)}
        >
          <MaterialCommunityIcons name="key-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.collapsibleLabel}>Change Password</Text>
          <MaterialCommunityIcons
            name={showPwdSection ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textTertiary}
          />
        </TouchableOpacity>

        {showPwdSection && (
          <>
            <TextInput
              style={styles.textInput}
              placeholder="Current password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              value={currentPwd}
              onChangeText={setCurrentPwd}
            />
            <TextInput
              style={styles.textInput}
              placeholder="New password (min 6 characters)"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              value={confirmPwd}
              onChangeText={setConfirmPwd}
            />
            <TouchableOpacity
              style={[styles.btn, changingPwd && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={changingPwd}
            >
              <Text style={styles.btnText}>{changingPwd ? 'Changing…' : 'Change Password'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Account */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="account-cog-outline" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Account</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>DocuWise v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.section },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  switchDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  inputLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },

  daysRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  dayChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dayChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  dayChipText: { fontSize: 13, color: colors.textSecondary },
  dayChipTextActive: { color: colors.primary, fontWeight: '600' },

  btn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.sm,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  collapsibleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  collapsibleLabel: { flex: 1, fontSize: 14, color: colors.textPrimary },

  textInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.textPrimary, marginTop: spacing.sm,
  },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.xl,
    paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.dangerBg,
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', marginTop: spacing.xl, fontSize: 12, color: colors.textTertiary },
});

export default SettingsScreen;
