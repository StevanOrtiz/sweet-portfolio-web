import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Tool } from '../../types'
import { accents, pick } from '../../lib/palette'
import { toolIcon } from './icons'

export function LevelBar({ level, color }: { level: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, level))}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: color }} />
    </div>
  )
}

// Roblox-style 1-9 hotbar. Number keys and clicks select a slot and show its detail.
export default function Hotbar({ tools }: { tools: Tool[] }) {
  const slots = Array.from({ length: 9 }, (_, i) => tools[i] ?? null)
  const [active, setActive] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') return setActive(null)
      const n = Number(e.key)
      if (n >= 1 && n <= 9) {
        const tool = slots[n - 1]
        if (tool) setActive((a) => (a === tool.id ? null : tool.id))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slots])

  const shownId = hover ?? active
  const shown = tools.find((t) => t.id === shownId)
  const shownColor = pick(Math.max(0, tools.findIndex((t) => t.id === shownId)))

  return (
    <div className="relative z-10 mx-auto mb-4 mt-4 flex max-w-full flex-col items-center px-3">
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-72 max-w-[92vw] -translate-x-1/2">
        <AnimatePresence mode="wait">
          {shown && (
            <motion.div key={shown.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
              className="rounded-md border bg-studio-panel/95 p-3 shadow-xl backdrop-blur-sm" style={{ borderColor: shownColor }}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold" style={{ color: shownColor }}>{shown.name}</span>
                <span className="font-mono text-[10px] text-studio-dim">{shown.level}%</span>
              </div>
              <div className="mt-1.5"><LevelBar level={shown.level} color={shownColor} /></div>
              <p className="mt-1.5 line-clamp-2 text-[11px] text-studio-dim">{shown.note}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-2 backdrop-blur-sm" role="toolbar" aria-label="Toolbelt">
        {slots.map((tool, i) => {
          const on = tool && tool.id === active
          const color = tool ? pick(i) : accents.steel
          return (
            <button key={i} disabled={!tool} aria-pressed={!!on} aria-label={tool ? `${i + 1}: ${tool.name}` : `Empty slot ${i + 1}`}
              onClick={() => tool && setActive(on ? null : tool.id)}
              onPointerEnter={() => tool && setHover(tool.id)} onPointerLeave={() => setHover(null)}
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 enabled:hover:-translate-y-1"
              style={{
                borderColor: on ? color : tool ? '#e8ecf155' : '#e8ecf122',
                background: on ? `${color}30` : '#12151acc', color: tool ? color : '#8a94a355',
                transform: on ? 'translateY(-6px)' : undefined, boxShadow: on ? `0 8px 18px ${color}40` : undefined,
              }}>
              <span className="absolute left-1 top-0.5 font-mono text-[9px] text-studio-text/70">{i + 1}</span>
              {tool && toolIcon(tool.icon)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
