import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { initDatabase } from '../src/db/database';
import '../global.css';

// Prevent splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync();

const appStartTime = performance.now();

export default function RootLayout(): React.JSX.Element | null {
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [fontsProfiled, setFontsProfiled] = useState<boolean>(false);

  // Load custom fonts using expo-font
  const [fontsLoaded, fontError] = useFonts({
    NotoSans: require('../assets/fonts/NotoSans/NotoSans-Regular.ttf'),
    NotoSansDevanagari: require('../assets/fonts/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf'),
    NotoSansKannada: require('../assets/fonts/NotoSansKannada/NotoSansKannada-Regular.ttf'),
  });

  // Profile font loading
  useEffect(() => {
    if ((fontsLoaded || fontError) && !fontsProfiled) {
      const fontsEndTime = performance.now();
      const fontsDuration = fontsEndTime - appStartTime;
      console.log(`[Startup Profile] Font loading completed in ${fontsDuration.toFixed(2)}ms (success: ${!!fontsLoaded})`);
      setFontsProfiled(true);
    }
  }, [fontsLoaded, fontError, fontsProfiled]);

  // Initialize SQLite database
  useEffect(() => {
    const dbStartTime = performance.now();
    async function prepareDb() {
      try {
        await initDatabase();
        const dbEndTime = performance.now();
        const dbDuration = dbEndTime - dbStartTime;
        console.log(`[Startup Profile] DB init took ${dbDuration.toFixed(2)}ms`);
        setDbReady(true);
      } catch (err: any) {
        console.error('Database initialization error during app startup:', err);
        setDbError(err.message || String(err));
      }
    }
    prepareDb();
  }, []);

  // Hide splash screen once database and fonts are resolved
  useEffect(() => {
    if ((fontsLoaded || fontError) && (dbReady || dbError)) {
      const splashHideStart = performance.now();
      SplashScreen.hideAsync()
        .then(() => {
          const splashHideEnd = performance.now();
          const splashDuration = splashHideEnd - splashHideStart;
          const totalStartupTime = splashHideEnd - appStartTime;
          console.log(`[Startup Profile] Splash hide took ${splashDuration.toFixed(2)}ms`);
          console.log(`[Startup Profile] Total startup duration: ${totalStartupTime.toFixed(2)}ms`);
        })
        .catch((err) => {
          console.error('Error hiding splash screen:', err);
        });
    }
  }, [fontsLoaded, fontError, dbReady, dbError]);

  // If there's a startup DB error, render a friendly message
  if (dbError) {
    const { View, Text } = require('react-native');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#D63B2F', fontWeight: 'bold', marginBottom: 10 }}>
          Database Error
        </Text>
        <Text style={{ fontSize: 14, color: '#6B6860', textAlign: 'center' }}>
          {dbError}
        </Text>
      </View>
    );
  }

  // Keep showing splash screen until fonts and DB are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (!dbReady && !dbError) {
    return null;
  }

  return <Slot />;
}
