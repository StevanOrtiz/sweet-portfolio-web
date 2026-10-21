import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { repo } from '../lib/repo'
import { useContent } from '../lib/content'
import { pkOf } from '../lib/repo/types'
import type { Row, Table } from '../types'

type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'bool' | 'images' | 'image' | 'category' }
type Entity = { table: Table; label: string; fields: Field[]; titleKey: string; defaults: Row; singleton?: boolean }

const entities: Entity[] = [
  { table: 'works', label: 'Works', titleKey: 'title', defaults: { title: 'New work', description: '', category_id: null, images: [], tools: '', tags: '', published: true, sort: 0 },
    fields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description (shown on the back of the card)', type: 'textarea' }, { key: 'category_id', label: 'Category', type: 'category' }, { key: 'images', label: 'Images (first one is the cover)', type: 'images' }, { key: 'tools', label: 'Tools' }, { key: 'tags', label: 'Tags (comma separated)' }, { key: 'published', label: 'Published', type: 'bool' }] },
  { table: 'categories', label: 'Categories', titleKey: 'name', defaults: { name: 'New category', sort: 0 },
    fields: [{ key: 'name', label: 'Name' }] },
  { table: 'services', label: 'Services', titleKey: 'title', defaults: { title: 'New service', description: '', icon: 'box', sort: 0 },
    fields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'icon', label: 'Icon (box, map, sun, code)' }] },
  { table: 'tools', label: 'Toolbelt', titleKey: 'name', defaults: { name: 'New tool', level: 50, note: '', icon: 'cube', sort: 0 },
    fields: [{ key: 'name', label: 'Name' }, { key: 'level', label: 'Level (0-100)', type: 'number' }, { key: 'note', label: 'Description', type: 'textarea' }, { key: 'icon', label: 'Icon (cube, shapes, sun, map, code, layers, brush, hammer, sparkles)' }] },
  { table: 'stats', label: 'Stats', titleKey: 'label', defaults: { label: 'Stat', value: '0', sort: 0 },
    fields: [{ key: 'label', label: 'Label' }, { key: 'value', label: 'Value' }] },
  { table: 'timeline', label: 'Timeline', titleKey: 'title', defaults: { year: '', title: 'New milestone', text: '', sort: 0 },
    fields: [{ key: 'year', label: 'Year' }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea' }] },
  { table: 'faq', label: 'FAQ', titleKey: 'q', defaults: { q: 'New question', a: '', sort: 0 },
    fields: [{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer', type: 'textarea' }] },
  { table: 'links', label: 'Links', titleKey: 'label', defaults: { type: 'other', label: 'New link', url: 'https://', note: '', sort: 0 },
    fields: [{ key: 'type', label: 'Type (discord, email, roblox, x, github, linkedin)' }, { key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }, { key: 'note', label: 'Contact window message (optional)', type: 'textarea' }] },
  { table: 'availability', label: 'Availability', titleKey: 'response', singleton: true, defaults: { open: true, response: '', preferred: 'discord' },
    fields: [{ key: 'open', label: 'Open for commissions', type: 'bool' }, { key: 'response', label: 'Response time text' }, { key: 'preferred', label: 'Preferred channel type (discord, email...)' }] },
  { table: 'profile', label: 'About', titleKey: 'name', singleton: true, defaults: { name: 'Your name', tagline: '', bio: '', avatar: '', skills: '', facts: '' },
    fields: [{ key: 'name', label: 'Name' }, { key: 'tagline', label: 'Tagline' }, { key: 'bio', label: 'Bio', type: 'textarea' }, { key: 'avatar', label: 'Avatar', type: 'image' }, { key: 'skills', label: 'Skills (comma separated)' }, { key: 'facts', label: 'Fun facts (comma separated)' }] },
  { table: 'studio', label: 'Studio', titleKey: 'name', singleton: true, defaults: { name: 'WARE STUDIOS', tagline: '', intro: '', logo: '', ceo_note: '', join_text: '' },
    fields: [{ key: 'name', label: 'Studio name' }, { key: 'tagline', label: 'Tagline' }, { key: 'intro', label: 'Introduction', type: 'textarea' }, { key: 'logo', label: 'Logo', type: 'image' }, { key: 'ceo_note', label: 'CEO note' }, { key: 'join_text', label: 'Call to action text', type: 'textarea' }] },
  { table: 'studio_stats', label: 'Studio stats', titleKey: 'label', defaults: { label: 'Stat', value: '0', sort: 0 },
    fields: [{ key: 'label', label: 'Label' }, { key: 'value', label: 'Value (numbers count up, e.g. 50+)' }] },
  { table: 'studio_steps', label: 'Studio process', titleKey: 'title', defaults: { title: 'New step', text: '', sort: 0 },
    fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea' }] },
  { table: 'studio_services', label: 'Studio services', titleKey: 'title', defaults: { title: 'New service', description: '', icon: 'box', sort: 0 },
    fields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'icon', label: 'Icon (box, map, sun, code)' }] },
  { table: 'team', label: 'Team', titleKey: 'name', defaults: { name: 'New member', role: '', bio: '', avatar: '', skills: '', link: '', ceo: false, sort: 0 },
    fields: [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'bio', label: 'Bio', type: 'textarea' }, { key: 'avatar', label: 'Avatar', type: 'image' }, { key: 'skills', label: 'Skills (comma separated)' }, { key: 'link', label: 'Link (Discord, Roblox, portfolio...)' }, { key: 'ceo', label: 'CEO (shown first and larger)', type: 'bool' }] },
  { table: 'site_texts', label: 'Texts', titleKey: 'key', defaults: { key: 'new_key', value: '' },
    fields: [{ key: 'key', label: 'Key (hero_title, contact_intro)' }, { key: 'value', label: 'Value', type: 'textarea' }] },
]

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    setErr(error?.message ?? '')
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-3 rounded border border-studio-border bg-studio-panel p-6">
      <h1 className="text-lg font-semibold">Admin login</h1>
      <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button className="btn-primary w-full">Sign in</button>
    </form>
  )
}

