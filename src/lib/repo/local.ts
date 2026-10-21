import { tables, type Db, type Row, type Table } from '../../types'
import { buildContent, pkOf, type Repo } from './types'

// Dev: read/write the file through the Vite dev server (see vite-plugin-local-cms.ts).
// Production: the committed content.json is bundled and read-only.
async function readDb(): Promise<Db> {
  const raw: Partial<Db> = import.meta.env.DEV
    ? await (await fetch('/__cms/load', { cache: 'no-store' })).json()
    : (await import('../../data/content.json')).default
  return Object.fromEntries(tables.map((t) => [t, raw[t] ?? []])) as Db
}

async function save(db: Db) {
  const res = await fetch('/__cms/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db) })
  if (!res.ok) throw new Error(await res.text())
}

export const localRepo: Repo = {
  kind: 'local',
  label: 'content.json',
  async loadAll() { return buildContent(await readDb()) },
  async list(table: Table) { return (await readDb())[table] },
  async upsert(table, row) {
    const db = await readDb()
    const k = pkOf(table)
    const next: Row = { ...row }
    if (k === 'id' && !next.id) next.id = crypto.randomUUID()
    const i = db[table].findIndex((r) => r[k] === next[k])
    if (i >= 0) db[table][i] = next
    else db[table].push(next)
    await save(db)
    return next
  },
  async remove(table, id) {
    const db = await readDb()
    db[table] = db[table].filter((r) => r[pkOf(table)] !== id)
    await save(db)
  },
  async reorder(table, ids) {
    const db = await readDb()
    db[table] = db[table].map((r) => ({ ...r, sort: ids.indexOf(r.id) }))
    await save(db)
  },
  async uploadImage(file) {
    const res = await fetch(`/__cms/upload?name=${encodeURIComponent(file.name)}`, { method: 'POST', body: file })
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()).url as string
  },
}
