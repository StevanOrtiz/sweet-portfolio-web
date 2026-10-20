import { useEffect, useRef, useState } from 'react'

export type LogLine = { id: number; text: string }

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const tone = (t: string) =>
  t.startsWith('[ok]') ? 'text-emerald-400' : t.startsWith('[warn]') ? 'text-amber-400' : t.startsWith('>') ? 'text-studio-text' : 'text-studio-dim'

// Types lines out one character at a time, like a terminal.
export default function Output({ log }: { log: LogLine[] }) {
  const [progress, setProgress] = useState<Record<number, number>>({})
  const end = useRef<HTMLDivElement>(null)

  const active = log.find((l) => (progress[l.id] ?? 0) < l.text.length)

  useEffect(() => {
    if (!active) return
    const step = reduced() ? active.text.length : 1
    const t = setTimeout(
      () => setProgress((p) => ({ ...p, [active.id]: Math.min(active.text.length, (p[active.id] ?? 0) + step) })),
      active.text.length > 40 ? 8 + Math.random() * 14 : 14 + Math.random() * 26,
    )
    return () => clearTimeout(t)
  }, [active, progress])

  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [progress, log])

  return (
    <div aria-label="Output" aria-live="off" className="h-full overflow-y-auto px-2 py-1 font-mono text-xs leading-5">
      {log.map((l) => {
        const n = progress[l.id] ?? 0
        return (
          <div key={l.id} className={tone(l.text)}>
            {l.text.slice(0, n)}
            {active?.id === l.id && <span className="cursor" />}
          </div>
        )
      })}
      {!active && <div className="text-studio-accent">$<span className="cursor ml-1" /></div>}
      <div ref={end} />
    </div>
  )
}
