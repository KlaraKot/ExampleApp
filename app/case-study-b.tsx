import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Button,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

type Item = { id: string; text: string };

export default function CaseStudyBScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <ListDemo key={mountKey} />;
}

function ListDemo() {
  const [items, setItems] = useState<Item[]>(() => [
    { id: 'a', text: 'Apple' },
    { id: 'b', text: 'Banana' },
    { id: 'c', text: 'Cherry' },
  ]);
  const [useIndexKey, setUseIndexKey] = useState(true);
  const idRef = useRef(items.length);

  const animateNext = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const addAtTop = () => {
    animateNext();
    idRef.current += 1;
    setItems((cur) => [
      { id: `id-${idRef.current}`, text: `New top #${idRef.current}` },
      ...cur,
    ]);
  };

  const addAtBottom = () => {
    animateNext();
    idRef.current += 1;
    setItems((cur) => [
      ...cur,
      { id: `id-${idRef.current}`, text: `New bottom #${idRef.current}` },
    ]);
  };

  const removeFirst = () => {
    animateNext();
    setItems((cur) => cur.slice(1));
  };

  const shuffle = () => {
    animateNext();
    setItems((cur) => {
      const next = [...cur];
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>List key strategy</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>
            Use{' '}
            <Text style={{ fontWeight: '700' }}>index</Text> as key (BAD)
          </Text>
          <Switch value={useIndexKey} onValueChange={setUseIndexKey} />
        </View>
        <Text style={styles.diagHint}>
          Every list item picks a random color when it mounts. With{' '}
          <Text style={{ fontWeight: '700' }}>index keys</Text>, colors stay glued to positions
          while texts shift around — proof that React lost item identity. Switch the toggle off to
          use stable id keys and watch colors travel with their items.
        </Text>
      </View>

      <View style={styles.controls}>
        <Button title="Add top" onPress={addAtTop} />
        <Button title="Add bottom" onPress={addAtBottom} />
        <Button title="Remove first" onPress={removeFirst} />
        <Button title="Shuffle" onPress={shuffle} />
      </View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <ListItem
            key={useIndexKey ? index : item.id}
            title={item.text}
          />
        ))}
      </View>

      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{`{items.map((item, index) => (
  <ListItem key={index} title={item.text} />
))}`}</Text>
      </View>
    </ScrollView>
  );
}

function ListItem({ title }: { title: string }) {
  const [color] = useState(randomColor);
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <View style={styles.listItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.listText}>{title}</Text>
        <Text style={styles.listMeta}>renders: {renderCount.current}</Text>
      </View>
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
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  list: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  listText: {
    fontSize: 15,
    fontWeight: '500',
  },
  listMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    color: '#dcdcdc',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
  },
});
