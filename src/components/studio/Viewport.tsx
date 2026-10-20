import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Code, Code2, Globe, Briefcase, Mail, MessageCircle, Sun, Map as MapIcon, Link2, X } from 'lucide-react'
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

function WorkCard({ work, onOpen, onSelect }: { work: Work; onOpen: (w: Work) => void; onSelect: (id: string) => void }) {
  return (
    <motion.button
      layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(`work:${work.id}`)} onDoubleClick={() => onOpen(work)}
      className="group relative aspect-video overflow-hidden rounded border border-studio-border text-left outline-none focus-visible:border-studio-accent"
    >
      <img src={work.images[0]} alt={work.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-sm">{work.title}</span>
      <span className="pointer-events-none absolute inset-0 border-2 border-studio-accent opacity-0 group-hover:opacity-100" />
    </motion.button>
  )
}

export default function Viewport({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { content } = useContent()
  const [lightbox, setLightbox] = useState<Work | null>(null)
  const [imgIdx, setImgIdx] = useState(0)
  const published = content.works.filter((w) => w.published)
  const open = (w: Work) => { setImgIdx(0); setLightbox(w) }

  let body: React.ReactNode
  if (selected === 'home') {
    body = (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-sm text-studio-accent">{content.profile.tagline}</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-6xl">{content.texts.hero_title}</h1>
        <p className="mt-4 max-w-xl text-studio-dim">{content.texts.hero_subtitle}</p>
        <button className="btn-primary mt-8" onClick={() => onSelect('gallery')}>Open Gallery</button>
      </div>
    )
  } else if (selected === 'gallery' || selected.startsWith('cat:')) {
    const catId = selected.startsWith('cat:') ? selected.slice(4) : null
    const list = catId ? published.filter((w) => w.category_id === catId) : published
    body = (
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((w) => <WorkCard key={w.id} work={w} onOpen={open} onSelect={onSelect} />)}
        {!list.length && <p className="text-studio-dim">Nothing here yet.</p>}
      </div>
    )
  } else if (selected.startsWith('work:')) {
    const w = published.find((x) => x.id === selected.slice(5))
    body = w ? (
      <div className="p-4">
        <button onClick={() => open(w)} className="block w-full overflow-hidden rounded border border-studio-border">
          <img src={w.images[0]} alt={w.title} className="w-full" />
        </button>
        <h2 className="mt-3 text-xl font-semibold">{w.title}</h2>
        <p className="mt-1 text-studio-dim">{w.description}</p>
        {w.images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {w.images.slice(1).map((src, i) => (
              <button key={src} onClick={() => { setImgIdx(i + 1); setLightbox(w) }}><img src={src} alt="" className="aspect-video w-full rounded border border-studio-border object-cover" /></button>
            ))}
          </div>
        )}
      </div>
    ) : null
  } else if (selected === 'services') {
    body = (
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {content.services.map((s) => (
          <div key={s.id} className="rounded border border-studio-border bg-studio-panel p-4">
            <div className="text-studio-accent">{serviceIcons[s.icon] ?? <Box />}</div>
            <h3 className="mt-2 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-studio-dim">{s.description}</p>
          </div>
        ))}
      </div>
    )
  } else if (selected === 'about') {
    const p = content.profile
    body = (
      <div className="max-w-2xl p-6">
        {p.avatar && <img src={p.avatar} alt={p.name} className="mb-4 h-24 w-24 rounded border border-studio-border object-cover" />}
        <h2 className="text-2xl font-bold">{p.name}</h2>
        <p className="font-mono text-sm text-studio-accent">{p.tagline}</p>
        <p className="mt-4 whitespace-pre-line text-studio-text">{p.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
            <span key={s} className="rounded border border-studio-border bg-studio-panel px-2 py-0.5 text-xs">{s}</span>
          ))}
        </div>
      </div>
    )
  } else {
    body = (
      <div className="max-w-xl p-6">
        <h2 className="text-2xl font-bold">Contact</h2>
        <p className="mt-2 text-studio-dim">{content.texts.contact_intro}</p>
        <ul className="mt-4 space-y-2">
          {content.links.map((l: LinkItem) => (
            <li key={l.id}>
              <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded border border-studio-border bg-studio-panel px-3 py-2 hover:border-studio-accent">
                <span className="text-studio-accent">{linkIcon(l.type)}</span>{l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="grid-floor relative h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
          {body}
        </motion.div>
      </AnimatePresence>
      {lightbox && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button aria-label="Close" className="absolute right-4 top-4 text-white"><X /></button>
          <img src={lightbox.images[imgIdx]} alt={lightbox.title} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
