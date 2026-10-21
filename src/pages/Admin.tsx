import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, ExternalLink, LayoutDashboard, LogOut, Upload } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { repo } from '../lib/repo'
import { useContent } from '../lib/content'
import type { Content, Table } from '../types'
import CollectionEditor from '../components/admin/CollectionEditor'
import BulkImport from '../components/admin/BulkImport'
import Overview from '../components/admin/Overview'
import { entities, navGroups } from '../components/admin/schema'
import { ConfirmModal, ToastProvider } from '../components/admin/ui'

type Tab = 'overview' | 'import' | Table

const countOf = (c: Content, t: Table): number | undefined => ({
  works: c.works.length, categories: c.categories.length, services: c.services.length, tools: c.tools.length, stats: c.stats.length,
  timeline: c.timeline.length, links: c.links.length, faq: c.faq.length, team: c.team.length, studio_stats: c.studioStats.length,
  studio_steps: c.studioSteps.length, studio_services: c.studioServices.length,
} as Partial<Record<Table, number>>)[t]

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
    <div className="flex h-full items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-md border border-studio-border bg-studio-panel p-6">
        <div>
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-white">SWEETKANMI</div>
          <h1 className="mt-2 text-xl font-semibold text-white">Admin sign in</h1>
        </div>
        <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn-primary w-full !py-2">Sign in</button>
      </form>
    </div>
  )
}

function PublishCard() {
  const [copied, setCopied] = useState(false)
  const cmd = 'git add -A && git commit -m "Update content" && git push'
  if (repo.kind === 'supabase') return <p className="px-3 text-xs leading-snug text-studio-dim">Changes go live immediately.</p>
  return (
    <div className="m-3 rounded-md border border-studio-border bg-studio-bg/50 p-3 text-xs leading-snug text-studio-dim">
      <div className="mb-1 font-semibold text-studio-text">Publishing</div>
      Edits are saved to <code className="text-studio-accent">src/data/content.json</code> and <code className="text-studio-accent">public/uploads</code>. Commit them to publish.
      <button className="mt-2 flex w-full items-center justify-between gap-2 rounded border border-studio-border px-2 py-1 font-mono text-[10px] text-studio-text hover:border-studio-accent"
        onClick={async () => { try { await navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard unavailable */ } }}>
        <span className="truncate">{cmd}</span>{copied ? <Check size={12} className="shrink-0 text-studio-ok" /> : <Copy size={12} className="shrink-0" />}
      </button>
    </div>
  )
}

function Shell({ needsLogin }: { needsLogin: boolean }) {
  const { content } = useContent()
  const initial = (): Tab => (window.location.hash.slice(1) as Tab) || 'overview'
  const [tab, setTab] = useState<Tab>(initial)
  const [dirty, setDirty] = useState(false)
  const [target, setTarget] = useState<Tab | null>(null)
  const onDirtyChange = useCallback((d: boolean) => setDirty(d), [])

  const go = (t: Tab) => {
    if (t === tab) return
    if (dirty) return setTarget(t)
    setTab(t)
  }
  useEffect(() => { window.history.replaceState(null, '', `#${tab}`) }, [tab])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const entity = entities.find((e) => e.table === tab)

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-studio-border bg-studio-panel px-4">
        <span className="font-mono text-sm font-bold tracking-[0.18em] text-white">SWEETKANMI</span>
        <span className="rounded border border-studio-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-studio-dim">Admin</span>
        <span className="hidden rounded border border-studio-border px-2 py-0.5 font-mono text-[10px] text-studio-dim sm:inline">
          {repo.kind === 'local' ? 'Local files' : 'Supabase'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {needsLogin && <button className="btn flex items-center gap-1.5 !py-1" onClick={() => supabase!.auth.signOut()}><LogOut size={14} />Sign out</button>}
          <Link to="/" className="btn flex items-center gap-1.5 !py-1">View site <ExternalLink size={14} /></Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav aria-label="Admin sections" className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-studio-border bg-studio-panel/60">
          <div className="flex-1 py-2">
            <button onClick={() => go('overview')} className={`mx-2 mb-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${tab === 'overview' ? 'bg-studio-select text-white' : 'text-studio-text hover:bg-studio-panel2'}`}>
              <LayoutDashboard size={15} className={tab === 'overview' ? 'text-studio-accent' : 'text-studio-dim'} />Overview
            </button>
            <button onClick={() => go('import')} className={`mx-2 mb-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${tab === 'import' ? 'bg-studio-select text-white' : 'text-studio-text hover:bg-studio-panel2'}`}>
              <Upload size={15} className={tab === 'import' ? 'text-studio-accent' : 'text-studio-dim'} />Bulk import
            </button>
            {navGroups.map((g) => (
              <div key={g.label} className="mt-3">
                <div className="px-4 pb-1 font-mono text-[10px] uppercase tracking-widest text-studio-dim/70">{g.label}</div>
                {g.tables.map((t) => {
                  const e = entities.find((x) => x.table === t)!
                  const n = countOf(content, t)
                  const active = tab === t
                  return (
                    <button key={t} onClick={() => go(t)} aria-current={active ? 'page' : undefined}
                      className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${active ? 'bg-studio-select text-white' : 'text-studio-text hover:bg-studio-panel2'}`}>
                      <e.icon size={15} className={active ? 'text-studio-accent' : 'text-studio-dim'} />
                      <span className="flex-1 text-left">{e.label}</span>
                      {n !== undefined && <span className="font-mono text-[10px] text-studio-dim">{n}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <PublishCard />
        </nav>

        <main className="min-w-0 flex-1 bg-studio-bg">
          {tab === 'import' ? <BulkImport go={() => setTab('works')} /> : tab === 'overview' || !entity ? <Overview go={go} /> : <CollectionEditor key={tab} entity={entity} onDirtyChange={onDirtyChange} />}
        </main>
      </div>

      <ConfirmModal open={!!target} title="Discard unsaved changes?" text="You have edits that have not been saved. If you leave this section they will be lost." confirmLabel="Discard and leave" danger
        onCancel={() => setTarget(null)} onConfirm={() => { if (target) { setDirty(false); setTab(target) } setTarget(null) }} />
    </div>
  )
}

export default function Admin() {
  const needsLogin = repo.kind === 'supabase'
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!needsLogin)

  useEffect(() => {
    if (!needsLogin || !supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [needsLogin])

  if (!ready) return null
  if (needsLogin && !session) return <Login />
  return <ToastProvider><Shell needsLogin={needsLogin} /></ToastProvider>
}
