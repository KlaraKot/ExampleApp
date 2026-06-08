import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SymptomHScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Content key={mountKey} />;
}

const IMAGE_IDS = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
];

// 2000x2000 jpegs for ~110px tiles. Servers, networks, decoders all
// punished simultaneously.
const BAD_SIZE = 2000;

function srcFor(id: number) {
  return `https://picsum.photos/id/${id}/${BAD_SIZE}/${BAD_SIZE}`;
}

function Content() {
  const router = useRouter();
  const nav = useNavigation();
  useEffect(() => {
    nav.setOptions({ title: 'Gallery hangs' });
  }, [nav]);

  const [loaded, setLoaded] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const startRef = useRef(Date.now());

  const onLoaded = useCallback(() => {
    setLoaded((n) => {
      const next = n + 1;
      if (next === IMAGE_IDS.length) {
        setElapsed(Date.now() - startRef.current);
      }
      return next;
    });
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Symptom: gallery hangs, tiles stay empty</Text>
        <Text style={styles.diagHint}>
          18 photos, each requested at 2000×2000 even though they&apos;re displayed as ~110px
          thumbnails. No placeholders, no caching. Slots stay grey, scroll feels rough, RAM
          spikes.
        </Text>
        <Row label="Loaded" value={`${loaded} / ${IMAGE_IDS.length}`} />
        <Row
          label="Time to all visible"
          value={elapsed != null ? `${elapsed}ms` : 'still loading…'}
          warn={(elapsed ?? 0) > 1500 || elapsed == null}
        />
        <Row label="Requested size" value={`${BAD_SIZE}×${BAD_SIZE}`} warn />
      </View>

      <View style={styles.grid}>
        {IMAGE_IDS.map((id) => (
          <View key={id} style={styles.cell}>
            <Image
              source={{ uri: srcFor(id) }}
              style={styles.thumb}
              contentFit="cover"
              cachePolicy="none"
              onLoad={onLoaded}
              onError={onLoaded}
            />
          </View>
        ))}
      </View>

      <Pressable style={styles.cta} onPress={() => router.push('/case-study-h')}>
        <Text style={styles.ctaText}>→ See the fix in Case Study H</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, warn && { color: '#b00020', fontWeight: '700' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  diagPanel: {
    backgroundColor: '#ffe5e5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  diagTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#b00020',
    marginBottom: 4,
  },
  diagHint: {
    fontSize: 12,
    color: '#6b1119',
    lineHeight: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 6,
    marginBottom: 16,
  },
  cell: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  thumb: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cta: {
    backgroundColor: '#1b8a4a',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
