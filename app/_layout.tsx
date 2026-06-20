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
  const { session, loading, profile, currentGroup } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  // ¿Ha terminado el alta? (los usuarios antiguos ya tienen grupo → se consideran hechos)
  const onboarded = !!profile?.onboarding_complete

  useEffect(() => {
    if (session) {
      requestNotificationPermissions()
    }
  }, [session])

  useEffect(() => {
    if (loading) return
    // Espera a tener el perfil cargado para no decidir con datos a medias
    if (session && !profile) return

    const inAuthGroup = segments[0] === '(auth)'
    const inGroupSetup = segments[0] === 'group-setup'
    const inOnboarding = segments[0] === 'onboarding'
    // Zonas por las que el usuario puede moverse mientras hace el alta
    const inOnboardingFlow = inAuthGroup || inOnboarding || inGroupSetup

    if (!session) {
      // Sin sesión → ir a bienvenida
      if (!inAuthGroup) router.replace('/(auth)/welcome')
    } else if (!onboarded) {
      // Con sesión pero sin terminar el alta → dejarle recorrer welcome/registro,
      // onboarding y group-setup. Si está fuera de esas zonas, mándale al perfil.
      if (!inOnboardingFlow) router.replace('/onboarding/profile')
    } else if (onboarded && inOnboardingFlow) {
      // Alta terminada y todavía en pantallas de alta → entrar a la app
      router.replace('/(tabs)')
    }
  }, [session, loading, profile, onboarded, segments])

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
