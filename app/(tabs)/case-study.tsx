import { useRouter, type Href } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CASE_STUDY_BUTTONS: { label: string; href: Href }[] = [
  { label: 'Case Study A', href: '/case-study-a' },
  { label: 'Case Study B', href: '/case-study-b' },
  { label: 'Case Study C', href: '/case-study-c' },
  { label: 'Case Study D', href: '/case-study-d' },
  { label: 'Case Study E', href: '/case-study-e' },
  { label: 'Case Study F', href: '/case-study-f' },
  { label: 'Case Study G', href: '/case-study-g' },
  { label: 'Case Study H', href: '/case-study-h' },
];

export default function CaseStudyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const tint = Colors[colorScheme].tint;
  const labelColor = colorScheme === 'dark' ? '#11181C' : '#fff';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={280}
          color="#808080"
          name="book.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Case study
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText>
          Browse case studies and detailed reports. Tap a case below to see details.
        </ThemedText>
      </ThemedView>
      <View style={styles.buttonsContainer}>
        {CASE_STUDY_BUTTONS.map(({ label, href }) => (
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
    left: -20,
    position: 'absolute',
    opacity: 0.6,
  },
  titleContainer: {
    flexDirection: 'row',
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
