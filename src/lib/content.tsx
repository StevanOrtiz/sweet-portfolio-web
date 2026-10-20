import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { localRepo, repo } from './repo'
import type { Content } from '../types'

type Ctx = { content: Content; loading: boolean; source: string; refresh: () => Promise<void> }
const ContentContext = createContext<Ctx | null>(null)

async function load(): Promise<{ content: Content; source: string }> {
  const fromRepo = await repo.loadAll().catch(() => null)
  if (fromRepo) return { content: fromRepo, source: repo.label }
  // Active backend unreachable or empty: fall back to the bundled content.json.
  return { content: (await localRepo.loadAll())!, source: 'bundled seed' }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ content: Content | null; source: string }>({ content: null, source: '' })

  const refresh = useCallback(async () => {
    const next = await load()
    setState(next)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  if (!state.content) return <div className="h-full bg-studio-bg" />
  return <ContentContext.Provider value={{ content: state.content, loading: false, source: state.source, refresh }}>{children}</ContentContext.Provider>
}

export const useContent = () => {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent outside ContentProvider')
  return ctx
}
