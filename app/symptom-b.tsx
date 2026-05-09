import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SymptomBScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Symptom B</ThemedText>
      <ThemedText style={styles.description}>
        Details about Symptom B go here.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  description: {
    opacity: 0.8,
  },
});
