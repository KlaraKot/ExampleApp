import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function CaseStudyFScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, []),
  );

  return <Demo key={mountKey} />;
}

const COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#9B5DE5",
  "#F15BB5",
  "#00BBF9",
  "#FB6F92",
];

// Pile up enough boxes so the layout pass is genuinely expensive on the UI
// thread. With flex-wrap on the parent, every width change in any child
// forces the wrap engine to redistribute its siblings — that's the actual
// cost we want to expose.
const BOXES = Array.from({ length: 100 }, (_, i) => ({
  id: `box-${i}`,
  color: COLORS[i % COLORS.length],
}));

function Demo() {
  const [useLayoutMode, setUseLayoutMode] = useState(true);
  const [jsFps, setJsFps] = useState(60);
  const [uiFps, setUiFps] = useState(60);

  // UI-thread FPS via Reanimated's frame callback. Counts ticks of the UI
  // thread itself — when layout work backs up the UI thread, this drops
  // even though the JS-thread FPS counter stays at 60.
  const uiFpsShared = useSharedValue(60);
  const uiFrameCount = useSharedValue(0);
  const uiLastSecond = useSharedValue(0);
  const dep1 = () => "xd",
    dep2 = () => "xd",
    dep3 = () => "xd";
  useFrameCallback((info) => {
    "worklet";
    uiFrameCount.value += 1;
    if (uiLastSecond.value === 0) {
      uiLastSecond.value = info.timestamp;
      return;
    }
    if (info.timestamp - uiLastSecond.value >= 1000) {
      uiFpsShared.value = uiFrameCount.value;
      uiFrameCount.value = 0;
      uiLastSecond.value = info.timestamp;
    }
  });

  const label = useMemo(() => {
    console.log("LABEL CHANGED");
  }, [dep1, dep2, dep3]);

  // JS-thread FPS via rAF — included for contrast. It barely moves; that's
  // the whole point.
  useEffect(() => {
    let frames = 0;
    let lastTime = Date.now();
    let raf: number;
    const loop = () => {
      frames += 1;
      const now = Date.now();
      if (now - lastTime >= 1000) {
        setJsFps(frames);
        frames = 0;
        lastTime = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Poll the UI-thread shared value into React state every 500ms so the
  // panel updates without us touching the UI thread every render.
  useEffect(() => {
    const id = setInterval(() => {
      setUiFps(uiFpsShared.value);
    }, 500);
    return () => clearInterval(id);
  }, [uiFpsShared]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>
          Reanimated: width/height vs transform
        </Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>
            Animate <Text style={{ fontWeight: "700" }}>width/height</Text>{" "}
            (BAD)
          </Text>
          <Switch value={useLayoutMode} onValueChange={setUseLayoutMode} />
        </View>
        <FpsRow label="UI-thread FPS" value={uiFps} primary />
        <FpsRow label="JS-thread FPS" value={jsFps} />
        <Text style={styles.diagHint}>
          Reanimated runs the animation on the{" "}
          <Text style={styles.bold}>UI thread</Text>, so the JS-thread counter
          never moves — the real cost lives on the UI thread. width/height are{" "}
          <Text style={styles.bold}>layout</Text> properties: every frame, Yoga
          re-measures the flex-wrap parent and all 200 siblings have to be
          repositioned. Transforms skip layout entirely and the GPU just
          composites the scaled view.
        </Text>
      </View>

      <View style={styles.gridWrapper}>
        <View
          style={[
            styles.gridHeader,
            useLayoutMode ? styles.gridHeaderBad : styles.gridHeaderGood,
          ]}
        >
          <Text style={styles.cardBadge}>{useLayoutMode ? "BAD" : "GOOD"}</Text>
          <Text style={styles.cardTitle}>
            {useLayoutMode
              ? "width + height (layout pass per frame)"
              : "scale (composited, no layout)"}
          </Text>
        </View>

        {/* flex-wrap row so every child's width change forces the wrap engine
           to re-flow its siblings. This is the layout-thrash amplifier. */}
        <View style={styles.grid}>
          {BOXES.map((b) =>
            useLayoutMode ? (
              <LayoutBox key={b.id} color={b.color} />
            ) : (
              <TransformBox key={b.id} color={b.color} />
            ),
          )}
        </View>
      </View>

      <View style={styles.codeBlock}>
        <Text
          style={styles.codeText}
        >{`// BAD — Yoga layout pass every frame, every sibling re-measured
const size = useSharedValue(20);
size.value = withRepeat(withTiming(36, { duration: 800 }), -1, true);
const style = useAnimatedStyle(() => ({
  width: size.value,
  height: size.value,
}));

// GOOD — transform only, composited on the GPU, no layout pass
const scale = useSharedValue(1);
scale.value = withRepeat(withTiming(1.8, { duration: 800 }), -1, true);
const style = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));`}</Text>
      </View>
    </ScrollView>
  );
}

function FpsRow({
  label,
  value,
  primary,
}: {
  label: string;
  value: number;
  primary?: boolean;
}) {
  const color = value >= 50 ? "#1b8a4a" : value >= 25 ? "#c98600" : "#b00020";
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, primary && { fontWeight: "700" }]}>
        {label}
      </Text>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{value}</Text>
      </View>
    </View>
  );
}

// Extra wrapper Views deepen the layout tree so each frame's layout pass
// has more work to do. Same shape for both variants so the comparison is
// apples-to-apples — only the animated style differs.
function LayoutBox({ color }: { color: string }) {
  const size = useSharedValue(20);

  useEffect(() => {
    size.value = withRepeat(
      withTiming(36, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [size]);

  const animStyle = useAnimatedStyle(() => ({
    width: size.value,
    height: size.value,
  }));

  return (
    <View style={styles.cellOuter}>
      <View style={styles.cellMid}>
        <View style={styles.cellInner}>
          <Animated.View
            style={[styles.box, { backgroundColor: color }, animStyle]}
          />
        </View>
      </View>
    </View>
  );
}

function TransformBox({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.8, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.cellOuter}>
      <View style={styles.cellMid}>
        <View style={styles.cellInner}>
          <Animated.View
            style={[
              styles.box,
              { backgroundColor: color, width: 20, height: 20 },
              animStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  diagPanel: {
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  diagTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  diagHint: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
    lineHeight: 16,
  },
  bold: {
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 40,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  gridWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 14,
  },
  gridHeader: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gridHeaderBad: {
    backgroundColor: "#ffe5e5",
  },
  gridHeaderGood: {
    backgroundColor: "#e1f4e6",
  },
  cardBadge: {
    fontWeight: "800",
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: "#fff",
    backgroundColor: "#444",
    borderRadius: 4,
  },
  cardTitle: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 11,
    color: "#222",
  },
  // flex-wrap container — sibling boxes are re-flowed every time a peer's
  // width changes, which is what makes the layout pass painful.
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 6,
  },
  cellOuter: {
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellMid: {
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellInner: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    borderRadius: 4,
  },
  codeBlock: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    color: "#dcdcdc",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 11,
    lineHeight: 16,
  },
});
