import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useContent } from '../lib/content'

type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'bool' | 'images' | 'image' | 'category' }
type Entity = { table: string; label: string; fields: Field[]; titleKey: string; defaults: Record<string, unknown> }

const entities: Entity[] = [
  { table: 'works', label: 'Works', titleKey: 'title', defaults: { title: 'New work', description: '', images: [], tools: '', tags: '', published: true, sort: 0 },
    fields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'category_id', label: 'Category', type: 'category' }, { key: 'images', label: 'Images', type: 'images' }, { key: 'tools', label: 'Tools' }, { key: 'tags', label: 'Tags' }, { key: 'published', label: 'Published', type: 'bool' }, { key: 'sort', label: 'Order', type: 'number' }] },
  { table: 'categories', label: 'Categories', titleKey: 'name', defaults: { name: 'New category', sort: 0 },
    fields: [{ key: 'name', label: 'Name' }, { key: 'sort', label: 'Order', type: 'number' }] },
  { table: 'services', label: 'Services', titleKey: 'title', defaults: { title: 'New service', description: '', icon: 'box', sort: 0 },
    fields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'icon', label: 'Icon (box, map, sun, code)' }, { key: 'sort', label: 'Order', type: 'number' }] },
  { table: 'links', label: 'Links', titleKey: 'label', defaults: { type: 'other', label: 'New link', url: 'https://', note: '', sort: 0 },
    fields: [{ key: 'type', label: 'Type (discord, email, roblox, x, github, linkedin)' }, { key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }, { key: 'note', label: 'Contact window message (optional)', type: 'textarea' }, { key: 'sort', label: 'Order', type: 'number' }] },
  { table: 'profile', label: 'About', titleKey: 'name', defaults: { name: 'Your name', tagline: '', bio: '', avatar: '', skills: '' },
    fields: [{ key: 'name', label: 'Name' }, { key: 'tagline', label: 'Tagline' }, { key: 'bio', label: 'Bio', type: 'textarea' }, { key: 'avatar', label: 'Avatar', type: 'image' }, { key: 'skills', label: 'Skills (comma separated)' }] },
  { table: 'site_texts', label: 'Texts', titleKey: 'key', defaults: { key: 'new_key', value: '' },
    fields: [{ key: 'key', label: 'Key (hero_title, hero_subtitle, contact_intro)' }, { key: 'value', label: 'Value', type: 'textarea' }] },
]

type Row = Record<string, any>
const pk = (table: string) => (table === 'site_texts' ? 'key' : 'id')

async function upload(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
  const { error } = await supabase!.storage.from('renders').upload(path, file)
  if (error) throw error
  return supabase!.storage.from('renders').getPublicUrl(path).data.publicUrl
}

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
  const key = pk(entity.table)

  const load = async () => {
    const { data } = await supabase!.from(entity.table).select('*')
    setRows(data ?? [])
    if (entity.table === 'works') setCats((await supabase!.from('categories').select('*')).data ?? [])
  }
  useEffect(() => { setSel(null); setMsg(''); void load() }, [entity.table])

  const isNew = sel && !rows.some((r) => r[key] === sel[key] && sel.__saved)
  const save = async () => {
    if (!sel) return
    setBusy(true)
    const { __saved, ...payload } = sel
    const res = __saved
      ? await supabase!.from(entity.table).update(payload).eq(key, sel[key])
      : await supabase!.from(entity.table).insert(payload)
    setMsg(res.error ? res.error.message : 'Saved.')
    setBusy(false)
    if (!res.error) { await load(); await refresh(); setSel(null) }
  }
  const remove = async () => {
    if (!sel || !sel.__saved || !confirm('Delete this item?')) return
    const res = await supabase!.from(entity.table).delete().eq(key, sel[key])
    setMsg(res.error ? res.error.message : 'Deleted.')
    if (!res.error) { await load(); await refresh(); setSel(null) }
  }
  const set = (k: string, v: unknown) => setSel((s) => (s ? { ...s, [k]: v } : s))
  const addFiles = async (k: string, files: FileList | null, multi: boolean) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const urls = await Promise.all([...files].map(upload))
      set(k, multi ? [...(sel?.[k] ?? []), ...urls] : urls[0])
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  return (
    <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
      <div className="space-y-1">
        <button className="btn-primary w-full" onClick={() => setSel({ ...entity.defaults })}>+ Add</button>
        {rows.map((r) => (
          <button key={r[key]} onClick={() => setSel({ ...r, __saved: true })}
            className={`block w-full truncate rounded px-2 py-1 text-left text-sm ${sel?.[key] === r[key] ? 'bg-studio-select' : 'bg-studio-panel hover:bg-studio-panel2'}`}>
            {r[entity.titleKey] || '(untitled)'}
          </button>
        ))}
      </div>
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
                    <option value="">— none —</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : f.type === 'images' ? (
                  <div className="mt-1">
                    <input type="file" accept="image/*" multiple onChange={(e) => addFiles(f.key, e.target.files, true)} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(sel[f.key] ?? []).map((src: string, i: number) => (
                        <div key={src} className="relative">
                          <img src={src} alt="" className="h-20 rounded border border-studio-border" />
                          <button type="button" className="absolute right-0 top-0 bg-black/70 px-1 text-xs"
                            onClick={() => set(f.key, sel[f.key].filter((_: string, j: number) => j !== i))}>✕</button>
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
              <button className="btn-primary" disabled={busy} onClick={save}>{isNew ? 'Create' : 'Save'}</button>
              {sel.__saved && <button className="btn" onClick={remove}>Delete</button>}
              <button className="btn" onClick={() => setSel(null)}>Cancel</button>
            </div>
          </div>
        ) : <p className="text-sm text-studio-dim">Select an item or add a new one.</p>}
        {msg && <p className="mt-3 text-sm text-studio-accent">{msg}</p>}
      </div>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState(entities[0].table)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabaseConfigured) {
    return (
      <div className="mx-auto mt-24 max-w-lg p-6 text-sm">
        <h1 className="mb-2 text-lg font-semibold">Admin not configured</h1>
        <p className="text-studio-dim">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see <code>.env.example</code>) and run <code>supabase/schema.sql</code>.</p>
        <Link to="/" className="mt-4 inline-block text-studio-accent">← Back to site</Link>
      </div>
    )
  }
  if (!ready) return null
  if (!session) return <Login />

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/" className="text-studio-accent">← Site</Link>
        <h1 className="ml-2 text-lg font-semibold">Admin</h1>
        <button className="btn ml-auto" onClick={() => supabase!.auth.signOut()}>Sign out</button>
      </div>
      <div className="mb-4 flex flex-wrap gap-1">
        {entities.map((e) => (
          <button key={e.table} onClick={() => setTab(e.table)} className={`rounded px-3 py-1 text-sm ${tab === e.table ? 'bg-studio-select' : 'bg-studio-panel hover:bg-studio-panel2'}`}>{e.label}</button>
        ))}
      </div>
      <Editor entity={entities.find((e) => e.table === tab)!} />
    </div>
  )
}
