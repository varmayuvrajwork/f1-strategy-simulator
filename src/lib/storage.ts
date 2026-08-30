import { supabase } from './supabase'
import type { SavedSimulation } from '../types'

const LOCAL_STORAGE_KEY = 'apex_saved_simulations'

function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  return Boolean(
    url &&
      key &&
      !url.includes('placeholder') &&
      url.startsWith('https://') &&
      url.includes('.supabase.co'),
  )
}

export function getLocalSavedSimulations(): SavedSimulation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalSimulation(
  sim: Omit<SavedSimulation, 'id' | 'created_at'> & { id?: string; created_at?: string },
): SavedSimulation {
  const current = getLocalSavedSimulations()
  const newSim: SavedSimulation = {
    ...sim,
    id: sim.id || `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    created_at: sim.created_at || new Date().toISOString(),
  }
  const updated = [newSim, ...current.filter((item) => item.id !== newSim.id)]
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('LocalStorage save error:', e)
  }
  return newSim
}

export function deleteLocalSimulation(id: string): void {
  const current = getLocalSavedSimulations()
  const updated = current.filter((item) => item.id !== id)
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('LocalStorage delete error:', e)
  }
}

export async function saveSimulationRun(
  simData: Omit<SavedSimulation, 'id' | 'created_at'>,
): Promise<{ success: boolean; error?: string }> {
  // Always save to LocalStorage first for instant, guaranteed persistence!
  saveLocalSimulation(simData)

  // Sync to Supabase only if valid configuration exists
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('simulations').insert(simData)
      if (error) {
        console.warn('Supabase save warning:', error.message)
      }
    } catch (err) {
      console.warn('Supabase save exception:', err)
    }
  }

  return { success: true }
}

export async function fetchSavedSimulations(): Promise<{ data: SavedSimulation[]; error?: string }> {
  const localData = getLocalSavedSimulations()

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data && data.length > 0) {
        const map = new Map<string, SavedSimulation>()
        localData.forEach((item) => map.set(item.id, item))
        ;(data as SavedSimulation[]).forEach((item) => map.set(item.id, item))
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        return { data: merged }
      }
    } catch (err) {
      console.warn('Supabase fetch failed:', err)
    }
  }

  return { data: localData }
}

export async function deleteSimulationRun(id: string): Promise<void> {
  deleteLocalSimulation(id)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('simulations').delete().eq('id', id)
    } catch (err) {
      console.warn('Supabase delete exception:', err)
    }
  }
}
