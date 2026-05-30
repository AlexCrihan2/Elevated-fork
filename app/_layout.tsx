import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, AlertProvider } from '@/template';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { ConnectionProvider } from '@/contexts/ConnectionContext';
import { AIDebugProvider } from '@/contexts/AIDebugContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedIntro from '@/components/ui/AnimatedIntro';
import { EconomyProvider } from '@/contexts/EconomyContext';
import ModernBackground from '@/components/ui/ModernBackground';

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AnimatedIntro onComplete={() => setShowIntro(false)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocalizationProvider>
        <ThemeProvider>
          <AlertProvider>
            <SecurityProvider>
              <SocialProvider>
                <ConnectionProvider>
                  <AIDebugProvider>
                    <EconomyProvider>
                <StatusBar style="dark" backgroundColor="white" />
                <ModernBackground />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="security" options={{ 
                    headerShown: true,
                    title: 'Security Center',
                    presentation: 'modal'
                  }} />
                  <Stack.Screen name="settings" options={{ 
                    headerShown: true,
                    title: 'Settings',
                    presentation: 'modal'
                  }} />
                </Stack>
                    </EconomyProvider>
                  </AIDebugProvider>
                </ConnectionProvider>
              </SocialProvider>
            </SecurityProvider>
          </AlertProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </GestureHandlerRootView>
  );
}