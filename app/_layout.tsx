import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CommentProvider } from '@/contexts/CommentContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <CommentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="ProfileScreen" 
          options={{ 
            headerShown: false,
            presentation: 'card',
            gestureEnabled: true 
          }} 
        />
        <Stack.Screen name="host-registration" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </CommentProvider>
  );
}
