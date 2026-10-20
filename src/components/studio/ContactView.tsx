import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Copy, ExternalLink, X } from 'lucide-react'
import type { LinkItem } from '../../types'
import { defaultNote, linkColor } from '../../lib/palette'
import { linkIcon } from './icons'

function ContactWindow({ link, onClose }: { link: LinkItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const color = linkColor(link.type)
  const note = link.note?.trim() || defaultNote(link.type)
  const copy = async () => {
    try { await navigator.clipboard.writeText(link.url.replace(/^mailto:/, '')); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard unavailable */ }
  }
  return (
    <motion.div
      role="dialog" aria-label={link.label}
      initial={{ opacity: 0, x: 40, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 30, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="absolute right-4 top-4 z-20 w-80 overflow-hidden rounded-sm border bg-studio-panel shadow-2xl max-md:inset-x-3 max-md:bottom-3 max-md:top-auto max-md:w-auto"
      style={{ borderColor: color, boxShadow: `0 12px 40px #000a, 0 0 30px ${color}22` }}
    >
      <div className="flex items-center gap-2 border-b border-studio-border bg-studio-panel2 px-2 py-1.5 text-xs">
        <span style={{ color }}>{linkIcon(link.type, 14)}</span>
        <span className="font-semibold uppercase tracking-wide">{link.label}</span>
        <button aria-label="Close" onClick={onClose} className="ml-auto rounded p-0.5 text-studio-dim transition-colors hover:bg-studio-border hover:text-white"><X size={14} /></button>
      </div>
      <div className="space-y-3 p-3">
        {link.type === 'discord' && (
          <span className="inline-block rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black" style={{ background: color }}>FASTEST REPLIES</span>
        )}
        <p className="text-sm leading-snug text-studio-text">{note}</p>
        <div className="truncate rounded-sm border border-studio-border bg-studio-bg px-2 py-1 font-mono text-xs text-studio-dim">{link.url.replace(/^mailto:/, '')}</div>
        <div className="flex gap-2">
          <a href={link.url} target="_blank" rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]" style={{ background: color }}>
            Open {link.label} <ExternalLink size={14} />
          </a>
          <button onClick={copy} className="btn flex items-center gap-1" aria-label="Copy link">
            {copied ? <Check size={14} className="text-studio-mint" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ContactView({ links, intro, onLog }: { links: LinkItem[]; intro: string; onLog: (t: string) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  const link = links.find((l) => l.id === sel)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const choose = (l: LinkItem) => {
    if (sel === l.id) { setSel(null); return }
    setSel(l.id)
    onLog(`$ open channel "${l.label}"`)
  }

  return (
    <div className="relative h-full">
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="max-w-md p-6">
        <motion.h2 variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} className="text-2xl font-bold">Contact</motion.h2>
        <motion.p variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} className="mt-2 text-studio-dim">{intro}</motion.p>
        <ul className="mt-4 space-y-2">
          {links.map((l) => {
            const color = linkColor(l.type)
            const active = sel === l.id
            return (
              <motion.li key={l.id} variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}>
                <button onClick={() => choose(l)} aria-pressed={active}
                  className="group relative flex w-full items-center gap-3 overflow-hidden rounded-sm border border-studio-border bg-studio-panel px-3 py-2 text-left transition-all hover:translate-x-1"
                  style={{ borderColor: active ? color : undefined, boxShadow: active ? `0 0 20px ${color}30` : undefined }}>
                  <span className="absolute inset-y-0 left-0 w-0.5 transition-all group-hover:w-1" style={{ background: color }} />
                  <span className="rounded-sm p-1" style={{ color, background: `${color}1c` }}>{linkIcon(l.type, 18)}</span>
                  <span className="flex-1">{l.label}</span>
                  <ChevronRight size={16} className={`text-studio-dim transition-transform ${active ? 'translate-x-1' : ''}`} style={active ? { color } : undefined} />
                </button>
              </motion.li>
            )
          })}
        </ul>
        {!link && <p className="mt-4 font-mono text-xs text-studio-dim">Select a channel to open its window.</p>}
      </motion.div>
      <AnimatePresence>{link && <ContactWindow key={link.id} link={link} onClose={() => setSel(null)} />}</AnimatePresence>
    </div>
  )
}
