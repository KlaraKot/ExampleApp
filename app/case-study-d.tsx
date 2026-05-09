import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

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

const ITEMS = Array.from({ length: 80 }, (_, i) => ({
  id: `i-${i}`,
  color: COLORS[i % COLORS.length],
  text: `Block #${i + 1}`,
}));

export default function CaseStudyDScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Demo key={mountKey} />;
}

function Demo() {
  const [useStateMode, setUseStateMode] = useState(true);
  return useStateMode ? (
    <TrackingComponent onModeToggle={setUseStateMode} useStateMode={useStateMode} />
  ) : (
    <GoodTrackingComponent onModeToggle={setUseStateMode} useStateMode={useStateMode} />
  );
}

type ModeProps = {
  onModeToggle: (val: boolean) => void;
  useStateMode: boolean;
};

// ─────────────────────────────────────────────────────────────────────
// BAD PATTERN: useState on every scroll event → re-render every frame
// ─────────────────────────────────────────────────────────────────────
const TrackingComponent = ({ onModeToggle, useStateMode }: ModeProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const renderCount = useRef(0);
  renderCount.current += 1;

  const [fps, setFps] = useState(60);
  useEffect(() => {
    let frames = 0;
    let lastTime = Date.now();
    let raf: number;
    const loop = () => {
      frames += 1;
      const now = Date.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
        setScrollPosition(e.nativeEvent.contentOffset.y)
      }
      scrollEventThrottle={16}>
      <DiagnosticsPanel
        useStateMode={useStateMode}
        onModeToggle={onModeToggle}
        renderCount={renderCount.current}
        fps={fps}
        scrollY={Math.round(scrollPosition)}
      />
      <Text style={styles.bigPosition}>Offset: {Math.round(scrollPosition)}</Text>
      <BlockList />
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────────
// GOOD PATTERN: useRef stores scroll value, no re-render on scroll
// Display value is polled at 4 Hz from the ref → tiny render rate
// ─────────────────────────────────────────────────────────────────────
function GoodTrackingComponent({ onModeToggle, useStateMode }: ModeProps) {
  const scrollRef = useRef(0);
  const [displayY, setDisplayY] = useState(0);

  const renderCount = useRef(0);
  renderCount.current += 1;

  const [fps, setFps] = useState(60);
  useEffect(() => {
    let frames = 0;
    let lastTime = Date.now();
    let raf: number;
    const loop = () => {
      frames += 1;
      const now = Date.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplayY(Math.round(scrollRef.current));
    }, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollRef.current = e.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}>
      <DiagnosticsPanel
        useStateMode={useStateMode}
        onModeToggle={onModeToggle}
        renderCount={renderCount.current}
        fps={fps}
        scrollY={displayY}
      />
      <Text style={styles.bigPosition}>Offset: {displayY}</Text>
      <BlockList />
    </ScrollView>
  );
}

function DiagnosticsPanel({
  useStateMode,
  onModeToggle,
  renderCount,
  fps,
  scrollY,
}: {
  useStateMode: boolean;
  onModeToggle: (val: boolean) => void;
  renderCount: number;
  fps: number;
  scrollY: number;
}) {
  const fpsColor = fps >= 50 ? '#1b8a4a' : fps >= 25 ? '#c98600' : '#b00020';
  return (
    <View style={styles.diagPanel}>
      <Text style={styles.diagTitle}>State vs Refs</Text>
      <View style={styles.switchRow}>
        <Text style={styles.rowLabel}>
          Use <Text style={{ fontWeight: '700' }}>useState</Text> for scroll (BAD)
        </Text>
        <Switch value={useStateMode} onValueChange={onModeToggle} />
      </View>
      <Row label="Component render count" value={String(renderCount)} warn={useStateMode} />
      <View style={styles.row}>
        <Text style={styles.rowLabel}>FPS (JS thread)</Text>
        <View style={[styles.badge, { backgroundColor: fpsColor }]}>
          <Text style={styles.badgeText}>{fps}</Text>
        </View>
      </View>
      <Row label="Current Y" value={String(scrollY)} />
      <Text style={styles.diagHint}>
        Scroll fires ~60 events/sec. With useState, each event triggers a full component re-render.
        With useRef + a small polled display state, scroll updates are free for the JS thread.
      </Text>
    </View>
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

function BlockList() {
  return (
    <View style={{ marginTop: 16 }}>
      {ITEMS.map((item) => (
        <View
          key={item.id}
          style={[styles.block, { backgroundColor: item.color }]}>
          <Text style={styles.blockText}>{item.text}</Text>
        </View>
      ))}
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
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  bigPosition: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  block: {
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 8,
  },
  blockText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
