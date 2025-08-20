import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { HeaderTitle } from '@/components/HeaderTitle';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Lalezar: require('../assets/fonts/Lalezar-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: TabBarBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleAlign: 'left',
          headerTitle: () => <HeaderTitle />,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 52,
            fontFamily: 'Lalezar',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            title: 'iSkate',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
