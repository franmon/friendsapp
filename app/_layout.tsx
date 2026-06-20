import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { COLORS } from '@/constants/theme'

import { requestNotificationPermissions } from '@/lib/notifications'

import { SafeAreaProvider } from 'react-native-safe-area-context'

// Componente que gestiona las redirecciones según el estado de auth
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { session, loading, currentGroup } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
      if (session) {
        requestNotificationPermissions()
      }
    }, [session])

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inGroupSetup = segments[0] === 'group-setup'

    if (!session) {
      // Sin sesión → ir a login
      if (!inAuthGroup) router.replace('/(auth)/login')
    } else if (!currentGroup && !inGroupSetup) {
      // Con sesión pero sin grupo → ir a selección de grupo
      router.replace('/group-setup')
    } else if (session && currentGroup && (inAuthGroup || inGroupSetup)) {
      // Con sesión y grupo → ir a la app
      router.replace('/(tabs)')
    }
  }, [session, loading, currentGroup, segments])

  return <>{children}</>
}

/* export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="group-setup" />
          </Stack>
          <StatusBar style="auto" />
        </NavigationGuard>
      </AuthProvider>
    </GestureHandlerRootView>
  )
} */


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="group-setup" />
              <Stack.Screen name="event-new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="expense-new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="polls" options={{ headerShown: true }} />
              <Stack.Screen name="poll-new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="timeline" options={{ headerShown: true }} />
              <Stack.Screen name="survey" options={{ headerShown: true }} />
              <Stack.Screen name="import-file" options={{ headerShown: true }} />
              <Stack.Screen name="collage" options={{ headerShown: true }} />
            </Stack>
            <StatusBar style="auto" />
          </NavigationGuard>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}