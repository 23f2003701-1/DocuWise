import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AuthStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(name);
    if (nameErr) newErrors.name = nameErr;
    if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';
    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <MaterialCommunityIcons name="account-plus" size={40} color={colors.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start organizing your documents</Text>
        </View>

        <View style={styles.form}>
          <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" leftIcon="account-outline" error={errors.name} />
          <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" leftIcon="email-outline" error={errors.email} />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry leftIcon="lock-outline" error={errors.password} />
          <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat your password" secureTextEntry leftIcon="lock-check-outline" error={errors.confirmPassword} />
          <Button title="Create Account" onPress={handleRegister} loading={loading} icon="account-check" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.xl },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  logoBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.xs },
  form: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.xl, marginBottom: spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 15, color: colors.textSecondary },
  link: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});

export default RegisterScreen;
