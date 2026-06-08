import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function CaseStudyHScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Demo key={mountKey} />;
}

const IMAGE_IDS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

// Same source, different sizes. The BAD case asks the server for a
// 2000×2000 jpeg and then squeezes it into a ~110px tile — the device pays
// to download, decode, and resize every byte. The GOOD case asks for the
// exact size it needs.
const BAD_SIZE = 2000;
const GOOD_SIZE = 200;

const BLURHASH = 'L6PZfSjE.AyE_3t7t7R**0o#DgR4';

function srcFor(id: number, size: number) {
  return `https://picsum.photos/id/${id}/${size}/${size}`;
}

function Demo() {
  const [optimized, setOptimized] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const startRef = useRef(Date.now());

  // Reset timers when toggling — start the clock at first paint of the new
  // image set so we measure "render → all images visible" honestly.
  useEffect(() => {
    startRef.current = Date.now();
    setLoaded(0);
    setElapsed(null);
  }, [optimized]);

  const onLoaded = useCallback(() => {
    setLoaded((n) => {
      const next = n + 1;
      if (next === IMAGE_IDS.length) {
        setElapsed(Date.now() - startRef.current);
      }
      return next;
    });
  }, []);

  const approxBytesPerImage = optimized ? GOOD_SIZE * GOOD_SIZE * 3 : BAD_SIZE * BAD_SIZE * 3;
  const approxMB = ((approxBytesPerImage * IMAGE_IDS.length) / (1024 * 1024)).toFixed(1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Image loading: size, placeholder, caching</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>
            Use <Text style={{ fontWeight: '700' }}>optimized</Text> images
          </Text>
          <Switch value={optimized} onValueChange={setOptimized} />
        </View>
        <Row
          label="Requested size"
          value={`${optimized ? GOOD_SIZE : BAD_SIZE}×${optimized ? GOOD_SIZE : BAD_SIZE}`}
          warn={!optimized}
        />
        <Row
          label="Approx. payload (uncompressed)"
          value={`~${approxMB} MB`}
          warn={!optimized}
        />
        <Row label="Placeholder" value={optimized ? 'blurhash' : 'none'} warn={!optimized} />
        <Row label="Cache policy" value={optimized ? 'memory-disk' : 'none'} warn={!optimized} />
        <Row
          label="Images loaded"
          value={`${loaded} / ${IMAGE_IDS.length}`}
        />
        <Row
          label="Time to all visible"
          value={elapsed != null ? `${elapsed}ms` : 'measuring…'}
          warn={(elapsed ?? 0) > 1500}
        />
        <Text style={styles.diagHint}>
          BAD ships a 4MP jpeg for every ~110px tile — bandwidth, RAM, and decode time wasted on
          pixels the user will never see. GOOD asks the CDN for the rendered size, shows a
          blurhash placeholder so the slot is never empty, and caches to disk so the next view is
          instant.
        </Text>
      </View>

      <View style={styles.gridWrapper}>
        <View style={[styles.gridHeader, optimized ? styles.gridHeaderGood : styles.gridHeaderBad]}>
          <Text style={styles.cardBadge}>{optimized ? 'GOOD' : 'BAD'}</Text>
          <Text style={styles.cardTitle}>
            {optimized
              ? `${GOOD_SIZE}px · blurhash · disk cache`
              : `${BAD_SIZE}px · no placeholder · no cache`}
          </Text>
        </View>
        <View style={styles.grid}>
          {IMAGE_IDS.map((id) => (
            <View key={`${optimized ? 'g' : 'b'}-${id}`} style={styles.cell}>
              <Image
                source={{ uri: srcFor(id, optimized ? GOOD_SIZE : BAD_SIZE) }}
                style={styles.thumb}
                contentFit="cover"
                placeholder={optimized ? { blurhash: BLURHASH } : undefined}
                cachePolicy={optimized ? 'memory-disk' : 'none'}
                onLoad={onLoaded}
                onError={onLoaded}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{`// BAD — full-resolution, no placeholder, no cache
<Image
  source={{ uri: 'https://cdn/.../photo.jpg' }}     // 4000×3000 jpeg
  style={{ width: 110, height: 110 }}               // shown at 110px
/>

// GOOD — request the size you'll display, show
// a blurhash while loading, cache to disk
<Image
  source={{ uri: 'https://cdn/.../photo.jpg?w=200' }}
  style={{ width: 110, height: 110 }}
  contentFit="cover"
  placeholder={{ blurhash }}
  cachePolicy="memory-disk"
/>`}</Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, warn && { color: '#b00020' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  diagPanel: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  diagTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  diagHint: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  gridWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 14,
  },
  gridHeader: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridHeaderBad: {
    backgroundColor: '#ffe5e5',
  },
  gridHeaderGood: {
    backgroundColor: '#e1f4e6',
  },
  cardBadge: {
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: '#fff',
    backgroundColor: '#444',
    borderRadius: 4,
  },
  cardTitle: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: '#222',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fafafa',
    padding: 6,
  },
  cell: {
    width: '25%',
    aspectRatio: 1,
    padding: 4,
  },
  thumb: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    color: '#dcdcdc',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    lineHeight: 16,
  },
});
