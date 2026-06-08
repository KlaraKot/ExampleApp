"use no memo";

import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CaseStudyEScreen() {
  const [mountKey, setMountKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => setMountKey((k) => k + 1);
    }, []),
  );

  return <Demo key={mountKey} />;
}

const FIELDS = [
  { id: "firstName", label: "First name" },
  { id: "lastName", label: "Last name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "address", label: "Address" },
  { id: "city", label: "City" },
  { id: "zip", label: "Postal code" },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];
type FormState = Record<FieldId, string>;

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
};

function Demo() {
  const [controlled, setControlled] = useState(true);
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.diagPanel}>
        <Text style={styles.diagTitle}>Controlled vs Uncontrolled inputs</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>
            Use <Text style={{ fontWeight: "700" }}>controlled</Text> inputs
            (BAD here)
          </Text>
          <Switch value={controlled} onValueChange={setControlled} />
        </View>
        <FpsRow fps={fps} />
        <Text style={styles.diagHint}>
          Each keystroke in a controlled input lifts state to the parent, which
          re-renders the whole form — every sibling field included. With
          uncontrolled inputs (refs + defaultValue), the native TextInput owns
          its value; React renders nothing on keystroke. Type fast and watch the
          sibling counters on the BAD side climb while the GOOD side stays
          still.
        </Text>
      </View>

      {controlled ? <ControlledForm /> : <UncontrolledForm />}

      <View style={styles.codeBlock}>
        <Text
          style={styles.codeText}
        >{`// BAD — every keystroke re-renders every sibling
const [form, setForm] = useState(EMPTY);
<TextInput
  value={form.email}
  onChangeText={(v) => setForm({ ...form, email: v })}
/>

// GOOD — native owns the value, React stays quiet
const ref = useRef('');
<TextInput
  defaultValue=""
  onChangeText={(v) => { ref.current = v; }}
/>`}</Text>
      </View>
    </ScrollView>
  );
}

function ControlledForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const parentRenders = useRef(0);
  parentRenders.current += 1;

  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeaderBad}>
        <Text style={styles.cardBadge}>BAD</Text>
        <Text style={styles.cardTitle}>controlled (useState per field)</Text>
        <Text style={styles.cardMeta}>parent r:{parentRenders.current}</Text>
      </View>
      {FIELDS.map((f) => (
        <ControlledField
          key={f.id}
          label={f.label}
          value={form[f.id]}
          onChange={(v) => setForm((cur) => ({ ...cur, [f.id]: v }))}
        />
      ))}
    </View>
  );
}

function ControlledField({
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
        <Text
          style={[
            styles.fieldRenders,
            renders.current > 1 && styles.fieldRendersWarn,
          ]}
        >
          r:{renders.current}
        </Text>
      </View>
      {/* ❌ BAD */}
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

function UncontrolledForm() {
  const valuesRef = useRef<FormState>({ ...EMPTY });
  const parentRenders = useRef(0);
  parentRenders.current += 1;

  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeaderGood}>
        <Text style={styles.cardBadge}>GOOD</Text>
        <Text style={styles.cardTitle}>uncontrolled (defaultValue + ref)</Text>
        <Text style={styles.cardMeta}>parent r:{parentRenders.current}</Text>
      </View>
      {FIELDS.map((f) => (
        <UncontrolledField
          key={f.id}
          label={f.label}
          onChange={(v) => {
            valuesRef.current[f.id] = v;
          }}
        />
      ))}
    </View>
  );
}

function UncontrolledField({
  label,
  onChange,
}: {
  label: string;
  onChange: (v: string) => void;
}) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldRenders}>r:{renders.current}</Text>
      </View>
      {/* ✅ GOOD */}
      <TextInput
        style={styles.input}
        defaultValue=""
        onChangeText={onChange}
        placeholder={label}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

function FpsRow({ fps }: { fps: number }) {
  const fpsColor = fps >= 50 ? "#1b8a4a" : fps >= 25 ? "#c98600" : "#b00020";
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>FPS (JS thread)</Text>
      <View style={[styles.badge, { backgroundColor: fpsColor }]}>
        <Text style={styles.badgeText}>{fps}</Text>
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
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  formCard: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
    marginBottom: 14,
  },
  cardHeaderBad: {
    backgroundColor: "#ffe5e5",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardHeaderGood: {
    backgroundColor: "#e1f4e6",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    flex: 1,
  },
  cardMeta: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444",
  },
  field: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  fieldRenders: {
    fontSize: 10,
    color: "#888",
  },
  fieldRendersWarn: {
    color: "#b00020",
    fontWeight: "700",
  },
  input: {
    height: 36,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    fontSize: 13,
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
