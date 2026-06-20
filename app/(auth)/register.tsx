import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { COLORS, RADIUS } from '@/constants/theme'

export default function RegisterScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name.trim() || !email || !password) {
      Alert.alert('Faltan datos', 'Nombre, email y contraseña son obligatorios.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Contraseña corta', 'Usa al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    })

    if (error) {
      setLoading(false)
      Alert.alert('Error al registrarse', error.message)
      return
    }

    // Actualizar teléfono si se proporcionó
    if (phone) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ phone }).eq('id', user.id)
      }
    }

    setLoading(false)
    Alert.alert(
      '¡Cuenta creada! 🎉',
      'Revisa tu email para confirmar la cuenta y luego entra.',
      [{ text: 'Entrar', onPress: () => router.replace('/(auth)/login') }]
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Solo un momento, ¡luego a celebrar!</Text>

        <Text style={styles.label}>Tu nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Cómo te conocen tus amigos"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor={COLORS.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Teléfono <Text style={styles.optional}>(opcional)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="+34 600 000 000"
          placeholderTextColor={COLORS.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Ya tengo cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: 28, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.muted, marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  optional: { fontWeight: '400', color: COLORS.muted },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { alignItems: 'center', marginTop: 20, padding: 8 },
  backText: { color: COLORS.primary, fontSize: 15 },
})
