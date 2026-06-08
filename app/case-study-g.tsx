'use no memo';

import { useFocusEffect } from '@react-navigation/native';
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function CaseStudyGScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <Demo key={mountKey} />;
}

function Demo() {
  const [stable, setStable] = useState(false);
  const [tick, setTick] = useState(0);

  // Drive a periodic re-render of the parent so we can watch which children
  // re-render along with it. This is a stand-in for "any state change up the
  // tree" — a route param, a global store, a timer, whatever.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>useMemo/useCallback: when it actually helps</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>
            Stabilize props with <Text style={{ fontWeight: '700' }}>useMemo/useCallback</Text>
          </Text>
          <Switch value={stable} onValueChange={setStable} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Parent tick (every 500ms)</Text>
          <Text style={styles.rowValue}>{tick}</Text>
        </View>
        <Text style={styles.diagHint}>
          Lint says &quot;add this to the deps array&quot;. People obey, then pass{' '}
          <Text style={styles.codeInline}>{'{ ...config }'}</Text> or a fresh arrow as a prop —
          and React.memo silently breaks because every render creates a new reference. Toggle to
          watch the same memoized child either re-render every tick (BAD) or stay still (GOOD).
        </Text>
      </View>

      <Section title="1. Defeating React.memo with inline references">
        <ParentMemoDemo tick={tick} stable={stable} />
      </Section>

      <Section title="2. Prop drilling vs context">
        <PropDrillingDemo tick={tick} stable={stable} />
      </Section>

      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{`// BAD — new object + new arrow every render
// Lint demanded "include config" in deps, so the effect
// now re-runs every render too.
const config = { theme: 'dark', limit: 10 };
useEffect(() => fetchThings(config), [config]);
<MemoChild config={config} onTap={() => log()} />

// GOOD — stable refs; deps stay primitive when possible
const config = useMemo(() => ({ theme, limit }), [theme, limit]);
const onTap = useCallback(() => log(), []);
useEffect(() => fetchThings(config), [config]);
<MemoChild config={config} onTap={onTap} />`}</Text>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 1. React.memo + inline object/arrow props
// ─────────────────────────────────────────────────────────────────────
function ParentMemoDemo({ tick, stable }: { tick: number; stable: boolean }) {
  // Stable variant — refs survive across renders
  const stableConfig = useMemo(() => ({ theme: 'dark', limit: 10 }), []);
  const stableOnTap = useCallback(() => {}, []);

  // Unstable variant — fresh object/function every render
  const inlineConfig = { theme: 'dark', limit: 10 };
  const inlineOnTap = () => {};

  return (
    <View style={styles.row2}>
      <View style={styles.col}>
        <View style={[styles.colHeader, styles.colHeaderBad]}>
          <Text style={styles.cardBadge}>BAD</Text>
          <Text style={styles.cardTitle}>inline {'{...}'}</Text>
        </View>
        <MemoChild label="config + onTap" config={inlineConfig} onTap={inlineOnTap} />
        <Text style={styles.parentTick}>parent tick: {tick}</Text>
      </View>

      <View style={styles.col}>
        <View style={[styles.colHeader, styles.colHeaderGood]}>
          <Text style={styles.cardBadge}>GOOD</Text>
          <Text style={styles.cardTitle}>{stable ? 'memoized refs' : 'tap toggle ↑'}</Text>
        </View>
        <MemoChild
          label="config + onTap"
          config={stable ? stableConfig : inlineConfig}
          onTap={stable ? stableOnTap : inlineOnTap}
        />
        <Text style={styles.parentTick}>parent tick: {tick}</Text>
      </View>
    </View>
  );
}

type ChildProps = {
  label: string;
  config: { theme: string; limit: number };
  onTap: () => void;
};

const MemoChild = memo(function MemoChild({ label }: ChildProps) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <View style={styles.child}>
      <Text style={styles.childLabel}>{label}</Text>
      <Text
        style={[styles.childRenders, renders.current > 3 && styles.warn]}>
        renders: {renders.current}
      </Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────
// 2. Prop drilling vs context (or composition)
// ─────────────────────────────────────────────────────────────────────

type User = { name: string; role: string };
const STATIC_USER: User = { name: 'Ada', role: 'admin' };

function PropDrillingDemo({ tick, stable }: { tick: number; stable: boolean }) {
  return (
    <View style={styles.row2}>
      <View style={styles.col}>
        <View style={[styles.colHeader, styles.colHeaderBad]}>
          <Text style={styles.cardBadge}>BAD</Text>
          <Text style={styles.cardTitle}>drill through 4 layers</Text>
        </View>
        <DrillLayer1 user={STATIC_USER} tick={tick} />
      </View>

      <View style={styles.col}>
        <View style={[styles.colHeader, styles.colHeaderGood]}>
          <Text style={styles.cardBadge}>GOOD</Text>
          <Text style={styles.cardTitle}>
            {stable ? 'context, leaf reads' : 'tap toggle ↑'}
          </Text>
        </View>
        {stable ? (
          <UserContext.Provider value={STATIC_USER}>
            <CtxLayer1 tick={tick} />
          </UserContext.Provider>
        ) : (
          <DrillLayer1 user={STATIC_USER} tick={tick} />
        )}
      </View>
    </View>
  );
}

function DrillLayer1({ user, tick }: { user: User; tick: number }) {
  return <DrillLayer2 user={user} tick={tick} />;
}
function DrillLayer2({ user, tick }: { user: User; tick: number }) {
  return <DrillLayer3 user={user} tick={tick} />;
}
function DrillLayer3({ user, tick }: { user: User; tick: number }) {
  return <DrillLeaf user={user} tick={tick} />;
}
function DrillLeaf({ user, tick }: { user: User; tick: number }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <View style={styles.child}>
      <Text style={styles.childLabel}>
        {user.name} · {user.role}
      </Text>
      <Text style={[styles.childRenders, styles.warn]}>renders: {renders.current}</Text>
      <Text style={styles.childMeta}>(re-runs whenever tick={tick} changes)</Text>
    </View>
  );
}

const UserContext = createContext<User>(STATIC_USER);

// Tick is passed to the wrapper to keep parity in the demo; the leaf only
// reads from context so its render count tracks context updates, not parent
// renders.
function CtxLayer1({ tick: _tick }: { tick: number }) {
  return <CtxLayer2 />;
}
const CtxLayer2 = memo(function CtxLayer2() {
  return <CtxLayer3 />;
});
const CtxLayer3 = memo(function CtxLayer3() {
  return <CtxLeaf />;
});
const CtxLeaf = memo(function CtxLeaf() {
  const user = useContext(UserContext);
  const renders = useRef(0);
  renders.current += 1;
  return (
    <View style={styles.child}>
      <Text style={styles.childLabel}>
        {user.name} · {user.role}
      </Text>
      <Text style={styles.childRenders}>renders: {renders.current}</Text>
      <Text style={styles.childMeta}>(only re-runs when user actually changes)</Text>
    </View>
  );
});

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
  codeInline: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: '#222',
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    color: '#333',
  },
  row2: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  colHeader: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colHeaderBad: {
    backgroundColor: '#ffe5e5',
  },
  colHeaderGood: {
    backgroundColor: '#e1f4e6',
  },
  cardBadge: {
    fontWeight: '800',
    fontSize: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    color: '#fff',
    backgroundColor: '#444',
    borderRadius: 4,
  },
  cardTitle: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 10,
    color: '#222',
    flexShrink: 1,
  },
  child: {
    padding: 10,
  },
  childLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  childRenders: {
    fontSize: 11,
    color: '#444',
  },
  childMeta: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  warn: {
    color: '#b00020',
    fontWeight: '700',
  },
  parentTick: {
    fontSize: 10,
    color: '#888',
    paddingHorizontal: 10,
    paddingBottom: 8,
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