function Editor({ entity }: { entity: Entity }) {
  const { refresh } = useContent()
  const [rows, setRows] = useState<Row[]>([])
  const [cats, setCats] = useState<Row[]>([])
  const [sel, setSel] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const key = pkOf(entity.table)
  const sortable = !entity.singleton && 'sort' in entity.defaults
  const dragFrom = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const load = async () => {
    const list = await repo.list(entity.table)
    setRows(sortable ? [...list].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) : list)
    if (entity.table === 'works') setCats(await repo.list('categories'))
  }
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true)
    try { await fn(); setMsg(ok); await load(); await refresh(); return true }
    catch (e) { setMsg((e as Error).message); return false }
    finally { setBusy(false) }
  }
  useEffect(() => {
    setMsg('')
    void load().then(() => undefined)
    // singleton tables open straight into their only row
    if (entity.singleton) void repo.list(entity.table).then((l) => setSel(l[0] ? { ...l[0], __saved: true } : { ...entity.defaults }))
    else setSel(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.table])

  const save = async () => {
    if (!sel) return
    const { __saved, ...payload } = sel
    if (await run(() => repo.upsert(entity.table, payload), 'Saved.') && !entity.singleton) setSel(null)
  }
  const remove = async () => {
    if (!sel?.__saved || !confirm('Delete this item?')) return
    if (await run(() => repo.remove(entity.table, sel[key]), 'Deleted.')) setSel(null)
  }
  const reorder = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= rows.length) return
    const next = [...rows]
    next.splice(to, 0, next.splice(from, 1)[0])
    setRows(next.map((r, i) => ({ ...r, sort: i })))
    await run(() => repo.reorder(entity.table, next.map((r) => r.id)), 'Order saved.')
  }
  const set = (k: string, v: unknown) => setSel((s) => (s ? { ...s, [k]: v } : s))
  const moveImage = (k: string, i: number, d: number) =>
    setSel((s) => {
      if (!s) return s
      const arr = [...(s[k] ?? [])]
      const j = i + d
      if (j < 0 || j >= arr.length) return s
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...s, [k]: arr }
    })
  const addFiles = async (k: string, files: FileList | null, multi: boolean) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const urls = await Promise.all([...files].map((f) => repo.uploadImage(f)))
      setSel((s) => (s ? { ...s, [k]: multi ? [...(s[k] ?? []), ...urls] : urls[0] } : s))
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  return (
    <div className={`grid gap-4 ${entity.singleton ? '' : 'md:grid-cols-[16rem_1fr]'}`}>
      {!entity.singleton && (
        <div className="space-y-1">
          <button className="btn-primary w-full" onClick={() => setSel({ ...entity.defaults, ...(sortable ? { sort: rows.length } : {}) })}>+ Add</button>
          {rows.map((r, idx) => (
            <div key={r[key]}
              draggable={sortable}
              onDragStart={() => { dragFrom.current = idx }}
              onDragOver={(e) => { if (sortable) { e.preventDefault(); setOver(idx) } }}
              onDragLeave={() => setOver((o) => (o === idx ? null : o))}
              onDrop={() => { setOver(null); if (dragFrom.current !== null) void reorder(dragFrom.current, idx); dragFrom.current = null }}
              onDragEnd={() => { dragFrom.current = null; setOver(null) }}
              className={`flex items-center gap-1 rounded ${over === idx ? 'outline outline-1 outline-studio-accent' : ''} ${sel?.[key] === r[key] ? 'bg-studio-select' : 'bg-studio-panel hover:bg-studio-panel2'}`}>
              {sortable && <GripVertical size={14} className="ml-1 shrink-0 cursor-grab text-studio-dim" aria-hidden />}
              <button onClick={() => setSel({ ...r, __saved: true })} className="min-w-0 flex-1 truncate px-1 py-1 text-left text-sm">
                {r[entity.titleKey] || '(untitled)'}
              </button>
              {sortable && (
                <>
                  <button aria-label="Move up" disabled={idx === 0} onClick={() => void reorder(idx, idx - 1)} className="p-1 text-studio-dim hover:text-white disabled:opacity-25"><ArrowUp size={14} /></button>
                  <button aria-label="Move down" disabled={idx === rows.length - 1} onClick={() => void reorder(idx, idx + 1)} className="p-1 text-studio-dim hover:text-white disabled:opacity-25"><ArrowDown size={14} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <div>
        {sel ? (
          <div className="space-y-3">
            {entity.fields.map((f) => (
              <label key={f.key} className="block text-sm">
                <span className="text-studio-dim">{f.label}</span>
                {f.type === 'textarea' ? <textarea className="field mt-1 h-28" value={sel[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                : f.type === 'number' ? <input className="field mt-1" type="number" value={sel[f.key] ?? 0} onChange={(e) => set(f.key, Number(e.target.value))} />
                : f.type === 'bool' ? <input className="mt-1 block" type="checkbox" checked={!!sel[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
                : f.type === 'category' ? (
                  <select className="field mt-1" value={sel[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value || null)}>
                    <option value="">- none -</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : f.type === 'images' ? (
                  <div className="mt-1">
                    <input type="file" accept="image/*" multiple onChange={(e) => addFiles(f.key, e.target.files, true)} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(sel[f.key] ?? []).map((src: string, i: number) => (
                        <div key={src + i} className="relative">
                          <img src={src} alt="" className="h-20 rounded border border-studio-border" />
                          <button type="button" className="absolute right-0 top-0 bg-black/70 px-1 text-xs"
                            onClick={() => set(f.key, sel[f.key].filter((_: string, j: number) => j !== i))}>x</button>
                          {i === 0 && <span className="absolute left-0 top-0 bg-studio-accent px-1 text-[10px] text-black">cover</span>}
                          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60">
                            <button type="button" aria-label="Move image left" disabled={i === 0} onClick={() => moveImage(f.key, i, -1)} className="px-1 disabled:opacity-25"><ChevronLeft size={14} /></button>
                            <button type="button" aria-label="Move image right" disabled={i === sel[f.key].length - 1} onClick={() => moveImage(f.key, i, 1)} className="px-1 disabled:opacity-25"><ChevronRight size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : f.type === 'image' ? (
                  <div className="mt-1">
                    <input type="file" accept="image/*" onChange={(e) => addFiles(f.key, e.target.files, false)} />
                    {sel[f.key] && <img src={sel[f.key]} alt="" className="mt-2 h-20 rounded border border-studio-border" />}
                  </div>
                ) : <input className="field mt-1" value={sel[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />}
              </label>
            ))}
            <div className="flex gap-2">
              <button className="btn-primary" disabled={busy} onClick={save}>{sel.__saved || entity.singleton ? 'Save' : 'Create'}</button>
              {sel.__saved && !entity.singleton && <button className="btn" onClick={remove}>Delete</button>}
              {!entity.singleton && <button className="btn" onClick={() => setSel(null)}>Cancel</button>}
            </div>
          </div>
        ) : <p className="text-sm text-studio-dim">Select an item or add a new one.</p>}
        {msg && <p className="mt-3 text-sm text-studio-accent">{msg}</p>}
      </div>
    </div>
  )
}

export default function Admin() {
  const needsLogin = repo.kind === 'supabase'
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!needsLogin)
  const [tab, setTab] = useState<Table>(entities[0].table)

  useEffect(() => {
    if (!needsLogin || !supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [needsLogin])

  if (!ready) return null
  if (needsLogin && !session) return <Login />

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/" className="text-studio-accent">&larr; Site</Link>
        <h1 className="ml-2 text-lg font-semibold">Admin</h1>
        <span className="rounded border border-studio-border px-2 py-0.5 font-mono text-xs text-studio-dim">
          {repo.kind === 'local' ? 'local files: src/data/content.json + public/uploads' : 'Supabase'}
        </span>
        {needsLogin && <button className="btn ml-auto" onClick={() => supabase!.auth.signOut()}>Sign out</button>}
      </div>
      <div className="mb-4 flex flex-wrap gap-1">
        {entities.map((e) => (
          <button key={e.table} onClick={() => setTab(e.table)} className={`rounded px-3 py-1 text-sm ${tab === e.table ? 'bg-studio-select' : 'bg-studio-panel hover:bg-studio-panel2'}`}>{e.label}</button>
        ))}
      </div>
      <Editor key={tab} entity={entities.find((e) => e.table === tab)!} />
    </div>
  )
}
