import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { placeholders } from '../data/placeholders'
import { supabase } from './supabase'
import type { Content } from '../types'

type Ctx = { content: Content; loading: boolean; live: boolean; refresh: () => Promise<void> }
const ContentContext = createContext<Ctx | null>(null)

const bySort = <T extends { sort: number }>(rows: T[]) => [...rows].sort((a, b) => a.sort - b.sort)

async function load(): Promise<Content | null> {
  if (!supabase) return null
  const [c, w, s, l, p, t] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('works').select('*'),
    supabase.from('services').select('*'),
    supabase.from('links').select('*'),
    supabase.from('profile').select('*').limit(1),
    supabase.from('site_texts').select('*'),
  ])
  if ([c, w, s, l, p, t].some((r) => r.error)) return null
  const empty = !w.data?.length && !s.data?.length && !l.data?.length && !p.data?.length
  if (empty) return null
  return {
    categories: bySort(c.data ?? []),
    works: bySort(w.data ?? []),
    services: bySort(s.data ?? []),
    links: bySort(l.data ?? []),
    profile: p.data?.[0] ?? placeholders.profile,
    texts: { ...placeholders.texts, ...Object.fromEntries((t.data ?? []).map((r) => [r.key, r.value])) },
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(placeholders)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))

  const refresh = useCallback(async () => {
    const data = await load()
    setContent(data ?? placeholders)
    setLive(Boolean(data))
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return <ContentContext.Provider value={{ content, loading, live, refresh }}>{children}</ContentContext.Provider>
}

export const useContent = () => {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent outside ContentProvider')
  return ctx
}
