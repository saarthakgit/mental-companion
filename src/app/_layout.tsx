import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { 
  PaperProvider, 
  MD3LightTheme, 
  MD3DarkTheme, 
  adaptNavigationTheme 
} from 'react-native-paper';
import { 
  ThemeProvider, 
  DefaultTheme as NavDefaultTheme, 
  DarkTheme as NavDarkTheme 
} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

// Adapt Navigation Theme to match Paper MD3
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavDefaultTheme,
  reactNavigationDark: NavDarkTheme,
});

const RootLayout = () => {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    'Code': require('../assets/fonts/code.ttf'),
    'Freak': require('../assets/fonts/Freak.ttf'),
    'SchoolR': require('../assets/fonts/SchoolR.ttf'),
    'SpaceMB': require('../assets/fonts/SpaceMB.ttf'),
    'SpaceMBI': require('../assets/fonts/SpaceMBI.ttf'),
    'SpaceMI': require('../assets/fonts/SpaceMI.ttf'),
    'SpaceMR': require('../assets/fonts/SpaceMR.ttf'),
  });

  // Setup Theme logic
  const theme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
    return {
      ...baseTheme,
      // You can override specific MD3 colors here if needed
      colors: {
        ...baseTheme.colors,
        primary: '#6C5CE7', // Ripple Purple
      },
    };
  }, [colorScheme]);

  // Handle Font Loading state
  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
};

export default RootLayout;