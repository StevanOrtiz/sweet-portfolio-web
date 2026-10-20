import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import type { Work } from '../../types'
import Handles from './Handles'

type Props = {
  work: Work; index: number; color: string; category?: string
  onSelect: (id: string) => void; onOpen: (w: Work, idx: number) => void
}

export default function WorkCard({ work, index, color, category, onSelect, onOpen }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [i, setI] = useState(0)
  const touch = useRef(false)
  const n = work.images.length
  const step = (d: number) => (e: React.MouseEvent) => { e.stopPropagation(); setI((x) => (x + d + n) % n) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      tabIndex={0} role="group" aria-label={work.title}
      onPointerDown={(e) => { touch.current = e.pointerType !== 'mouse' }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setFlipped(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setFlipped(false) }}
      onFocus={() => setFlipped(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFlipped(false) }}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onSelect(`work:${work.id}`) }}
      onClick={() => (touch.current ? setFlipped((f) => !f) : onSelect(`work:${work.id}`))}
      className="group relative aspect-video cursor-pointer outline-none [perspective:1200px]"
    >
      <div className="flipper" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
        {/* front */}
        <div className="face border border-studio-border" style={flipped ? undefined : { boxShadow: `0 0 0 0 ${color}` }}>
          <img src={work.images[0]} alt={work.title} loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          {category && (
            <span className="absolute left-2 top-2 rounded-sm px-1.5 py-0.5 font-mono text-[10px] text-black" style={{ background: color }}>{category}</span>
          )}
          {n > 1 && <span className="absolute right-2 top-2 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[10px]">{n} images</span>}
          <span className="absolute inset-x-0 bottom-0 p-2 text-sm">{work.title}</span>
        </div>

        {/* back */}
        <div className="face face-back border" style={{ borderColor: color, boxShadow: `0 0 28px ${color}40` }} aria-hidden={!flipped}>
          {work.images.map((src, k) => (
            <img key={src + k} src={src} alt="" loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
              style={{ opacity: k === i ? 1 : 0, transform: k === i ? 'scale(1)' : 'scale(1.06)' }} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" style={{ top: '38%' }} />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="text-sm font-semibold text-white"><span className="mr-1.5 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: color }} />{work.title}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/85">{work.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <button tabIndex={flipped ? 0 : -1} onClick={(e) => { e.stopPropagation(); onSelect(`work:${work.id}`) }}
                className="rounded-sm px-2 py-0.5 text-[11px] font-semibold text-black transition-transform hover:scale-105" style={{ background: color }}>Details</button>
              <button tabIndex={flipped ? 0 : -1} aria-label="Expand image" onClick={(e) => { e.stopPropagation(); onOpen(work, i) }}
                className="rounded-sm bg-white/15 p-1 transition-colors hover:bg-white/30"><Expand size={12} /></button>
              {n > 1 && (
                <div className="ml-auto flex items-center gap-1" aria-hidden>
                  {work.images.map((_, k) => (
                    <span key={k} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 14 : 6, background: k === i ? color : '#ffffff55' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
          {n > 1 && (
            <>
              <button tabIndex={flipped ? 0 : -1} aria-label="Previous image" onClick={step(-1)}
                className="absolute left-1.5 top-[22%] -translate-y-1/2 rounded-full bg-black/55 p-1 transition-all hover:scale-110 hover:bg-black/80"><ChevronLeft size={16} /></button>
              <button tabIndex={flipped ? 0 : -1} aria-label="Next image" onClick={step(1)}
                className="absolute right-1.5 top-[22%] -translate-y-1/2 rounded-full bg-black/55 p-1 transition-all hover:scale-110 hover:bg-black/80"><ChevronRight size={16} /></button>
            </>
          )}
        </div>
      </div>
      <Handles />
    </motion.div>
  )
}
