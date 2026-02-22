import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/expo';
import { Link } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const COL = 2;
const GAP = 10;
const SIZE = (Dimensions.get('window').width - 20 * 2 - GAP) / COL;

type Generation = {
  id: string;
  originalImageUrl: string;
  generatedImageUrls: string[];
  status: string;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    completed: { bg: '#D1FAE5', text: '#065F46' },
    processing: { bg: '#FEF3C7', text: '#92400E' },
    pending: { bg: '#E5E7EB', text: '#374151' },
    failed: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
    </View>
  );
}

export default function GalleryScreen() {
  const { getToken } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGenerations = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/mobile/generations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGenerations(data.generations ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2D4A3E" />
      </View>
    );
  }

  if (generations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyTitle}>No photos yet</Text>
        <Text style={styles.emptySub}>
          Generate your first enhanced photo to see it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={generations}
      keyExtractor={(item) => item.id}
      numColumns={COL}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={{ gap: GAP }}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchGenerations(true)}
          tintColor="#2D4A3E"
        />
      }
      renderItem={({ item }) => {
        const thumb =
          item.generatedImageUrls?.[0] ?? item.originalImageUrl;
        return (
          <View style={[styles.card, { width: SIZE }]}>
            <Image
              source={{ uri: thumb }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.cardFooter}>
              <StatusBadge status={item.status} />
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D4A3E',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(45,74,62,0.55)',
    textAlign: 'center',
    lineHeight: 18,
  },
  grid: {
    padding: 20,
    backgroundColor: '#F5F0E8',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E0D8',
  },
  image: { width: '100%', height: SIZE, borderRadius: 14 },
  cardFooter: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});
