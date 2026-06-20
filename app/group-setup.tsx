import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { COLORS, RADIUS } from '@/constants/theme'
import { Group } from '@/types/database'

type Tab = 'join' | 'create'

export default function GroupSetupScreen() {
  const { user, setCurrentGroup } = useAuth()
  const [tab, setTab] = useState<Tab>('join')

  // Join
  const [joinCode, setJoinCode] = useState('')

  // Create
  const [groupName, setGroupName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [countdownDate, setCountdownDate] = useState('')

  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) {
      Alert.alert('Código inválido', 'El código tiene 6 caracteres.')
      return
    }
    setLoading(true)

    // Buscar el grupo
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !group) {
      setLoading(false)
      Alert.alert('Grupo no encontrado', 'Revisa el código e inténtalo de nuevo.')
      return
    }

    // Unirse como member
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user!.id, role: 'member' })

    setLoading(false)

    if (joinError && joinError.code !== '23505') {
      // 23505 = ya es miembro (unique violation), ignorar
      Alert.alert('Error al unirse', joinError.message)
      return
    }

    setCurrentGroup(group as Group)
  }

  async function handleCreate() {
    if (!groupName.trim()) {
      Alert.alert('Ponle un nombre', 'El grupo necesita un nombre.')
      return
    }

    setLoading(true)

    // Generar código único
    let code = ''
    let codeExists = true
    while (codeExists) {
      const { data } = await supabase.rpc('generate_group_code')
      code = data
      const { data: existing } = await supabase
        .from('groups')
        .select('id')
        .eq('code', code)
        .single()
      codeExists = !!existing
    }

    // Crear grupo
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: groupName.trim(),
        groom_name: groomName.trim() || null,
        countdown_date: countdownDate || null,
        created_by: user!.id,
        code,
      })
      .select()
      .single()

    if (error || !group) {
      setLoading(false)
      Alert.alert('Error al crear el grupo', error?.message)
      return
    }

    // Unirse como admin
    await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user!.id, role: 'admin' })

    setLoading(false)
    setCurrentGroup(group as Group)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>🥂</Text>
        <Text style={styles.title}>Tu despedida</Text>
        <Text style={styles.subtitle}>
          ¿Te han enviado un código? Únete al grupo.{'\n'}
          ¿Eres el organizador? Crea uno nuevo.
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'join' && styles.tabActive]}
            onPress={() => setTab('join')}
          >
            <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
              Unirse
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'create' && styles.tabActive]}
            onPress={() => setTab('create')}
          >
            <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
              Crear grupo
            </Text>
          </TouchableOpacity>
        </View>

        {/* JOIN */}
        {tab === 'join' && (
          <View style={styles.form}>
            <Text style={styles.label}>Código de invitación</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="ABCD12"
              placeholderTextColor={COLORS.muted}
              value={joinCode}
              onChangeText={t => setJoinCode(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleJoin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryButtonText}>Unirme al grupo</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* CREATE */}
        {tab === 'create' && (
          <View style={styles.form}>
            <Text style={styles.label}>Nombre del grupo *</Text>
            <TextInput
              style={styles.input}
              placeholder="La despedida de Marcos"
              placeholderTextColor={COLORS.muted}
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={styles.label}>Nombre del novio <Text style={styles.optional}>(opcional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Marcos"
              placeholderTextColor={COLORS.muted}
              value={groomName}
              onChangeText={setGroomName}
            />

            <Text style={styles.label}>Fecha de la despedida <Text style={styles.optional}>(opcional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="2025-06-15"
              placeholderTextColor={COLORS.muted}
              value={countdownDate}
              onChangeText={setCountdownDate}
            />
            <Text style={styles.hint}>Formato: YYYY-MM-DD</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryButtonText}>Crear grupo</Text>
              }
            </TouchableOpacity>

            <View style={styles.codeInfo}>
              <Text style={styles.codeInfoText}>
                🔑 Se generará un código de 6 letras que podrás compartir con tus amigos.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: 28, paddingTop: 60 },
  emoji: { fontSize: 52, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginTop: 6, marginBottom: 28, lineHeight: 22 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: 28,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '500', color: COLORS.muted },
  tabTextActive: { color: '#fff' },
  form: {},
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  optional: { fontWeight: '400', color: COLORS.muted },
  hint: { fontSize: 12, color: COLORS.muted, marginTop: -14, marginBottom: 16 },
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
  codeInput: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  codeInfo: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  codeInfoText: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
})
