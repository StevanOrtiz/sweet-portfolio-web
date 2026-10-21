import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Copy, GripVertical, Plus, Save, Search, Trash2, Undo2 } from 'lucide-react'
import { repo } from '../../lib/repo'
import { pkOf } from '../../lib/repo/types'
import { useContent } from '../../lib/content'
import type { Row } from '../../types'
import { FieldRenderer } from './fields'
import { validate, type Entity } from './schema'
import { ConfirmModal, useToast } from './ui'

const clean = (r: Row) => { const { __saved, ...rest } = r; return rest }

export default function CollectionEditor({ entity, onDirtyChange }: { entity: Entity; onDirtyChange: (dirty: boolean) => void }) {
  const { refresh } = useContent()
  const toast = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [cats, setCats] = useState<Row[]>([])
  const [sel, setSel] = useState<Row | null>(null)
  const [orig, setOrig] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<(() => void) | null>(null)
  const [delOpen, setDelOpen] = useState(false)
  const dragFrom = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const key = pkOf(entity.table)
  const sortable = !entity.singleton && 'sort' in entity.defaults
  const isNew = !!sel && !sel.__saved
  const dirty = !!sel && JSON.stringify(clean(sel)) !== orig
  const Icon = entity.icon

  useEffect(() => { onDirtyChange(dirty || isNew) }, [dirty, isNew, onDirtyChange])
  useEffect(() => () => onDirtyChange(false), [onDirtyChange])

  const open = (r: Row | null) => { setErrors({}); setSel(r); setOrig(r ? JSON.stringify(clean(r)) : '') }
  const guard = (fn: () => void) => (dirty ? setPending(() => fn) : fn())

  const load = async () => {
    const list = await repo.list(entity.table)
    setRows(sortable ? [...list].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) : list)
    if (entity.table === 'works') setCats(await repo.list('categories'))
    return list
  }
  useEffect(() => {
    setQuery('')
    void load().then((list) => open(entity.singleton ? (list[0] ? { ...list[0], __saved: true } : { ...entity.defaults }) : null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.table])

  const save = async () => {
    if (!sel || busy) return
    const errs = validate(entity.fields, sel)
    setErrors(errs)
    if (Object.keys(errs).length) return toast.push({ kind: 'error', text: 'Fix the highlighted fields first' })
    setBusy(true)
    try {
      const saved = await repo.upsert(entity.table, clean(sel))
      await load(); await refresh()
      open({ ...saved, __saved: true })
      toast.push({ kind: 'ok', text: `Saved ${entity.noun}` })
    } catch (e) { toast.push({ kind: 'error', text: (e as Error).message }) }
    setBusy(false)
  }

  const remove = async () => {
    if (!sel?.__saved) return
    setDelOpen(false)
    const row = clean(sel)
    try {
      await repo.remove(entity.table, row[key])
      await load(); await refresh(); open(null)
      toast.push({ kind: 'ok', text: `Deleted ${entity.noun}`, action: { label: 'Undo', run: async () => { await repo.upsert(entity.table, row); await load(); await refresh() } } })
    } catch (e) { toast.push({ kind: 'error', text: (e as Error).message }) }
  }

  const duplicate = () => {
    if (!sel) return
    const copy: Row = { ...clean(sel), sort: rows.length }
    delete copy.id
    copy[entity.titleKey] = `${copy[entity.titleKey] ?? ''} (copy)`
    open(copy)
  }

  const reorder = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= rows.length) return
    const next = [...rows]
    next.splice(to, 0, next.splice(from, 1)[0])
    setRows(next.map((r, i) => ({ ...r, sort: i })))
    try { await repo.reorder(entity.table, next.map((r) => r.id)); await refresh() }
    catch (e) { toast.push({ kind: 'error', text: (e as Error).message }); await load() }
  }

  const set = (k: string, v: unknown) => setSel((s) => (s ? { ...s, [k]: v } : s))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); void save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const shown = rows.filter((r) => String(r[entity.titleKey] ?? '').toLowerCase().includes(query.toLowerCase()))
  const title = sel ? String(sel[entity.titleKey] ?? '').trim() : ''

  const form = sel && (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-studio-border px-5 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-studio-dim">{isNew ? `New ${entity.noun}` : entity.label}</div>
          <h2 className="truncate text-lg font-semibold text-white">{title || (isNew ? `Untitled ${entity.noun}` : entity.label)}</h2>
        </div>
        {entity.badge?.(sel) && <span className="rounded-sm border border-studio-border px-2 py-0.5 font-mono text-[10px] uppercase text-studio-dim">{entity.badge(sel)}</span>}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-2xl space-y-5">
          {entity.fields.map((f) => (
            <FieldRenderer key={f.key} field={f} value={sel[f.key]} error={errors[f.key]} ctx={{ categories: cats }} onChange={(v) => { set(f.key, v); if (errors[f.key]) setErrors((e) => ({ ...e, [f.key]: '' })) }} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-studio-border bg-studio-panel px-5 py-3">
        <span className={`flex items-center gap-1.5 text-xs ${dirty || isNew ? 'text-studio-warn' : 'text-studio-dim'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dirty || isNew ? 'bg-studio-warn' : 'bg-studio-ok'}`} />
          {isNew ? 'Not saved yet' : dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {!isNew && !entity.singleton && <button className="btn flex items-center gap-1.5 !border-red-400/40 text-red-300 hover:!border-red-400" onClick={() => setDelOpen(true)}><Trash2 size={14} />Delete</button>}
          {!isNew && !entity.singleton && entity.table !== 'site_texts' && <button className="btn flex items-center gap-1.5" onClick={duplicate}><Copy size={14} />Duplicate</button>}
          {dirty && !entity.singleton && <button className="btn flex items-center gap-1.5" onClick={() => open(isNew ? null : { ...JSON.parse(orig), __saved: true })}><Undo2 size={14} />Discard</button>}
          {dirty && entity.singleton && <button className="btn flex items-center gap-1.5" onClick={() => open({ ...JSON.parse(orig), __saved: true })}><Undo2 size={14} />Discard</button>}
          <button className="btn-primary flex items-center gap-1.5 !px-4 !py-1.5" disabled={busy || (!dirty && !isNew)} onClick={() => void save()}>
            <Save size={14} />{busy ? 'Saving...' : 'Save'}<kbd className="ml-1 rounded bg-black/20 px-1 font-mono text-[10px]">Ctrl S</kbd>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full min-h-0">
      {!entity.singleton && (
        <aside className="flex w-72 shrink-0 flex-col border-r border-studio-border bg-studio-panel/60">
          <div className="space-y-2 border-b border-studio-border p-3">
            <p className="text-xs leading-snug text-studio-dim">{entity.hint}</p>
            <button className="btn-primary flex w-full items-center justify-center gap-1.5 !py-1.5" onClick={() => guard(() => open({ ...entity.defaults, ...(sortable ? { sort: rows.length } : {}) }))}>
              <Plus size={14} />New {entity.noun}
            </button>
            {rows.length > 5 && (
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-studio-dim" />
                <input className="field !pl-7" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {shown.map((r) => {
              const idx = rows.indexOf(r)
              const active = sel?.__saved && sel[key] === r[key]
              const thumb = entity.thumb?.(r)
              const badge = entity.badge?.(r)
              return (
                <div key={r[key]} draggable={sortable && !query}
                  onDragStart={() => { dragFrom.current = idx }} onDragOver={(e) => { if (sortable) { e.preventDefault(); setOver(idx) } }} onDragLeave={() => setOver((o) => (o === idx ? null : o))}
                  onDrop={() => { setOver(null); if (dragFrom.current !== null) void reorder(dragFrom.current, idx); dragFrom.current = null }} onDragEnd={() => { dragFrom.current = null; setOver(null) }}
                  className={`group flex items-center gap-2 rounded-md border px-1.5 py-1.5 transition-colors ${over === idx ? 'border-studio-accent' : active ? 'border-studio-accent/60 bg-studio-select' : 'border-transparent hover:bg-studio-panel2'}`}>
                  {sortable && !query && <GripVertical size={14} className="shrink-0 cursor-grab text-studio-dim/60 group-hover:text-studio-dim" aria-hidden />}
                  <button className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => guard(() => open({ ...r, __saved: true }))}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-studio-border bg-studio-bg text-studio-dim">
                      {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : <Icon size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm text-white">{r[entity.titleKey] || '(untitled)'}</span>
                        {badge && <span className="shrink-0 rounded-sm bg-studio-border px-1 font-mono text-[9px] uppercase text-studio-text">{badge}</span>}
                      </span>
                      {entity.subtitle && <span className="block truncate text-xs text-studio-dim">{entity.subtitle(r)}</span>}
                    </span>
                  </button>
                  {sortable && !query && (
                    <span className="flex shrink-0 flex-col opacity-0 transition-opacity group-hover:opacity-100">
                      <button aria-label="Move up" disabled={idx === 0} onClick={() => void reorder(idx, idx - 1)} className="text-studio-dim hover:text-white disabled:opacity-20"><ArrowUp size={12} /></button>
                      <button aria-label="Move down" disabled={idx === rows.length - 1} onClick={() => void reorder(idx, idx + 1)} className="text-studio-dim hover:text-white disabled:opacity-20"><ArrowDown size={12} /></button>
                    </span>
                  )}
                </div>
              )
            })}
            {!rows.length && <p className="px-2 py-6 text-center text-sm text-studio-dim">Nothing here yet. Create your first {entity.noun}.</p>}
            {rows.length > 0 && !shown.length && <p className="px-2 py-6 text-center text-sm text-studio-dim">No matches.</p>}
          </div>
        </aside>
      )}
      {form || (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-studio-dim">
          <Icon size={32} className="opacity-40" />
          <p className="text-sm">Select a {entity.noun} to edit, or create a new one.</p>
        </div>
      )}
      <ConfirmModal open={!!pending} title="Discard unsaved changes?" text="You have edits that have not been saved. If you continue they will be lost." confirmLabel="Discard changes" danger
        onCancel={() => setPending(null)} onConfirm={() => { const fn = pending; setPending(null); fn?.() }} />
      <ConfirmModal open={delOpen} title={`Delete this ${entity.noun}?`} text="You can undo right after from the notification." confirmLabel="Delete" danger onCancel={() => setDelOpen(false)} onConfirm={() => void remove()} />
    </div>
  )
}
