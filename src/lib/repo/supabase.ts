import { tables, type Db, type Row, type Table } from '../../types'
import { supabase } from '../supabase'
import { buildContent, pkOf, type Repo } from './types'

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export const supabaseRepo: Repo = {
  kind: 'supabase',
  label: 'Supabase',
  async loadAll() {
    const results = await Promise.all(tables.map((t) => client().from(t).select('*')))
    if (results.some((r) => r.error)) return null
    const db = Object.fromEntries(tables.map((t, i) => [t, results[i].data ?? []])) as Db
    // An empty project falls back to the bundled seed content.
    if (!db.profile.length || !db.availability.length) return null
    return buildContent(db)
  },
  async list(table: Table) {
    const { data, error } = await client().from(table).select('*')
    if (error) throw error
    return data ?? []
  },
  async upsert(table, row: Row) {
    const k = pkOf(table)
    const payload: Row = { ...row }
    // Seed ids from content.json are not valid UUIDs; let Postgres generate real ones for new rows.
    if (k === 'id' && !/^[0-9a-f-]{36}$/i.test(String(payload.id ?? ''))) delete payload.id
    const { data, error } = await client().from(table).upsert(payload).select().single()
    if (error) throw error
    return data as Row
  },
  async remove(table, id) {
    const { error } = await client().from(table).delete().eq(pkOf(table), id)
    if (error) throw error
  },
  async reorder(table, ids) {
    const results = await Promise.all(ids.map((id, i) => client().from(table).update({ sort: i }).eq('id', id)))
    const failed = results.find((r) => r.error)
    if (failed?.error) throw failed.error
  },
  async uploadImage(file) {
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
    const { error } = await client().storage.from('renders').upload(path, file)
    if (error) throw error
    return client().storage.from('renders').getPublicUrl(path).data.publicUrl
  },
}
