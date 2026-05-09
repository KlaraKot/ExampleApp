import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

export default function SymptomAScreen() {
  const [mountKey, setMountKey] = useState(0);

  // Bump the mount key every time the screen loses focus so the next
  // focus mounts a brand new component tree (no leftover state, no
  // leftover render counters, no leftover input text).
  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, [])
  );

  return <SymptomAContent key={mountKey} />;
}

function SymptomAContent() {
  const [text, setText] = useState('');
  const [fps, setFps] = useState(60);

  const renderCount = useRef(0);
  const lastRenderDuration = useRef(0);
  renderCount.current += 1;

  // FPS probe: requestAnimationFrame loop. When JS thread is blocked,
  // rAF callbacks don't fire on time → FPS visibly drops.
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

  // HEAVY LOGIC SIMULATION (Bad Practice)
  // This function runs on EVERY render, blocking the JS thread
  const renderHeavyContent = () => {
    const start = Date.now();
    while (Date.now() - start < 100) {
      // Block the thread for 100ms - this will make
      // typing 10 characters take a full second of "grinding"
    }
    lastRenderDuration.current = Date.now() - start;
    return (
      <View style={{ backgroundColor: '#ffe5e5', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ color: '#b00020', fontWeight: '700' }}>JS Thread is busy!</Text>
        <Text style={{ color: '#b00020', fontSize: 12, marginTop: 2 }}>
          This render blocked the thread for ~{lastRenderDuration.current}ms
        </Text>
      </View>
    );
  };

  const fpsColor = fps >= 50 ? '#1b8a4a' : fps >= 25 ? '#c98600' : '#b00020';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">
      <View
        style={{
          backgroundColor: '#f5f5f7',
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          gap: 6,
        }}>
        <Text style={{ fontWeight: '700', fontSize: 14, marginBottom: 4 }}>
          JS thread diagnostics
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13 }}>Render count</Text>
          <Text style={{ fontSize: 13, fontWeight: '600' }}>{renderCount.current}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13 }}>Last render duration</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#b00020' }}>
            {lastRenderDuration.current}ms
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>FPS (JS thread)</Text>
          <View
            style={{
              backgroundColor: fpsColor,
              paddingHorizontal: 10,
              paddingVertical: 2,
              borderRadius: 999,
            }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{fps}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
          FPS will drop below 10 while typing — proof that the JS thread is blocked.
        </Text>
      </View>

      <Text style={{ marginBottom: 8 }}>Type something quickly:</Text>
      <TextInput
        testID="main-input"
        nativeID="main-input"
        accessibilityLabel="main-input"
        style={{
          height: 44,
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 16,
          backgroundColor: '#fff',
        }}
        onChangeText={(val) => setText(val)}
        value={text}
        placeholder="You'll see the lag here..."
      />

      {renderHeavyContent()}
    </ScrollView>
  );
}
