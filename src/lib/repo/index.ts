import { supabaseConfigured } from '../supabase'
import { localRepo } from './local'
import { supabaseRepo } from './supabase'
import type { Repo } from './types'

// Switch with VITE_CONTENT_SOURCE=supabase once the visuals are settled. Default is the local file.
const wantsSupabase = import.meta.env.VITE_CONTENT_SOURCE === 'supabase' && supabaseConfigured

export const repo: Repo = wantsSupabase ? supabaseRepo : localRepo
export { localRepo }

// The admin ships only in dev (local file) or when a real backend with login is configured.
export const adminEnabled = wantsSupabase || import.meta.env.DEV
