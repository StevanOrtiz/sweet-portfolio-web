import { useState } from 'react'
import MenuBar from '../components/studio/MenuBar'
import Explorer from '../components/studio/Explorer'
import Viewport from '../components/studio/Viewport'
import Properties from '../components/studio/Properties'
import Output from '../components/studio/Output'

type Tab = 'explorer' | 'viewport' | 'properties'

const Panel = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <section className={`flex min-h-0 flex-col border-studio-border bg-studio-panel ${className}`}>
    <h2 className="shrink-0 border-b border-studio-border bg-studio-panel2 px-2 py-1 text-xs uppercase tracking-wide text-studio-dim">{title}</h2>
    <div className="min-h-0 flex-1">{children}</div>
  </section>
)

export default function Home() {
  const [selected, setSelected] = useState('home')
  const [tab, setTab] = useState<Tab>('viewport')
  const [log, setLog] = useState<string[]>(['Studio ready.'])

  const select = (id: string) => {
    setSelected(id)
    setLog((l) => [...l.slice(-30), `Selected: ${id.replace(':', '/')}`])
    setTab('viewport')
  }

  return (
    <div className="flex h-full flex-col">
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
          <Panel title="Viewport" className="flex-1"><Viewport selected={selected} onSelect={select} /></Panel>
          <Panel title="Output" className="hidden h-32 border-t md:flex"><Output log={log} /></Panel>
        </div>
        <Panel title="Properties" className={`${tab === 'properties' ? 'flex' : 'hidden'} w-full border-l md:flex md:w-64 md:shrink-0`}>
          <Properties selected={selected} />
        </Panel>
      </div>
    </div>
  )
}
