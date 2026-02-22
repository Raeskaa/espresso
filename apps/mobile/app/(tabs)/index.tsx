import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const WEB_APP = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000';

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/mobile/generations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits ?? null);
        }
      } catch {
        // ignore network errors
      } finally {
        setLoading(false);
      }
    }
    fetchCredits();
  }, [getToken]);

  const open = (path: string) =>
    WebBrowser.openBrowserAsync(`${WEB_APP}${path}`);

  const firstName = user?.firstName ?? 'there';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
        <Text style={styles.tagline}>
          AI-powered photos that actually look like you.
        </Text>
      </View>

      {/* Credits badge */}
      <View style={styles.creditCard}>
        <View style={styles.creditIcon}>
          <Ionicons name="flash" size={20} color="#E8FF8B" />
        </View>
        <View>
          <Text style={styles.creditLabel}>Credit Balance</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#2D4A3E" />
          ) : (
            <Text style={styles.creditValue}>
              {credits !== null ? `${credits} credits` : '—'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => open('/pricing')}
          activeOpacity={0.8}
        >
          <Text style={styles.buyBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>

      {/* Action cards */}
      <Text style={styles.sectionTitle}>What would you like to do?</Text>

      <TouchableOpacity
        style={[styles.actionCard, styles.cardGreen]}
        onPress={() => open('/generate')}
        activeOpacity={0.85}
      >
        <View style={styles.actionCardContent}>
          <Ionicons name="camera" size={28} color="#E8FF8B" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardTitle}>Quick Fix</Text>
            <Text style={styles.actionCardSub}>
              Fix eye contact, lighting, posture — 1 credit
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(232,255,139,0.6)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionCard, styles.cardDark]}
        onPress={() => open('/dating-studio')}
        activeOpacity={0.85}
      >
        <View style={styles.actionCardContent}>
          <Ionicons name="heart" size={28} color="#E8FF8B" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardTitle}>Dating Studio</Text>
            <Text style={styles.actionCardSub}>
              4 AI-generated profile photos — 5 credits
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(232,255,139,0.6)" />
      </TouchableOpacity>

      {/* View history card */}
      <TouchableOpacity
        style={[styles.actionCard, styles.cardOutline]}
        onPress={() => open('/history')}
        activeOpacity={0.85}
      >
        <View style={styles.actionCardContent}>
          <Ionicons name="time" size={28} color="#2D4A3E" />
          <View style={styles.actionCardText}>
            <Text style={[styles.actionCardTitle, { color: '#2D4A3E' }]}>
              History
            </Text>
            <Text style={[styles.actionCardSub, { color: 'rgba(45,74,62,0.55)' }]}>
              See all your past generations
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(45,74,62,0.3)" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F0E8' },
  content: { padding: 20, paddingBottom: 40 },
  hero: { marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#2D4A3E', marginBottom: 4 },
  tagline: { fontSize: 14, color: 'rgba(45,74,62,0.55)', lineHeight: 20 },
  creditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D4A3E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    gap: 12,
  },
  creditIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(232,255,139,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditLabel: { fontSize: 11, color: 'rgba(232,255,139,0.6)', fontWeight: '600', marginBottom: 2 },
  creditValue: { fontSize: 18, fontWeight: '800', color: '#E8FF8B' },
  buyBtn: {
    marginLeft: 'auto',
    backgroundColor: '#E8FF8B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  buyBtnText: { fontSize: 13, fontWeight: '700', color: '#2D4A3E' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(45,74,62,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardGreen: { backgroundColor: '#2D4A3E' },
  cardDark: { backgroundColor: '#1e3329' },
  cardOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(45,74,62,0.12)',
  },
  actionCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionCardText: { flex: 1 },
  actionCardTitle: { fontSize: 16, fontWeight: '700', color: '#E8FF8B', marginBottom: 2 },
  actionCardSub: { fontSize: 12, color: 'rgba(232,255,139,0.55)', lineHeight: 16 },
});

