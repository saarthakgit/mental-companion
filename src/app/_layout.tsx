import React, { useMemo, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import PixelPet from '../components/chaseCat';
import { 
  PaperProvider, 
  MD3LightTheme, 
  adaptNavigationTheme 
} from 'react-native-paper';
import { 
  ThemeProvider, 
  DefaultTheme as NavDefaultTheme, 
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  // 1. GET WALLPAPER COLORS
  const { theme: sourceTheme } = useMaterial3Theme();

  const [fontsLoaded, fontError] = useFonts({
    'Code': require('../assets/fonts/code.ttf'),
    'Freak': require('../assets/fonts/Freak.ttf'),
    'SchoolR': require('../assets/fonts/SchoolR.ttf'),
    'SpaceMB': require('../assets/fonts/SpaceMB.ttf'),
    'SpaceMBI': require('../assets/fonts/SpaceMBI.ttf'),
    'SpaceMI': require('../assets/fonts/SpaceMI.ttf'),
    'SpaceMR': require('../assets/fonts/SpaceMR.ttf'),
  });

  // 2. GENERATE THEMES (Forced Light Mode)
  const { paperTheme, navTheme } = useMemo(() => {
    
    // Always grab the LIGHT palette from the wallpaper
    const dynamicColors = sourceTheme.light;

    // Create Paper Theme (Always Light)
    const myPaperTheme = {
      ...MD3LightTheme,
      colors: dynamicColors, 
    };

    // Adapt Navigation Theme
    const { LightTheme } = adaptNavigationTheme({
      reactNavigationLight: NavDefaultTheme,
      materialLight: myPaperTheme,
    });

    // FIX: Manually merge 'fonts' to satisfy TypeScript
    const finalNavTheme = {
      ...LightTheme,
      fonts: NavDefaultTheme.fonts,
    };

    return {
      paperTheme: myPaperTheme,
      navTheme: finalNavTheme
    };
  }, [sourceTheme]); 

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      
      {/* 3. FORCE STATUS BAR DARK CONTENT */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />

      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navTheme}>
          
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>

          <PixelPet/>

        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;