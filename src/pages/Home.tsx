import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Splash from '../components/Splash'
import { useContent } from '../lib/content'
import MenuBar from '../components/studio/MenuBar'
import Explorer from '../components/studio/Explorer'
import Viewport from '../components/studio/Viewport'
import Properties from '../components/studio/Properties'
import Output, { type LogLine } from '../components/studio/Output'

type Tab = 'explorer' | 'viewport' | 'properties'

const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const ms = () => rand(18, 96)
const chatter: (() => string)[] = [
  () => `[gc] collected ${(Math.random() * 4 + 0.5).toFixed(1)} MB in ${rand(1, 6)}ms`,
  () => `[net] GET /rest/v1/works?select=* 200 OK ${ms()}ms`,
  () => `[render] ${rand(58, 60)} fps, draw calls ${rand(110, 190)}`,
  () => `[assets] cache hit "renders/img-${rand(1, 24).toString().padStart(2, '0')}.png"`,
  () => `[info] heartbeat ok (${rand(12, 40)}ms)`,
  () => '[ok] health check passed',
  () => `[net] GET /storage/v1/object/public/renders 200 OK ${ms()}ms`,
]

const Panel = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <section className={`flex min-h-0 flex-col border-studio-border bg-studio-panel ${className}`}>
    <h2 className="shrink-0 border-b border-studio-border bg-studio-panel2 px-2 py-1 text-xs uppercase tracking-wide text-studio-dim">{title}</h2>
    <div className="min-h-0 flex-1">{children}</div>
  </section>
)

export default function Home() {
  const { content, loading, live } = useContent()
  const [selected, setSelected] = useState('home')
  const [tab, setTab] = useState<Tab>('viewport')
  const nextId = useRef(0)
  const mk = (text: string): LogLine => ({ id: nextId.current++, ts: new Date().toTimeString().slice(0, 8), text })
  const [log, setLog] = useState<LogLine[]>([])
  const [splash, setSplash] = useState(() => {
    try { return new URLSearchParams(window.location.search).has('splash') || !localStorage.getItem('splash-seen') } catch { return true }
  })
  const finishSplash = useCallback(() => {
    try { localStorage.setItem('splash-seen', '1') } catch { /* storage unavailable */ }
    setSplash(false)
  }, [])
  const booted = useRef(false)
  const push = (...texts: string[]) => setLog((l) => [...l, ...texts.map(mk)].slice(-60))

  useEffect(() => {
    if (splash || booted.current) return
    booted.current = true
    push(
      '$ sweetkanmi --boot',
      '[info] studio-viewport v1.0.0 (node env: production)',
      '[info] mounting Workspace ...',
      `[net] GET /rest/v1/categories 200 OK ${ms()}ms`,
      `[net] GET /rest/v1/works 200 OK ${ms()}ms`,
      `[net] GET /rest/v1/services 200 OK ${ms()}ms`,
      `[net] GET /rest/v1/profile 200 OK ${ms()}ms`,
      `[assets] streaming ${rand(8, 18)} textures ... done (${(Math.random() * 5 + 1).toFixed(1)} MB)`,
      '[render] shaders compiled (8/8)',
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splash])

  useEffect(() => {
    if (splash) return
    const t = setInterval(() => {
      if (!document.hidden) push(chatter[rand(0, chatter.length - 1)]())
    }, 7000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splash])

  const announced = useRef(false)
  useEffect(() => {
    if (splash || loading || announced.current) return
    announced.current = true
    push(live ? '[ok] content synced from database' : '[warn] database not configured: using placeholder data', `[ok] workspace ready in ${(Math.random() * 0.8 + 0.6).toFixed(1)}s`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splash, loading, live])

  const label = (id: string) => {
    if (id.startsWith('work:')) return `Workspace.Gallery.${content.works.find((w) => w.id === id.slice(5))?.title ?? '?'}`
    if (id.startsWith('cat:')) return `Workspace.Gallery.${content.categories.find((c) => c.id === id.slice(4))?.name ?? '?'}`
    return id === 'home' ? 'Workspace' : `Workspace.${id[0].toUpperCase()}${id.slice(1)}`
  }

  const select = (id: string) => {
    if (id !== selected) {
      const work = id.startsWith('work:') ? content.works.find((w) => w.id === id.slice(5)) : undefined
      const route = work ? `/gallery/${work.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : `/${id.replace(':', '/')}`
      push(`$ select ${label(id)}`, `[net] GET ${route} 200 OK ${ms()}ms`, ...(work ? [`[ok] loaded ${work.images.length} image${work.images.length === 1 ? '' : 's'}`] : []))
    }
    setSelected(id)
    setTab('viewport')
  }

  return (
    <div className="flex h-full flex-col">
      <AnimatePresence>{splash && <Splash key="splash" ready={!loading} onDone={finishSplash} />}</AnimatePresence>
      <MenuBar selected={selected} onSelect={select} />

      <div className="flex shrink-0 border-b border-studio-border text-sm md:hidden">
        {(['explorer', 'viewport', 'properties'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 capitalize ${tab === t ? 'bg-studio-select text-white' : 'bg-studio-panel'}`}>{t}</button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <Panel title="Explorer" className={`${tab === 'explorer' ? 'flex' : 'hidden'} w-full border-r md:flex md:w-64 md:shrink-0`}>
          <Explorer selected={selected} onSelect={select} />
        </Panel>
        <div className={`${tab === 'viewport' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
          <Panel title="Viewport" className="flex-1"><Viewport selected={selected} onSelect={select} onLog={(t) => push(t, '[ok] channel window opened')} /></Panel>
          <Panel title="Output" className="hidden h-36 border-t md:flex"><Output log={log} /></Panel>
        </div>
        <Panel title="Properties" className={`${tab === 'properties' ? 'flex' : 'hidden'} w-full border-l md:flex md:w-64 md:shrink-0`}>
          <Properties selected={selected} />
        </Panel>
      </div>
    </div>
  )
}
