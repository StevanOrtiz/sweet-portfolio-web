import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { accents } from '../../lib/palette'
import type { Work } from '../../types'

const INTERVAL = 5000
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

// Project page: the whole thing fits the viewport (image area flexes to the space left), the cover cycles
// through the images every 5 seconds, and a thumbnail strip + counter make extra images obvious.
export default function WorkDetail({ work, category, color, onOpen }: { work: Work; category?: string; color: string; onOpen: (w: Work, idx: number) => void }) {
  const n = work.images.length
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const playing = n > 1 && !hover && !reduced

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setIdx((i) => (i + 1) % n), INTERVAL)
    return () => clearTimeout(t)
  }, [idx, playing, n])

  const go = (d: number) => setIdx((i) => (i + d + n) % n)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 lg:flex-row lg:overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:flex-1">
        <div className="group relative h-[46vh] min-h-[220px] overflow-hidden rounded-sm border border-studio-border bg-black/50 lg:h-auto lg:flex-1"
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
          {/* Blurred copy of the current image fills the letterbox so any aspect ratio looks intentional. */}
          <div aria-hidden className="absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-2xl transition-[background-image] duration-700" style={{ backgroundImage: `url("${work.images[idx]}")` }} />
          {work.images.map((src, i) => (
            <img key={src + i} src={src} alt={i === idx ? work.title : ''} aria-hidden={i !== idx}
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700" style={{ opacity: i === idx ? 1 : 0 }} />
          ))}
          <button aria-label="Expand image" onClick={() => onOpen(work, idx)} className="absolute inset-0 cursor-zoom-in" tabIndex={-1} />
          {n > 1 && (
            <>
              <button aria-label="Previous image" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 opacity-70 transition hover:bg-black/80 hover:opacity-100"><ChevronLeft size={18} /></button>
              <button aria-label="Next image" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 opacity-70 transition hover:bg-black/80 hover:opacity-100"><ChevronRight size={18} /></button>
              <span className="pointer-events-none absolute bottom-2 left-2 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[11px]">{idx + 1} / {n}</span>
              {!reduced && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
                  <span key={idx} className="block h-full" style={{ background: color, animation: `carousel-progress ${INTERVAL}ms linear forwards`, animationPlayState: playing ? 'running' : 'paused' }} />
                </span>
              )}
            </>
          )}
          <button aria-label="Open full size" onClick={() => onOpen(work, idx)} className="absolute right-2 top-2 rounded-sm bg-black/60 p-1.5 opacity-70 transition hover:bg-black/80 hover:opacity-100"><Expand size={14} /></button>
        </div>

        {n > 1 && (
          <div className="flex shrink-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Project images">
            {work.images.map((src, i) => (
              <button key={src + i} role="tab" aria-selected={i === idx} aria-label={`Image ${i + 1}`} onClick={() => setIdx(i)}
                className="h-14 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition-all" style={{ borderColor: i === idx ? color : 'transparent', opacity: i === idx ? 1 : 0.55 }}>
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <aside className="shrink-0 space-y-3 lg:w-80 lg:overflow-y-auto lg:pr-1">
        <h2 className="text-2xl font-bold leading-tight text-white">{work.title}</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {category && <span className="rounded-sm px-1.5 py-0.5 font-mono text-studio-bg" style={{ background: color }}>{category}</span>}
          {work.tools && <span className="rounded-sm border px-1.5 py-0.5" style={{ borderColor: `${accents.ice}66`, color: accents.ice }}>{work.tools}</span>}
          {list(work.tags).map((t) => <span key={t} className="rounded-sm border px-1.5 py-0.5" style={{ borderColor: `${accents.steel}55`, color: accents.steel }}>{t}</span>)}
        </div>
        <p className="leading-relaxed text-studio-text/90">{work.description}</p>
        {n > 1 && <p className="font-mono text-xs text-studio-dim">{n} images. They change automatically; use the arrows or thumbnails to browse.</p>}
      </aside>
    </div>
  )
}
