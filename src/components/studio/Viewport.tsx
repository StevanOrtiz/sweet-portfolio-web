import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useContent } from '../../lib/content'
import { accents, pick } from '../../lib/palette'
import type { Work } from '../../types'
import Handles from './Handles'
import WorkCard from './WorkCard'
import ContactView from './ContactView'
import HomeScene from './HomeScene'
import AboutView from './AboutView'
import { serviceIcons } from './icons'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } }

function Lightbox({ work, start, onClose }: { work: Work; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const n = work.images.length
  const go = (d: number) => setI((x) => (x + d + n) % n)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  return (
    <motion.div
      role="dialog" aria-modal="true" aria-label={work.title}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={onClose}
    >
      <button aria-label="Close" className="absolute right-4 top-4 text-white hover:text-studio-accent"><X /></button>
      <AnimatePresence mode="wait">
        <motion.img
          key={i} src={work.images[i]} alt={work.title}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}
          className="max-h-[80vh] max-w-full rounded-sm border border-studio-border object-contain" onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>
      <div className="mt-3 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="font-semibold">{work.title}</div>
        {n > 1 && <div className="font-mono text-xs text-studio-dim">{i + 1} / {n}</div>}
      </div>
      {n > 1 && (
        <>
          <button aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded bg-black/50 p-2 hover:text-studio-accent" onClick={(e) => { e.stopPropagation(); go(-1) }}><ChevronLeft /></button>
          <button aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-black/50 p-2 hover:text-studio-accent" onClick={(e) => { e.stopPropagation(); go(1) }}><ChevronRight /></button>
        </>
      )}
    </motion.div>
  )
}

type Props = { selected: string; onSelect: (id: string) => void; onLog: (t: string) => void }

export default function Viewport({ selected, onSelect, onLog }: Props) {
  const { content } = useContent()
  const [lightbox, setLightbox] = useState<{ work: Work; idx: number } | null>(null)
  const frame = useRef<HTMLDivElement>(null)
  const published = content.works.filter((w) => w.published)
  const open = (w: Work, idx = 0) => setLightbox({ work: w, idx })
  const catIndex = (id: string | null) => Math.max(0, content.categories.findIndex((c) => c.id === id))
  const catName = (id: string | null) => content.categories.find((c) => c.id === id)?.name

  const onMove = (e: React.MouseEvent) => {
    const r = frame.current?.getBoundingClientRect()
    if (!r || !frame.current) return
    frame.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    frame.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  let body: React.ReactNode
  if (selected === 'home') {
    body = <HomeScene onSelect={onSelect} />
  } else if (selected === 'gallery' || selected.startsWith('cat:')) {
    const catId = selected.startsWith('cat:') ? selected.slice(4) : null
    const list = catId ? published.filter((w) => w.category_id === catId) : published
    body = (
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => onSelect('gallery')} className="rounded-sm border px-2.5 py-1 text-xs transition-colors"
            style={{ borderColor: !catId ? accents.coral : '#43386b', color: !catId ? '#000' : undefined, background: !catId ? accents.coral : 'transparent' }}>All</button>
          {content.categories.map((c, i) => {
            const on = catId === c.id
            return (
              <button key={c.id} onClick={() => onSelect(`cat:${c.id}`)} className="rounded-sm border px-2.5 py-1 text-xs transition-colors hover:brightness-125"
                style={{ borderColor: on ? pick(i) : `${pick(i)}66`, color: on ? '#000' : pick(i), background: on ? pick(i) : 'transparent' }}>{c.name}</button>
            )
          })}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((w, i) => (
            <WorkCard key={w.id} work={w} index={i} color={pick(catIndex(w.category_id))} category={catName(w.category_id)} onSelect={onSelect} onOpen={open} />
          ))}
          {!list.length && <p className="text-studio-dim">Nothing here yet.</p>}
        </div>
        <p className="mt-4 font-mono text-xs text-studio-dim">Hover a card to flip it and browse the project images.</p>
      </div>
    )
  } else if (selected.startsWith('work:')) {
    const w = published.find((x) => x.id === selected.slice(5))
    const color = pick(catIndex(w?.category_id ?? null))
    body = w ? (
      <div className="p-4">
        <button onClick={() => open(w)} className="group relative block w-full rounded-sm border border-studio-border hover:border-studio-accent">
          <img src={w.images[0]} alt={w.title} className="w-full" />
          <Handles />
        </button>
        <h2 className="mt-3 text-xl font-semibold">{w.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {catName(w.category_id) && <span className="rounded-sm px-1.5 py-0.5 font-mono text-black" style={{ background: color }}>{catName(w.category_id)}</span>}
          {w.tools && <span className="rounded-sm border px-1.5 py-0.5" style={{ borderColor: `${accents.mint}66`, color: accents.mint }}>{w.tools}</span>}
          {w.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
            <span key={t} className="rounded-sm border px-1.5 py-0.5" style={{ borderColor: `${accents.rose}55`, color: accents.rose }}>{t}</span>
          ))}
        </div>
        <p className="mt-3 text-studio-dim">{w.description}</p>
        {w.images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {w.images.slice(1).map((src, i) => (
              <button key={src} onClick={() => open(w, i + 1)} className="overflow-hidden rounded-sm border border-studio-border transition-all hover:-translate-y-0.5 hover:border-studio-accent"><img src={src} alt="" className="aspect-video w-full object-cover" /></button>
            ))}
          </div>
        )}
      </div>
    ) : null
  } else if (selected === 'services') {
    body = (
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 p-4 sm:grid-cols-2">
        {content.services.map((s, i) => (
          <motion.div key={s.id} variants={rise} whileHover={{ y: -4 }} className="group relative rounded-sm border border-studio-border bg-studio-panel p-4 transition-shadow" style={{ ['--c' as string]: pick(i) }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 26px ${pick(i)}33`; e.currentTarget.style.borderColor = pick(i) }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '' }}>
            <div className="inline-block rounded-sm p-1.5" style={{ color: pick(i), background: `${pick(i)}1c` }}>{serviceIcons[s.icon] ?? <Box />}</div>
            <h3 className="mt-2 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-studio-dim">{s.description}</p>
          </motion.div>
        ))}
      </motion.div>
    )
  } else if (selected === 'about') {
    body = <AboutView />
  } else {
    body = <ContactView links={content.links} intro={content.texts.contact_intro} onLog={onLog} />
  }

  return (
    <div ref={frame} onMouseMove={onMove} className="spot relative h-full">
      <div className={`relative z-[1] h-full overflow-y-auto ${selected === 'home' ? '' : 'grid-floor'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={selected === 'home' ? 'h-full' : 'min-h-full'}>
            {body}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {lightbox && <Lightbox key="lb" work={lightbox.work} start={lightbox.idx} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  )
}
