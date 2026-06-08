'use no memo';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SymptomGScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Content key={mountKey} />;
}

const SECTIONS = [
  'Header',
  'Sidebar',
  'Search',
  'Filters',
  'Toolbar',
  'Main content',
  'Sidebar (right)',
  'Comments',
  'Activity log',
  'Footer',
];

function Content() {
  const router = useRouter();
  const nav = useNavigation();
  useEffect(() => {
    nav.setOptions({ title: 'Everything re-renders' });
  }, [nav]);

  const [tick, setTick] = useState(0);
  const [fps, setFps] = useState(60);

  // A single innocuous piece of state ticks every 250ms — simulating a
  // route param, store update, or timer somewhere up the tree. Notice that
  // none of the sections care about `tick`, yet they all re-render.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, []);

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

  // Inline config + arrow handler. Every render of <Content> creates fresh
  // references, which busts every memoized child below — even though none of
  // the section data actually changed.
  const config = { theme: 'dark', limit: 10 };
  const onTap = () => {};

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Symptom: everything re-renders</Text>
        <Text style={styles.diagHint}>
          A single timer ticks at the top of the tree. None of the sections below depend on it —
          yet every render counter climbs in lockstep. That&apos;s wasted CPU on every frame.
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Parent tick</Text>
          <Text style={styles.rowValue}>{tick}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>FPS (JS thread)</Text>
          <View style={[styles.badge, { backgroundColor: fpsColor }]}>
            <Text style={styles.badgeText}>{fps}</Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {SECTIONS.map((name) => (
          <Section key={name} name={name} config={config} onTap={onTap} />
        ))}
      </View>

      <Pressable style={styles.cta} onPress={() => router.push('/case-study-g')}>
        <Text style={styles.ctaText}>→ See the fix in Case Study G</Text>
      </Pressable>
    </ScrollView>
  );
}

type SectionProps = {
  name: string;
  config: { theme: string; limit: number };
  onTap: () => void;
};

// React.memo here is a red herring — referential equality fails because the
// parent hands us a fresh `config` object and a fresh `onTap` arrow every
// render. The audience can see it: counters climb anyway.
const Section = React.memo(function Section({ name }: SectionProps) {
  const renders = useRef(0);
  renders.current += 1;

  // A tiny synchronous cost per render so the audience feels the symptom on
  // the FPS counter, not just on the per-row r: numbers.
  burnMs(2);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionName}>{name}</Text>
      <Text style={[styles.sectionRenders, renders.current > 3 && styles.warn]}>
        renders: {renders.current}
      </Text>
    </View>
  );
});

function burnMs(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // intentional spin to put load on the JS thread
  }
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
  list: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 16,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  sectionRenders: {
    fontSize: 12,
    color: '#444',
  },
  warn: {
    color: '#b00020',
    fontWeight: '700',
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
