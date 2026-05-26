import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase } from '@/db/database';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AppText } from '../components/AppText';
import { COLORS } from '@/utils/theme';
import { getBoolean } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

// Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync().catch(() => {});

const appStartTime = performance.now();

function RouteGuard({ children, isReady }: { children: React.ReactNode; isReady: boolean }) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady) return;

    let active = true;
    async function runGuard() {
      try {
        const onboardingComplete = await getBoolean(STORAGE_KEYS.ONBOARDING_DONE, false);
        const firstSegment = segments[0] as string | undefined;
        const inOnboarding = firstSegment === '(onboarding)';
        const inHome = firstSegment === '(home)';
        const isRoot = firstSegment === undefined || firstSegment === '' || firstSegment === 'index';

        if (!active) return;

        // Defer navigation action to ensure the layout/navigation tree is fully settled
        setTimeout(() => {
          if (!active) return;
          if (!onboardingComplete) {
            if (!inOnboarding) {
              router.replace('/(onboarding)/welcome');
            }
          } else {
            if (isRoot || inOnboarding) {
              router.replace('/(home)');
            }
          }
        }, 0);
      } catch (err) {
        console.error('Guard evaluation error:', err);
      }
    }
    runGuard();

    return () => {
      active = false;
    };
  }, [segments, isReady]);

  return <>{children}</>;
}

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

  // Profile font loading duration
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

  const isLoaded = (fontsLoaded || fontError) && (dbReady || dbError);

  return (
    <LanguageProvider>
      <RouteGuard isReady={!!isLoaded && !dbError}>
        <View style={{ flex: 1 }}>
          <Slot />
          
          {!isLoaded && (
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          {!!dbError && (
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, padding: 20 }]}>
              <AppText variant="heading1" color={COLORS.error} style={{ marginBottom: 10 }}>
                Database Error
              </AppText>
              <AppText variant="body" color={COLORS.textSecondary} style={{ textAlign: 'center' }}>
                {dbError}
              </AppText>
            </View>
          )}
        </View>
      </RouteGuard>
    </LanguageProvider>
  );
}
