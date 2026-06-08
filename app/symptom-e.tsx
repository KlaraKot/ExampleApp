'use no memo';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function SymptomEScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Content key={mountKey} />;
}

const FIELDS = [
  'First name',
  'Last name',
  'Email',
  'Phone',
  'Street',
  'City',
  'Postal code',
  'Country',
  'Card number',
  'Notes',
];

type FormState = Record<string, string>;
const EMPTY: FormState = Object.fromEntries(FIELDS.map((f) => [f, '']));

function Content() {
  const router = useRouter();
  // Optional: tweak the screen title to underline the symptom rather than the slug
  const nav = useNavigation();
  useEffect(() => {
    nav.setOptions({ title: 'Form feels laggy' });
  }, [nav]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [fps, setFps] = useState(60);

  const parentRenders = useRef(0);
  parentRenders.current += 1;

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
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Symptom: form feels laggy</Text>
        <Text style={styles.diagHint}>
          Start typing fast in any field. The form has 10 controlled inputs, all sharing one
          state object. Every keystroke triggers a re-render of the whole form — even the fields
          you aren&apos;t touching.
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Form re-renders</Text>
          <Text style={[styles.rowValue, { color: '#b00020' }]}>{parentRenders.current}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>FPS (JS thread)</Text>
          <View style={[styles.badge, { backgroundColor: fpsColor }]}>
            <Text style={styles.badgeText}>{fps}</Text>
          </View>
        </View>
      </View>

      <View style={styles.formCard}>
        {FIELDS.map((label) => (
          <TrackedField
            key={label}
            label={label}
            value={form[label]}
            onChange={(v) => setForm((cur) => ({ ...cur, [label]: v }))}
          />
        ))}
      </View>

      <Pressable style={styles.cta} onPress={() => router.push('/case-study-e')}>
        <Text style={styles.ctaText}>→ See the fix in Case Study E</Text>
      </Pressable>
    </ScrollView>
  );
}

function TrackedField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldRenders, renders.current > 1 && styles.fieldRendersWarn]}>
          r:{renders.current}
        </Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={label}
        autoCorrect={false}
        autoCapitalize="none"
      />
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
    fontWeight: '700',
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
  formCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 16,
  },
  field: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  fieldRenders: {
    fontSize: 10,
    color: '#888',
  },
  fieldRendersWarn: {
    color: '#b00020',
    fontWeight: '700',
  },
  input: {
    height: 36,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 13,
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
