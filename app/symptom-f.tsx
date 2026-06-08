import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function SymptomFScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Content key={mountKey} />;
}

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

// Lots of simultaneous animations on layout props amplify the symptom: every
// frame a layout pass has to re-measure every cell in the grid.
const BOXES = Array.from({ length: 64 }, (_, i) => ({
  id: `b-${i}`,
  color: COLORS[i % COLORS.length],
}));

function Content() {
  const router = useRouter();
  const nav = useNavigation();
  useEffect(() => {
    nav.setOptions({ title: 'Animation stutters' });
  }, [nav]);

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

  const fpsColor = fps >= 50 ? '#1b8a4a' : fps >= 25 ? '#c98600' : '#b00020';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Symptom: animation stutters</Text>
        <Text style={styles.diagHint}>
          The grid below has 64 boxes pulsing at once. The animation should be smooth, but the
          frame rate sags and motion feels gluey — especially while you scroll.
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>FPS (JS thread)</Text>
          <View style={[styles.badge, { backgroundColor: fpsColor }]}>
            <Text style={styles.badgeText}>{fps}</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {BOXES.map((b) => (
          <LayoutBox key={b.id} color={b.color} />
        ))}
      </View>

      <Pressable style={styles.cta} onPress={() => router.push('/case-study-f')}>
        <Text style={styles.ctaText}>→ See the fix in Case Study F</Text>
      </Pressable>
    </ScrollView>
  );
}

function LayoutBox({ color }: { color: string }) {
  const size = useSharedValue(20);

  useEffect(() => {
    size.value = withRepeat(
      withTiming(40, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [size]);

  const animStyle = useAnimatedStyle(() => ({
    width: size.value,
    height: size.value,
  }));

  return (
    <View style={styles.cell}>
      <Animated.View style={[styles.box, { backgroundColor: color }, animStyle]} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
    marginBottom: 16,
  },
  cell: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderRadius: 6,
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
