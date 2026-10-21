import { CheckCircle2, ExternalLink, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../../lib/content'
import type { Table } from '../../types'
import { entities } from './schema'

type Todo = { table: Table; label: string; detail: string }

// Finds leftover placeholder content so nothing generic ships by accident.
function useTodos(): Todo[] {
  const { content: c } = useContent()
  const has = (s: string | undefined, ...needles: string[]) => needles.some((n) => (s ?? '').includes(n))
  const todos: Todo[] = []
  const add = (table: Table, label: string, n: number, detail: string) => n > 0 && todos.push({ table, label, detail: `${n} ${detail}` })

  add('works', 'Replace placeholder works', c.works.filter((w) => w.images.some((i) => i.startsWith('/placeholders/')) || w.title.startsWith('Placeholder')).length, 'still use placeholder images')
  add('profile', 'Write your real bio', has(c.profile.bio, 'Edit this text') ? 1 : 0, 'bio still has the template text')
  add('profile', 'Add your avatar', c.profile.avatar ? 0 : 1, 'avatar is empty')
  add('stats', 'Set your Home stats', c.stats.filter((s) => /^0+\+?$/.test(s.value)).length, 'stats are still 00')
  add('tools', 'Review toolbelt notes', c.tools.filter((t) => has(t.note, 'Placeholder')).length, 'tools have placeholder notes')
  add('timeline', 'Fill in your journey', c.timeline.filter((t) => has(t.year, 'XX') || has(t.text, 'Placeholder')).length, 'milestones are placeholders')
  add('links', 'Use your real channels', c.links.filter((l) => ['https://discord.com', 'https://www.roblox.com', 'https://github.com/stevanortiz'].includes(l.url)).length, 'links are generic defaults')
  add('studio', 'Describe Ware Studios', has(c.studio.intro, 'Placeholder') ? 1 : 0, 'intro is a placeholder')
  add('studio_stats', 'Set studio numbers', c.studioStats.filter((s) => /^0+\+?$/.test(s.value)).length, 'stats are still 00')
  add('studio_services', 'Review studio services', c.studioServices.filter((s) => has(s.description, 'Placeholder')).length, 'services have placeholder text')
  add('team', 'Add your real team', c.team.filter((m) => m.name === 'Teammate Name' || has(m.bio, 'Placeholder')).length, 'members are placeholders')
  return todos
}

export default function Overview({ go }: { go: (t: Table) => void }) {
  const { content: c } = useContent()
  const todos = useTodos()
  const stats: { label: string; value: number; table: Table }[] = [
    { label: 'Works', value: c.works.length, table: 'works' }, { label: 'Services', value: c.services.length, table: 'services' },
    { label: 'Team members', value: c.team.length, table: 'team' }, { label: 'Channels', value: c.links.length, table: 'links' },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-studio-dim">Everything on the site is edited from here. Changes are written to the local content files.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <button key={s.label} onClick={() => go(s.table)} className="rounded-md border border-studio-border bg-studio-panel p-4 text-left transition-colors hover:border-studio-accent/60">
              <div className="text-3xl font-bold text-studio-accent">{s.value}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-studio-dim">{s.label}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary flex items-center gap-1.5 !px-3 !py-1.5" onClick={() => go('works')}><Plus size={14} />Add a work</button>
          <button className="btn flex items-center gap-1.5" onClick={() => go('profile')}>Edit About me</button>
          <button className="btn flex items-center gap-1.5" onClick={() => go('team')}>Edit team</button>
          <Link to="/" className="btn flex items-center gap-1.5">View site <ExternalLink size={14} /></Link>
        </div>

        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-studio-dim">To fill in {todos.length > 0 && `(${todos.length})`}</h2>
          {todos.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-studio-ok/40 bg-studio-panel p-4 text-sm">
              <CheckCircle2 className="text-studio-ok" size={20} />All placeholder content has been replaced.
            </div>
          ) : (
            <ul className="divide-y divide-studio-border overflow-hidden rounded-md border border-studio-border bg-studio-panel">
              {todos.map((t, i) => {
                const Icon = entities.find((e) => e.table === t.table)!.icon
                return (
                  <li key={i}>
                    <button onClick={() => go(t.table)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-studio-panel2">
                      <span className="rounded bg-studio-bg p-1.5 text-studio-dim"><Icon size={16} /></span>
                      <span className="flex-1"><span className="block text-sm text-white">{t.label}</span><span className="text-xs text-studio-dim">{t.detail}</span></span>
                      <span className="text-xs text-studio-accent">Fix</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
