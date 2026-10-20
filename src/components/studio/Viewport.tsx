import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, ChevronLeft, ChevronRight, Code, Code2, Briefcase, Globe, Mail, MessageCircle, Sun, Map as MapIcon, Link2, X } from 'lucide-react'
import { useContent } from '../../lib/content'
import type { LinkItem, Work } from '../../types'

const serviceIcons: Record<string, React.ReactNode> = {
  box: <Box />, map: <MapIcon />, sun: <Sun />, code: <Code />,
}
export const linkIcon = (type: string) => {
  switch (type) {
    case 'discord': return <MessageCircle size={18} />
    case 'email': return <Mail size={18} />
    case 'github': return <Code2 size={18} />
    case 'linkedin': return <Briefcase size={18} />
    case 'roblox': case 'x': return <Globe size={18} />
    default: return <Link2 size={18} />
  }
}

const cubes = [
  { l: '8%', t: '18%', s: 46, d: 0 }, { l: '84%', t: '14%', s: 62, d: 1.2 }, { l: '16%', t: '62%', s: 34, d: 2.4 },
  { l: '76%', t: '58%', s: 50, d: 0.6 }, { l: '92%', t: '40%', s: 26, d: 3 }, { l: '3%', t: '40%', s: 28, d: 1.8 },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } }

function Handles() {
  return <span className="handles pointer-events-none absolute inset-0"><i /><i /><i /><i /></span>
}

function WorkCard({ work, index, onOpen, onSelect }: { work: Work; index: number; onOpen: (w: Work) => void; onSelect: (id: string) => void }) {
  return (
    <motion.button
      layout initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect(`work:${work.id}`)} onDoubleClick={() => onOpen(work)}
      className="group relative aspect-video rounded-sm border border-studio-border text-left outline-none transition-shadow hover:border-studio-accent hover:shadow-[0_0_24px_#0d99ff33] focus-visible:border-studio-accent"
    >
      <span className="absolute inset-0 overflow-hidden">
        <img src={work.images[0]} alt={work.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 to-transparent p-2 text-sm">
          {work.title}
          <span className="translate-y-1 font-mono text-[10px] text-studio-accent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">dbl-click to expand</span>
        </span>
      </span>
      <Handles />
    </motion.button>
  )
}

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

export default function Viewport({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { content } = useContent()
  const [lightbox, setLightbox] = useState<{ work: Work; idx: number } | null>(null)
  const published = content.works.filter((w) => w.published)
  const open = (w: Work, idx = 0) => setLightbox({ work: w, idx })

  let body: React.ReactNode
  if (selected === 'home') {
    body = (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="floor" aria-hidden />
        <div className="orb" aria-hidden />
        {cubes.map((c, i) => (
          <div key={i} aria-hidden className="cube" style={{ left: c.l, top: c.t, width: c.s, height: c.s, animationDelay: `${c.d}s` }} />
        ))}
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 flex flex-col items-center">
          <motion.p variants={rise} className="font-mono text-sm text-studio-accent">{content.profile.tagline}</motion.p>
          <motion.div variants={rise} className="gizmo mt-5">
            <i /><i /><i /><i />
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{content.texts.hero_title}</h1>
          </motion.div>
          <motion.p variants={rise} className="mt-6 max-w-xl text-studio-dim">{content.texts.hero_subtitle}</motion.p>
          <motion.div variants={rise} className="mt-8 flex gap-3">
            <button className="btn-primary" onClick={() => onSelect('gallery')}>Open Gallery</button>
            <button className="btn" onClick={() => onSelect('contact')}>Contact</button>
          </motion.div>
        </motion.div>
      </div>
    )
  } else if (selected === 'gallery' || selected.startsWith('cat:')) {
    const catId = selected.startsWith('cat:') ? selected.slice(4) : null
    const list = catId ? published.filter((w) => w.category_id === catId) : published
    body = (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((w, i) => <WorkCard key={w.id} work={w} index={i} onOpen={open} onSelect={onSelect} />)}
        {!list.length && <p className="text-studio-dim">Nothing here yet.</p>}
      </div>
    )
  } else if (selected.startsWith('work:')) {
    const w = published.find((x) => x.id === selected.slice(5))
    body = w ? (
      <div className="p-4">
        <button onClick={() => open(w)} className="group relative block w-full rounded-sm border border-studio-border hover:border-studio-accent">
          <img src={w.images[0]} alt={w.title} className="w-full" />
          <Handles />
        </button>
        <h2 className="mt-3 text-xl font-semibold">{w.title}</h2>
        <p className="mt-1 text-studio-dim">{w.description}</p>
        {w.images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {w.images.slice(1).map((src, i) => (
              <button key={src} onClick={() => open(w, i + 1)} className="overflow-hidden rounded-sm border border-studio-border hover:border-studio-accent"><img src={src} alt="" className="aspect-video w-full object-cover" /></button>
            ))}
          </div>
        )}
      </div>
    ) : null
  } else if (selected === 'services') {
    body = (
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 p-4 sm:grid-cols-2">
        {content.services.map((s) => (
          <motion.div key={s.id} variants={rise} whileHover={{ y: -3 }} className="group relative rounded-sm border border-studio-border bg-studio-panel p-4 transition-shadow hover:border-studio-accent hover:shadow-[0_0_24px_#0d99ff33]">
            <div className="text-studio-accent">{serviceIcons[s.icon] ?? <Box />}</div>
            <h3 className="mt-2 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-studio-dim">{s.description}</p>
            <Handles />
          </motion.div>
        ))}
      </motion.div>
    )
  } else if (selected === 'about') {
    const p = content.profile
    body = (
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl p-6">
        {p.avatar && <motion.img variants={rise} src={p.avatar} alt={p.name} className="mb-4 h-24 w-24 rounded-sm border border-studio-accent object-cover" />}
        <motion.h2 variants={rise} className="text-2xl font-bold">{p.name}</motion.h2>
        <motion.p variants={rise} className="font-mono text-sm text-studio-accent">{p.tagline}</motion.p>
        <motion.p variants={rise} className="mt-4 whitespace-pre-line text-studio-text">{p.bio}</motion.p>
        <motion.div variants={rise} className="mt-4 flex flex-wrap gap-2">
          {p.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
            <span key={s} className="rounded-sm border border-studio-border bg-studio-panel px-2 py-0.5 text-xs transition hover:border-studio-accent">{s}</span>
          ))}
        </motion.div>
      </motion.div>
    )
  } else {
    body = (
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-xl p-6">
        <motion.h2 variants={rise} className="text-2xl font-bold">Contact</motion.h2>
        <motion.p variants={rise} className="mt-2 text-studio-dim">{content.texts.contact_intro}</motion.p>
        <ul className="mt-4 space-y-2">
          {content.links.map((l: LinkItem) => (
            <motion.li key={l.id} variants={rise}>
              <a href={l.url} target="_blank" rel="noreferrer" className="group relative flex items-center gap-3 rounded-sm border border-studio-border bg-studio-panel px-3 py-2 transition hover:translate-x-1 hover:border-studio-accent">
                <span className="text-studio-accent">{linkIcon(l.type)}</span>{l.label}
                <Handles />
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    )
  }

  return (
    <div className={`relative h-full overflow-y-auto ${selected === 'home' ? '' : 'grid-floor'}`}>
      <AnimatePresence mode="wait">
        <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="h-full">
          {body}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {lightbox && <Lightbox key="lb" work={lightbox.work} start={lightbox.idx} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  )
}
