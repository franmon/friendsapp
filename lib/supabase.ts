import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'



// Variables de entorno — copiar en .env
// EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
// EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SecureStore para tokens de auth (más seguro que AsyncStorage)
/*const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}
*/

// Almacenamiento de sesión: SecureStore en móvil, localStorage en web
const storageAdapter = Platform.OS === 'web'
  ? {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return Promise.resolve(null)
        return Promise.resolve(localStorage.getItem(key))
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
        return Promise.resolve()
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key)
        return Promise.resolve()
      },
    }
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    }


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
//    storage: ExpoSecureStoreAdapter,
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})


// Helper para obtener URL pública de un archivo en Storage
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper para subir archivo y devolver la URL pública
export async function uploadFile(
  bucket: string,
  path: string,
  file: Blob | ArrayBuffer,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: false })

  if (error) throw error
  return getPublicUrl(bucket, path)
}
