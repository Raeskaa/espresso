import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons
          name={icon as React.ComponentProps<typeof Ionicons>['name']}
          size={16}
          color="#2D4A3E"
        />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (!user) return null;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
  const email =
    user.emailAddresses?.[0]?.emailAddress ?? '';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <Row icon="mail-outline" label="Email" value={email} />
        <View style={styles.divider} />
        <Row icon="calendar-outline" label="Member since" value={joinedDate} />
        <View style={styles.divider} />
        <Row
          icon="person-outline"
          label="User ID"
          value={user.id.slice(0, 12) + '…'}
        />
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              'Manage Subscription',
              'Open the web app to manage your subscription and credits.',
              [{ text: 'OK' }]
            )
          }
        >
          <View style={styles.menuIcon}>
            <Ionicons name="flash-outline" size={18} color="#2D4A3E" />
          </View>
          <Text style={styles.menuLabel}>Credits & Subscription</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(45,74,62,0.3)"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          </View>
          <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(220,38,38,0.3)" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Espresso v1.0 — AI Photo Enhancement</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F0E8' },
  content: { padding: 20, paddingBottom: 50 },
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2D4A3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#E8FF8B' },
  displayName: { fontSize: 20, fontWeight: '800', color: '#2D4A3E', marginBottom: 2 },
  email: { fontSize: 13, color: 'rgba(45,74,62,0.5)' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(45,74,62,0.1)',
    overflow: 'hidden',
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(45,74,62,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 11, color: 'rgba(45,74,62,0.45)', fontWeight: '600', marginBottom: 1 },
  rowValue: { fontSize: 13, color: '#2D4A3E', fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(45,74,62,0.07)', marginHorizontal: 14 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(45,74,62,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(45,74,62,0.08)',
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(45,74,62,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D4A3E' },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(45,74,62,0.3)',
    marginTop: 4,
  },
});
