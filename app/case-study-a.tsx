'use no memo';

import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function CaseStudyAScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Demo key={mountKey} />;
}

function Demo() {
  const [count, setCount] = useState(0);
  const [useStable, setUseStable] = useState(false);

  const stableHandler = useCallback(() => {
    console.log('child tapped');
  }, []);

  const handler = useStable
    ? stableHandler
    : () => console.log('child tapped');

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Parent count: {count}</Text>

      <Button title="+1" onPress={() => setCount((c) => c + 1)} />

      <View style={{ height: 12 }} />

      <Button
        title={useStable ? 'Switch to BAD (inline)' : 'Switch to GOOD (useCallback)'}
        onPress={() => setUseStable((v) => !v)}
      />

      <Text style={styles.mode}>
        Mode: <Text style={{ fontWeight: '700' }}>{useStable ? 'GOOD' : 'BAD'}</Text>
      </Text>

      <MemoChild onTap={handler} />
    </View>
  );
}

const MemoChild = memo(function MemoChild({ onTap }: { onTap: () => void }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <View style={styles.child}>
      <Text style={styles.childTitle}>MemoChild</Text>
      <Text style={styles.childRenders}>renders: {renderCount.current}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: '#fff',
  },
  counter: {
    fontSize: 18,
    fontWeight: '600',
  },
  mode: {
    fontSize: 14,
    marginTop: 8,
  },
  child: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  childTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  childRenders: {
    fontSize: 14,
    marginTop: 6,
    color: '#444',
  },
});
