import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="symptom-a" options={{ title: 'Symptom A' }} />
        <Stack.Screen name="symptom-b" options={{ title: 'Symptom B' }} />
        <Stack.Screen name="symptom-c" options={{ title: 'Symptom C' }} />
        <Stack.Screen name="case-study-a" options={{ title: 'Case Study A' }} />
        <Stack.Screen name="case-study-b" options={{ title: 'Case Study B' }} />
        <Stack.Screen name="case-study-c" options={{ title: 'Case Study C' }} />
        <Stack.Screen name="case-study-d" options={{ title: 'Case Study D' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
