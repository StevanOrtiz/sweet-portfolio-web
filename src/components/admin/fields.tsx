import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Star, Upload, X } from 'lucide-react'
import { repo } from '../../lib/repo'
import type { Row } from '../../types'
import { linkIcon, serviceIcons, toolIcon } from '../studio/icons'
import { linkTypes, type Field } from './schema'
import { Switch, useToast } from './ui'

const inputCls = (err?: string) => `field mt-1 ${err ? '!border-red-400' : ''}`

function ImageDrop({ multi, onUrls, children }: { multi: boolean; onUrls: (urls: string[]) => void; children?: React.ReactNode }) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)

  const upload = async (list: FileList | File[]) => {
    const files = [...list].filter((f) => f.type.startsWith('image/'))
    if (!files.length) return toast.push({ kind: 'error', text: 'Only image files are supported' })
    const urls: string[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}...`)
        urls.push(await repo.uploadImage(files[i]))
      }
      onUrls(multi ? urls : urls.slice(0, 1))
    } catch (e) { toast.push({ kind: 'error', text: (e as Error).message }) }
    setProgress(null)
  }

  return (
    <div>
      <div role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) void upload(e.dataTransfer.files) }}
        className={`mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-5 text-sm transition-colors ${over ? 'border-studio-accent bg-studio-accent/10 text-white' : 'border-studio-border text-studio-dim hover:border-studio-accent/60 hover:text-white'}`}>
        {progress ? <><Loader2 size={16} className="animate-spin" />{progress}</> : <><Upload size={16} />{multi ? 'Drop images here or click to browse' : 'Drop an image or click to browse'}</>}
        <input ref={input} type="file" accept="image/*" multiple={multi} hidden onChange={(e) => { if (e.target.files) void upload(e.target.files); e.target.value = '' }} />
      </div>
      {children}
    </div>
  )
}

function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const drag = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return
    const next = [...value]
    next.splice(to, 0, next.splice(from, 1)[0])
    onChange(next)
  }
  return (
    <ImageDrop multi onUrls={(urls) => onChange([...value, ...urls])}>
      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((src, i) => (
            <div key={src + i} draggable onDragStart={() => { drag.current = i }} onDragOver={(e) => { e.preventDefault(); setOver(i) }} onDragLeave={() => setOver(null)}
              onDrop={() => { setOver(null); if (drag.current !== null) move(drag.current, i); drag.current = null }}
              className={`group relative aspect-video cursor-grab overflow-hidden rounded-md border bg-studio-bg ${over === i ? 'border-studio-accent' : 'border-studio-border'}`}>
              <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
              {i === 0 ? <span className="absolute left-1 top-1 rounded-sm bg-studio-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-studio-bg">COVER</span>
                : <button type="button" title="Make cover" onClick={() => move(i, 0)} className="absolute left-1 top-1 rounded-sm bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100"><Star size={12} /></button>}
              <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-sm bg-black/70 p-1 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"><X size={12} /></button>
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, i - 1)} className="px-1 disabled:opacity-25"><ChevronLeft size={14} /></button>
                <button type="button" aria-label="Move right" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} className="px-1 disabled:opacity-25"><ChevronRight size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ImageDrop>
  )
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <ImageDrop multi={false} onUrls={(u) => onChange(u[0])}>
      {value && (
        <div className="group relative mt-3 inline-block">
          <img src={value} alt="" className="h-24 rounded-md border border-studio-border object-cover" />
          <button type="button" aria-label="Remove image" onClick={() => onChange('')} className="absolute right-1 top-1 rounded-sm bg-black/70 p-1 hover:text-red-300"><X size={12} /></button>
        </div>
      )}
    </ImageDrop>
  )
}

export type FieldCtx = { categories: Row[] }

export function FieldRenderer({ field, value, error, ctx, onChange }: { field: Field; value: any; error?: string; ctx: FieldCtx; onChange: (v: any) => void }) {
  const t = field.type ?? 'text'
  const label = (
    <span className="flex items-baseline gap-1.5 text-sm text-studio-text">
      {field.label}{field.required && <span className="text-studio-accent" title="Required">*</span>}
    </span>
  )
  const foot = (
    <>
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : field.help ? <span className="mt-1 block text-xs text-studio-dim">{field.help}</span> : null}
    </>
  )

  if (t === 'bool') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border border-studio-border bg-studio-bg/40 px-3 py-2.5">
        <div>{label}{foot}</div>
        <Switch checked={!!value} onChange={onChange} label={field.label} />
      </div>
    )
  }

  return (
    <div>
      <label className="block">
        {label}
        {t === 'text' && <input className={inputCls(error)} value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />}
        {t === 'textarea' && <textarea className={inputCls(error) + ' min-h-[96px] resize-y'} value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />}
        {t === 'category' && (
          <select className={inputCls(error)} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
            <option value="">No category</option>
            {ctx.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {t === 'level' && (
          <div className="mt-1 flex items-center gap-3">
            <input type="range" min={0} max={100} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="h-1 flex-1 accent-[#8cc8e8]" />
            <input type="number" min={0} max={100} className="field !w-16 text-center" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
          </div>
        )}
      </label>
      {t === 'images' && <div className="mt-1"><ImagesField value={value ?? []} onChange={onChange} /></div>}
      {t === 'image' && <div className="mt-1"><ImageField value={value ?? ''} onChange={onChange} /></div>}
      {t === 'linktype' && (
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={field.label}>
          {linkTypes.map((lt) => (
            <button key={lt} type="button" role="radio" aria-checked={value === lt} onClick={() => onChange(lt)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs capitalize transition-colors ${value === lt ? 'border-studio-accent bg-studio-accent/15 text-white' : 'border-studio-border text-studio-dim hover:text-white'}`}>
              {linkIcon(lt, 14)}{lt}
            </button>
          ))}
        </div>
      )}
      {t === 'icon' && (
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={field.label}>
          {field.options!.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={value === o} aria-label={o} title={o} onClick={() => onChange(o)}
              className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${value === o ? 'border-studio-accent bg-studio-accent/15 text-studio-accent' : 'border-studio-border text-studio-dim hover:text-white'}`}>
              {field.iconKind === 'tool' ? toolIcon(o, 18) : <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{serviceIcons[o]}</span>}
            </button>
          ))}
        </div>
      )}
      {foot}
    </div>
  )
}
