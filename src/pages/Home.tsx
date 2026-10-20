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
  const mk = (text: string): LogLine => ({ id: nextId.current++, text })
  const [log, setLog] = useState<LogLine[]>([])
  const [splash, setSplash] = useState(() => {
    try { return new URLSearchParams(window.location.search).has('splash') || !localStorage.getItem('splash-seen') } catch { return true }
  })
  const finishSplash = useCallback(() => {
    try { localStorage.setItem('splash-seen', '1') } catch { /* storage unavailable */ }
    setSplash(false)
  }, [])
  const booted = useRef(false)
  const push = (...texts: string[]) => setLog((l) => [...l, ...texts.map(mk)].slice(-40))

  useEffect(() => {
    if (splash || booted.current) return
    booted.current = true
    push('> studio.boot()', '  mounting Workspace ...', '  starting Explorer, Viewport, Properties')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splash])

  const announced = useRef(false)
  useEffect(() => {
    if (splash || loading || announced.current) return
    announced.current = true
    push(live ? '[ok] content loaded from database' : '[warn] database empty or unset: showing placeholders', '[ok] studio ready')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splash, loading, live])

  const label = (id: string) => {
    if (id.startsWith('work:')) return `Workspace.Gallery.${content.works.find((w) => w.id === id.slice(5))?.title ?? '?'}`
    if (id.startsWith('cat:')) return `Workspace.Gallery.${content.categories.find((c) => c.id === id.slice(4))?.name ?? '?'}`
    return id === 'home' ? 'Workspace' : `Workspace.${id[0].toUpperCase()}${id.slice(1)}`
  }

  const select = (id: string) => {
    if (id !== selected) push(`> select ${label(id)}`)
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
          <Panel title="Viewport" className="flex-1"><Viewport selected={selected} onSelect={select} onLog={(t) => push(t)} /></Panel>
          <Panel title="Output" className="hidden h-36 border-t md:flex"><Output log={log} /></Panel>
        </div>
        <Panel title="Properties" className={`${tab === 'properties' ? 'flex' : 'hidden'} w-full border-l md:flex md:w-64 md:shrink-0`}>
          <Properties selected={selected} />
        </Panel>
      </div>
    </div>
  )
}
