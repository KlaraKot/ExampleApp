import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SymptomCScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Symptom C</ThemedText>
      <ThemedText style={styles.description}>
        Details about Symptom C go here.
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
