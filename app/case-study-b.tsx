import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Button,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
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
type ColorMap = React.MutableRefObject<Record<string, string>>;

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
  const idRef = useRef(items.length);

  // Stable color per item.id, shared by both lists so initial render is
  // visually aligned. Both lists' ListItems read this map at mount.
  const colorMapRef = useRef<Record<string, string>>(
    Object.fromEntries(
      [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
      ].map((it) => [it.id, randomColor()])
    )
  );

  const ensureColor = (id: string) => {
    if (!colorMapRef.current[id]) {
      colorMapRef.current[id] = randomColor();
    }
  };

  const animateNext = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const addAtTop = () => {
    animateNext();
    idRef.current += 1;
    const id = `id-${idRef.current}`;
    ensureColor(id);
    setItems((cur) => [{ id, text: `New top #${idRef.current}` }, ...cur]);
  };

  const addAtBottom = () => {
    animateNext();
    idRef.current += 1;
    const id = `id-${idRef.current}`;
    ensureColor(id);
    setItems((cur) => [...cur, { id, text: `New bottom #${idRef.current}` }]);
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
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>List key strategy: side by side</Text>
        <Text style={styles.diagHint}>
          Both lists render the <Text style={styles.bold}>same items</Text>. The left column
          uses <Text style={styles.codeInline}>key={'{index}'}</Text> (BAD), the right uses{' '}
          <Text style={styles.codeInline}>key={'{item.id}'}</Text> (GOOD). Every item picks a
          random color when its instance mounts. Click any control below — watch how colors
          stay glued to <Text style={styles.bold}>positions</Text> on the BAD side and travel
          with <Text style={styles.bold}>items</Text> on the GOOD side.
        </Text>
      </View>

      <View style={styles.controls}>
        <Button title="Add top" onPress={addAtTop} />
        <Button title="Add bottom" onPress={addAtBottom} />
        <Button title="Remove first" onPress={removeFirst} />
        <Button title="Shuffle" onPress={shuffle} />
      </View>

      <View style={styles.columns}>
        <View style={styles.column}>
          <View style={styles.columnHeaderBad}>
            <Text style={styles.columnBadge}>BAD</Text>
            <Text style={styles.columnTitle}>key={'{index}'}</Text>
          </View>
          <View style={styles.list}>
            {items.map((item, index) => (
              <ListItemBad
                key={index}
                id={item.id}
                title={item.text}
                colorMap={colorMapRef}
              />
            ))}
          </View>
        </View>

        <View style={styles.column}>
          <View style={styles.columnHeaderGood}>
            <Text style={styles.columnBadge}>GOOD</Text>
            <Text style={styles.columnTitle}>key={'{item.id}'}</Text>
          </View>
          <View style={styles.list}>
            {items.map((item) => (
              <ListItemGood
                key={item.id}
                id={item.id}
                title={item.text}
                colorMap={colorMapRef}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{`// Same items, two key strategies
items.map((item, index) => (
  <ListItemBad  key={index}   title={item.text} />  // BAD
))
items.map((item) => (
  <ListItemGood key={item.id} title={item.text} />  // GOOD
))`}</Text>
      </View>
    </ScrollView>
  );
}

// Two distinct components so they show up as separate entries in the React
// Profiler / fiber tree. Implementation is identical except for the console
// tag — the difference between BAD and GOOD lives entirely in the parent's
// `key={...}` prop, not in the child component itself.
type ListItemProps = {
  id: string;
  title: string;
  colorMap: ColorMap;
};

function ListItemBad({ id, title, colorMap }: ListItemProps) {
  const [color] = useState(() => {
    if (!colorMap.current[id]) {
      colorMap.current[id] = randomColor();
    }
    return colorMap.current[id];
  });
  const renderCount = useRef(0);
  renderCount.current += 1;

  // useEffect(() => {
  //   console.log(`[BAD] MOUNT   color=${color}`);
  //   return () => {
  //     console.log(`[BAD] UNMOUNT color=${color}`);
  //   };
  // }, [color]);

  return (
    <View style={styles.listItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.listText} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.listMeta}>r:{renderCount.current}</Text>
      </View>
    </View>
  );
}

function ListItemGood({ id, title, colorMap }: ListItemProps) {
  const [color] = useState(() => {
    if (!colorMap.current[id]) {
      colorMap.current[id] = randomColor();
    }
    return colorMap.current[id];
  });
  const renderCount = useRef(0);
  renderCount.current += 1;

  // useEffect(() => {
  //   console.log(`[GOOD] MOUNT   color=${color}`);
  //   return () => {
  //     console.log(`[GOOD] UNMOUNT color=${color}`);
  //   };
  // }, [color]);

  return (
    <View style={styles.listItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.listText} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.listMeta}>r:{renderCount.current}</Text>
      </View>
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
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
  },
  codeInline: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: '#222',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  columns: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  column: {
    flex: 1,
  },
  columnHeaderBad: {
    backgroundColor: '#ffe5e5',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnHeaderGood: {
    backgroundColor: '#e1f4e6',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnBadge: {
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: '#fff',
    backgroundColor: '#444',
    borderRadius: 4,
  },
  columnTitle: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: '#222',
  },
  list: {
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  listText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listMeta: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
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
