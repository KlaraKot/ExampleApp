import { useRouter, type Href } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SYMPTOM_BUTTONS: { label: string; href: Href }[] = [
  { label: 'Symptom A', href: '/symptom-a' },
  { label: 'Symptom B', href: '/symptom-b' },
  { label: 'Symptom C', href: '/symptom-c' },
  { label: 'Symptom E', href: '/symptom-e' },
  { label: 'Symptom F', href: '/symptom-f' },
  { label: 'Symptom G', href: '/symptom-g' },
  { label: 'Symptom H', href: '/symptom-h' },
];

export default function SymptomsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const tint = Colors[colorScheme].tint;
  const labelColor = colorScheme === 'dark' ? '#11181C' : '#fff';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={280}
          color="#5A8FA0"
          name="stethoscope"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Symptoms</ThemedText>
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText>
          Track and review the symptoms you are experiencing. Tap a symptom below to see details.
        </ThemedText>
      </ThemedView>
      <View style={styles.buttonsContainer}>
        {SYMPTOM_BUTTONS.map(({ label, href }) => (
          <TouchableOpacity
            key={label}
            onPress={() => router.push(href)}
            activeOpacity={0.85}
            style={[styles.button, { backgroundColor: tint }]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${label}`}>
            <ThemedText type="defaultSemiBold" style={[styles.buttonLabel, { color: labelColor }]}>
              {label}
            </ThemedText>
            <IconSymbol size={20} name="chevron.right" color={labelColor} />
          </TouchableOpacity>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -40,
    right: -20,
    position: 'absolute',
    opacity: 0.6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    gap: 8,
    marginBottom: 8,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonLabel: {
    fontSize: 17,
  },
});
