import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, FileJson, ImagePlus, Loader2, Upload } from 'lucide-react'
import { repo } from '../../lib/repo'
import { useContent } from '../../lib/content'
import { exportWorks, parseBulk, resolveImage, templateJson } from '../../lib/bulk'
import type { Row } from '../../types'
import { useToast } from './ui'

type Mode = 'skip' | 'update'
type Result = { added: number; updated: number; skipped: number; categories: number; failed: string[] }

const download = (name: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

export default function BulkImport({ go }: { go: () => void }) {
  const { content, refresh } = useContent()
  const toast = useToast()
  const [src, setSrc] = useState('')
  const [uploaded, setUploaded] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('skip')
  const [checks, setChecks] = useState<Record<string, 'ok' | 'bad'>>({})
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)

  const parsed = useMemo(() => parseBulk(src), [src])
  const existing = (title: string) => content.works.find((w) => w.title.trim().toLowerCase() === title.toLowerCase())
  const resolved = useMemo(() => parsed.items.map((it) => it.work.images.map((r) => resolveImage(r, uploaded))), [parsed, uploaded])
  const known = new Set(content.categories.map((c) => c.name.toLowerCase()))

  // Quietly check that every referenced image actually loads.
  useEffect(() => {
    const urls = [...new Set(resolved.flat())].filter((u) => !checks[u]).slice(0, 300)
    let cancelled = false
    urls.forEach((u) => {
      const img = new Image()
      img.onload = () => !cancelled && setChecks((c) => ({ ...c, [u]: 'ok' }))
      img.onerror = () => !cancelled && setChecks((c) => ({ ...c, [u]: 'bad' }))
      img.src = u
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved])

  const loadFile = async (f: File | undefined) => { if (f) { setSrc(await f.text()); setResult(null) } }

  const uploadImages = async (list: FileList | null) => {
    const files = [...(list ?? [])].filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    const next = { ...uploaded }
    try {
      for (let i = 0; i < files.length; i++) {
        setUploading(`Uploading ${i + 1} of ${files.length}...`)
        next[files[i].name] = await repo.uploadImage(files[i])
      }
      setUploaded(next)
      setChecks({})
      toast.push({ kind: 'ok', text: `${files.length} image${files.length === 1 ? '' : 's'} uploaded` })
    } catch (e) { toast.push({ kind: 'error', text: (e as Error).message }) }
    setUploading(null)
  }

  const rows = parsed.items.map((it, i) => {
    const bad = resolved[i].filter((u) => checks[u] === 'bad')
    const issues = [...it.issues, ...bad.map((u) => ({ level: 'warn' as const, text: `Image not found: ${u.split('/').pop()}` }))]
    const status = it.issues.some((x) => x.level === 'error') ? 'error' : existing(it.work.title) ? (mode === 'update' ? 'update' : 'skip') : 'new'
    return { it, issues, status, thumb: resolved[i][0] }
  })
  const count = (s: string) => rows.filter((r) => r.status === s).length
  const newCats = [...new Set(rows.filter((r) => r.status !== 'error' && r.status !== 'skip' && r.it.work.category && !known.has(r.it.work.category.toLowerCase())).map((r) => r.it.work.category))]
  const importable = count('new') + count('update')

  const run = async () => {
    setResult(null)
    const res: Result = { added: 0, updated: 0, skipped: 0, categories: 0, failed: [] }
    setProgress({ done: 0, total: rows.length })
    try {
      const cats = await repo.list('categories')
      const works = await repo.list('works')
      const catId = new Map<string, string>(cats.map((c) => [String(c.name).toLowerCase(), c.id]))
      let sort = works.length
      for (let i = 0; i < rows.length; i++) {
        const { it, status } = rows[i]
        const w = it.work
        try {
          if (status === 'error' || status === 'skip') { res.skipped++; continue }
          let category_id: string | null = null
          if (w.category) {
            const key = w.category.toLowerCase()
            if (!catId.has(key)) {
              const created = await repo.upsert('categories', { name: w.category, sort: catId.size })
              catId.set(key, created.id)
              res.categories++
            }
            category_id = catId.get(key)!
          }
          const fields = { title: w.title, description: w.description, category_id, images: resolved[i], tools: w.tools, tags: w.tags, published: w.published }
          const match = works.find((x: Row) => String(x.title).trim().toLowerCase() === w.title.toLowerCase())
          if (match) { await repo.upsert('works', { ...match, ...fields }); res.updated++ }
          else { await repo.upsert('works', { ...fields, sort: sort++ }); res.added++ }
        } catch (e) { res.failed.push(`${w.title || `Entry ${i + 1}`}: ${(e as Error).message}`) }
        setProgress({ done: i + 1, total: rows.length })
      }
      await refresh()
    } catch (e) { res.failed.push((e as Error).message) }
    setProgress(null)
    setResult(res)
    toast.push({ kind: res.failed.length ? 'error' : 'ok', text: `Imported ${res.added + res.updated} project${res.added + res.updated === 1 ? '' : 's'}` })
  }

  const chip = (label: string, n: number, cls: string) => n > 0 && <span className={`rounded-sm border px-2 py-0.5 font-mono text-[11px] ${cls}`}>{n} {label}</span>

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bulk import</h1>
          <p className="mt-1 text-sm text-studio-dim">Add many works at once from a JSON file. Categories that do not exist are created automatically.</p>
        </div>

        <section className="space-y-3 rounded-md border border-studio-border bg-studio-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-auto font-mono text-xs uppercase tracking-widest text-studio-dim">1. Your JSON</h2>
            <button className="btn flex items-center gap-1.5" onClick={() => fileInput.current?.click()}><FileJson size={14} />Choose file</button>
            <button className="btn flex items-center gap-1.5" onClick={() => { setSrc(templateJson); setResult(null) }}>Load example</button>
            <button className="btn flex items-center gap-1.5" onClick={() => download('works.json', exportWorks(content))}><Download size={14} />Export current works</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { void loadFile(e.target.files?.[0]); e.target.value = '' }} />
          </div>
          <textarea className="field h-56 resize-y font-mono text-xs" spellCheck={false} placeholder='{ "works": [ { "title": "...", "description": "...", "category": "...", "images": ["file.png"] } ] }'
            value={src} onChange={(e) => { setSrc(e.target.value); setResult(null) }}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void loadFile(e.dataTransfer.files[0]) }} aria-label="Projects JSON" />
          {parsed.fatal && <p className="flex items-center gap-2 text-sm text-red-400"><AlertTriangle size={14} />{parsed.fatal}</p>}
          <details className="text-xs text-studio-dim">
            <summary className="cursor-pointer text-studio-text">Format reference</summary>
            <div className="mt-2 space-y-1 leading-relaxed">
              <p>An array of projects, or an object with a <code className="text-studio-accent">works</code> array. Each project:</p>
              <ul className="ml-4 list-disc">
                <li><code className="text-studio-accent">title</code> (required), <code className="text-studio-accent">description</code>, <code className="text-studio-accent">category</code> (by name), <code className="text-studio-accent">tools</code>, <code className="text-studio-accent">tags</code> (text or list), <code className="text-studio-accent">published</code> (true by default).</li>
                <li><code className="text-studio-accent">images</code>: list of file names, URLs or paths. The first one is the cover. Bare file names resolve to <code className="text-studio-accent">/uploads/name</code>, or to the images you drop below.</li>
                <li>A project with the same title as an existing one is skipped or updated, depending on your choice.</li>
              </ul>
            </div>
          </details>
        </section>

        <section className="space-y-3 rounded-md border border-studio-border bg-studio-panel p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-studio-dim">2. Images <span className="normal-case tracking-normal">(optional)</span></h2>
          <div role="button" tabIndex={0} onClick={() => imageInput.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && imageInput.current?.click()}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void uploadImages(e.dataTransfer.files) }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-studio-border px-4 py-5 text-sm text-studio-dim transition-colors hover:border-studio-accent/60 hover:text-white">
            {uploading ? <><Loader2 size={16} className="animate-spin" />{uploading}</> : <><ImagePlus size={16} />Drop the image files here. They are matched to the JSON by file name.</>}
            <input ref={imageInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void uploadImages(e.target.files); e.target.value = '' }} />
          </div>
          {Object.keys(uploaded).length > 0 && <p className="text-xs text-studio-dim">{Object.keys(uploaded).length} image{Object.keys(uploaded).length === 1 ? '' : 's'} ready: <span className="font-mono">{Object.keys(uploaded).slice(0, 6).join(', ')}{Object.keys(uploaded).length > 6 ? ', ...' : ''}</span></p>}
        </section>

        {rows.length > 0 && (
          <section className="space-y-3 rounded-md border border-studio-border bg-studio-panel p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-auto font-mono text-xs uppercase tracking-widest text-studio-dim">3. Preview</h2>
              {chip('new', count('new'), 'border-studio-ok/50 text-studio-ok')}
              {chip('update', count('update'), 'border-studio-accent/50 text-studio-accent')}
              {chip('skipped', count('skip'), 'border-studio-border text-studio-dim')}
              {chip('with errors', count('error'), 'border-red-400/50 text-red-300')}
              <label className="ml-2 flex items-center gap-2 text-xs text-studio-dim">If title exists
                <select className="field !w-auto !py-0.5 text-xs" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                  <option value="skip">Skip it</option><option value="update">Update it</option>
                </select>
              </label>
            </div>
            {newCats.length > 0 && <p className="text-xs text-studio-dim">New categories to create: <span className="text-studio-text">{newCats.join(', ')}</span></p>}
            <ul className="divide-y divide-studio-border overflow-hidden rounded-md border border-studio-border">
              {rows.map((r) => (
                <li key={r.it.index} className="flex items-start gap-3 bg-studio-bg/40 px-3 py-2.5">
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-studio-border bg-studio-bg text-studio-dim">
                    {r.thumb && checks[r.thumb] !== 'bad' ? <img src={r.thumb} alt="" className="h-full w-full object-cover" /> : <FileJson size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm text-white">{r.it.work.title || `(entry ${r.it.index + 1})`}</span>
                      <span className={`shrink-0 rounded-sm px-1.5 font-mono text-[9px] uppercase ${r.status === 'new' ? 'bg-studio-ok/20 text-studio-ok' : r.status === 'update' ? 'bg-studio-accent/20 text-studio-accent' : r.status === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-studio-border text-studio-dim'}`}>{r.status}</span>
                    </span>
                    <span className="block truncate text-xs text-studio-dim">{[r.it.work.category || 'no category', `${r.it.work.images.length} image${r.it.work.images.length === 1 ? '' : 's'}`, r.it.work.published ? 'published' : 'draft'].join(' · ')}</span>
                    {r.issues.map((x, k) => <span key={k} className={`block text-xs ${x.level === 'error' ? 'text-red-300' : 'text-studio-warn'}`}>{x.level === 'error' ? 'Error' : 'Note'}: {x.text}</span>)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 pt-1">
              <button className="btn-primary flex items-center gap-1.5 !px-4 !py-1.5" disabled={!!progress || importable === 0} onClick={() => void run()}>
                {progress ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{progress ? `Importing ${progress.done}/${progress.total}` : `Import ${importable} project${importable === 1 ? '' : 's'}`}
              </button>
              {progress && <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-studio-accent transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>}
            </div>
          </section>
        )}

        {result && (
          <section className={`rounded-md border p-4 ${result.failed.length ? 'border-red-400/40' : 'border-studio-ok/40'} bg-studio-panel`}>
            <div className="flex items-center gap-2 text-sm text-white">
              {result.failed.length ? <AlertTriangle size={18} className="text-red-300" /> : <CheckCircle2 size={18} className="text-studio-ok" />}
              {result.added} added, {result.updated} updated, {result.skipped} skipped{result.categories ? `, ${result.categories} categor${result.categories === 1 ? 'y' : 'ies'} created` : ''}.
            </div>
            {result.failed.map((f, i) => <p key={i} className="mt-1 text-xs text-red-300">{f}</p>)}
            <button className="btn mt-3" onClick={go}>Open Works</button>
          </section>
        )}
      </div>
    </div>
  )
}
