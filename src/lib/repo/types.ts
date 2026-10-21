import type { Content, Row, Table } from '../../types'

// Every content backend (local file, Supabase) implements this so the UI never knows which one is active.
export interface Repo {
  kind: 'local' | 'supabase'
  label: string
  loadAll(): Promise<Content | null>
  list(table: Table): Promise<Row[]>
  upsert(table: Table, row: Row): Promise<Row>
  remove(table: Table, id: string): Promise<void>
  reorder(table: Table, ids: string[]): Promise<void>
  uploadImage(file: File): Promise<string>
}

export const pkOf = (table: Table) => (table === 'site_texts' ? 'key' : 'id')

const bySort = (rows: Row[]) => [...rows].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))

// Turns raw table rows into the Content shape the site renders.
export function buildContent(db: Record<Table, Row[]>): Content {
  return {
    categories: bySort(db.categories), works: bySort(db.works), services: bySort(db.services), links: bySort(db.links),
    tools: bySort(db.tools), stats: bySort(db.stats), timeline: bySort(db.timeline), faq: bySort(db.faq),
    profile: db.profile[0], availability: db.availability[0],
    texts: Object.fromEntries(db.site_texts.map((r) => [r.key, r.value])),
    studio: db.studio[0], studioStats: bySort(db.studio_stats), studioSteps: bySort(db.studio_steps),
    studioServices: bySort(db.studio_services), team: bySort(db.team),
  } as Content
}
