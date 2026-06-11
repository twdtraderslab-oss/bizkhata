import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qxmcvhwcqjxqtplbfcdr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWN2aHdjcWp4cXRwbGJmY2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzkwMjQsImV4cCI6MjA5NjY1NTAyNH0.bu3O90YmQz_ACo8DedH4-RWvqOPkcuFgGLPkspqhRPY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { enabled: false },
  global: {
    headers: { 'X-Client-Info': 'hisaabpro/1.0' }
  }
})

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signUp({ email, password, businessName, ownerName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { businessName, ownerName, phone }
    }
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo ? `${redirectTo}/reset-password` : `${window.location.origin}/reset-password`
  })
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Database helpers ──────────────────────────────────────────────────────────

// Save all business data to cloud
export async function saveBusinessData(userId, data) {
  try {
    // Try upsert without onConflict first
    const { error } = await supabase
      .from('business_data')
      .upsert({
        user_id: userId,
        data: data,
        updated_at: new Date().toISOString()
      })
    if (error) {
      // Fallback: try simple insert, ignore duplicate error
      await supabase
        .from('business_data')
        .insert({ user_id: userId, data: data, updated_at: new Date().toISOString() })
        .throwOnError()
        .catch(() => {
          // If insert fails (duplicate), try update
          return supabase
            .from('business_data')
            .update({ data: data, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
        })
    }
  } catch(e) {
    // Never crash app on save failure - data is in localStorage
    console.warn('Cloud save skipped:', e?.message)
  }
}

// Load business data from cloud
export async function loadBusinessData(userId) {
  const { data, error } = await supabase
    .from('business_data')
    .select('data')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data?.data || null
}
