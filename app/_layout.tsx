import { useEffect } from 'react'
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { COLORS } from '@/constants/theme'
import { View, ActivityIndicator } from 'react-native'

import { requestNotificationPermissions } from '@/lib/notifications'

import { SafeAreaProvider } from 'react-native-safe-area-context'

// Componente que gestiona las redirecciones según el estado de auth
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth()
  const segments = useSegments()
  const navigationState = useRootNavigationState()
  const router = useRouter()

  const onboarded = !!profile?.onboarding_complete
  const rootSegment = segments[0]

  useEffect(() => {
    // 1. No hacer NADA hasta que el navegador esté montado (evita replace prematuro)
    if (!navigationState?.key) return
    // 2. Esperar a que termine la carga de sesión
    if (loading) return
    // 3. Si hay sesión pero el perfil aún no llegó, esperar (pero ver nota abajo)
    if (session && profile === undefined) return

    const inAuthGroup = rootSegment === '(auth)'
    const inOnboardingFlow =
      inAuthGroup || rootSegment === 'onboarding' || rootSegment === 'group-setup'

    if (!session) {
      // Sin sesión → mandar a bienvenida solo si no está ya en la zona de auth
      if (!inAuthGroup) router.replace('/(auth)/welcome')
    } else if (!onboarded) {
      // Logueado pero sin completar el alta → al onboarding (si no está ya en esa zona)
      if (!inOnboardingFlow) router.replace('/onboarding/profile')
    } else {
      // Logueado y con alta completa. Solo sacarlo de las zonas de alta/auth.
      // Si está en cualquier otra pantalla (tabs o pantallas del stack), NO tocar.
      if (inOnboardingFlow) router.replace('/(tabs)')
    }
  }, [navigationState?.key, loading, session, profile, onboarded, rootSegment])

  // Spinner mientras se decide (navegador no listo, cargando, o perfil en camino)
//  const decidiendo = !navigationState?.key || loading || (session && profile === undefined)
  const decidiendo = loading || (session && profile === undefined)
  if (decidiendo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return <>{children}</>
}



export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="onboarding" />
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
