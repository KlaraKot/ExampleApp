import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CaseStudyAScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <UserList key={mountKey} />;
}

const UserList = () => {
  const [count, setCount] = useState(0);

  const parentRenderCount = useRef(0);
  parentRenderCount.current += 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Re-render diagnostics</Text>
        <Row label="Parent renders" value={String(parentRenderCount.current)} />
        <Row label="Counter value" value={String(count)} />
        <Text style={styles.diagHint}>
          Tap "tap!" — watch the ExpensiveList re-render counter grow even though the
          component is wrapped in React.memo.
        </Text>
      </View>

      <View>
        <Button title="tap!" onPress={() => setCount(count + 1)} />
        <ExpensiveList onItemPress={() => console.log('tap!')} />
      </View>
    </ScrollView>
  );
};

type ExpensiveListProps = {
  onItemPress: () => void;
};

const ExpensiveList = memo(function ExpensiveList({ onItemPress }: ExpensiveListProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Simulate expensive rendering work to make the unnecessary re-render
  // visible as actual lag, not just a number.
  const start = Date.now();
  while (Date.now() - start < 60) {
    // block JS thread for 60ms each render
  }

  return (
    <View style={{ marginTop: 16 }}>
      <View style={styles.warningBanner}>
        <Text style={styles.warningTitle}>
          ExpensiveList re-rendered! (count: {renderCount.current})
        </Text>
        <Text style={styles.warningBody}>
          Despite being wrapped in React.memo, this component re-renders on every parent render
          because <Text style={{ fontWeight: '700' }}>onItemPress</Text> is a new function reference
          each time. Fix: wrap the handler with{' '}
          <Text style={{ fontWeight: '700' }}>useCallback</Text>.
        </Text>
      </View>

      <View style={styles.list}>
        {[...Array(3)].map((_, i) => (
          <Pressable
            key={i}
            onPress={onItemPress}
            style={({ pressed }) => [
              styles.listItem,
              { backgroundColor: pressed ? '#f0f0f0' : '#fff' },
              i === 3 && { borderBottomWidth: 0 },
            ]}>
            <Text>Item #{i}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  diagPanel: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
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
    marginTop: 4,
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
  warningBanner: {
    backgroundColor: '#ffe5e5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningTitle: {
    color: '#b00020',
    fontWeight: '700',
    marginBottom: 4,
  },
  warningBody: {
    color: '#b00020',
    fontSize: 12,
  },
  list: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
