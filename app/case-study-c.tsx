import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

type Item = { id: string; text: string; subtitle: string };

const TOTAL_ITEMS = 1000;

const ITEMS: Item[] = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: `item-${i}`,
  text: `Item #${i + 1}`,
  subtitle: `Description for item number ${i + 1} — verbose enough to take vertical space.`,
}));

const COLORS = [
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#9B5DE5',
  '#F15BB5',
  '#00BBF9',
  '#FB6F92',
];

function getColor(seed: number) {
  return COLORS[Math.abs(seed) % COLORS.length];
}

export default function CaseStudyCScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <ListDemo key={mountKey} />;
}

function ListDemo() {
  const [useScrollView, setUseScrollView] = useState(true);
  const [mountTime, setMountTime] = useState<number | null>(null);
  const renderStart = useRef(Date.now());

  // Capture time from render-start to first commit. With ScrollView this
  // includes mounting all 1000 components; with FlatList only ~10–15.
  useEffect(() => {
    setMountTime(Date.now() - renderStart.current);
  }, [useScrollView]);

  const handleToggle = (val: boolean) => {
    renderStart.current = Date.now();
    setMountTime(null);
    setUseScrollView(val);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <View style={styles.diagPanel}>
          <Text style={styles.diagTitle}>List rendering strategy</Text>

          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>
              Use <Text style={{ fontWeight: '700' }}>ScrollView</Text> (BAD)
            </Text>
            <Switch value={useScrollView} onValueChange={handleToggle} />
          </View>

          <Row label="Items in data" value={String(TOTAL_ITEMS)} />
          <Row
            label="Items mounted at once"
            value={useScrollView ? `${TOTAL_ITEMS} (all)` : '~10–15 (virtualized)'}
            warn={useScrollView}
          />
          <Row
            label="Initial mount took"
            value={mountTime != null ? `${mountTime}ms` : 'measuring…'}
            warn={(mountTime ?? 0) > 200}
          />

          <Text style={styles.diagHint}>
            ScrollView mounts every child at once — even off-screen ones. That bloats memory and
            stalls startup. FlatList only mounts items near the viewport (windowing) and recycles
            views as you scroll.
          </Text>
        </View>
      </View>

      {useScrollView ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {ITEMS.map((item, idx) => (
            <HeavyComponent key={item.id} item={item} index={idx} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={ITEMS}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <HeavyComponent item={item} index={index} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          initialNumToRender={12}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

const HeavyComponent = memo(function HeavyComponent({
  item,
  index,
}: {
  item: Item;
  index: number;
}) {
  const color = getColor(index);
  return (
    <View style={[styles.itemCard, { borderLeftColor: color }]}>
      <View style={[styles.itemDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.text}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
      </View>
      <View style={[styles.itemBadge, { backgroundColor: color }]}>
        <Text style={styles.itemBadgeText}>#{index}</Text>
      </View>
    </View>
  );
});

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
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderLeftWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 12,
  },
  itemDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  itemBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
});
