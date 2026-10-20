import { useEffect, useRef, useState } from 'react'

export type LogLine = { id: number; ts: string; text: string }

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const tagStyle: Record<string, string> = {
  '[ok]': 'font-bold text-studio-ok', '[info]': 'text-studio-mint', '[net]': 'text-studio-violet', '[warn]': 'font-bold text-studio-amber',
  '[assets]': 'text-studio-rose', '[render]': 'text-studio-mint', '[gc]': 'text-studio-dim',
}
const token = /(\[(?:ok|info|net|warn|assets|render|gc)\]|\b(?:GET|POST)\b|\b2\d\d OK\b|\b\d+ms\b|"[^"]*"|\/[\w./?=*&-]+|\b\d+(?:\.\d+)? ?(?:MB|KB|fps)\b)/g

function colorize(text: string) {
  if (text.startsWith('$ ')) {
    return <><span className="text-studio-mint">$</span><span className="text-white">{text.slice(1)}</span></>
  }
  const lineTone = text.startsWith('[ok]') ? 'text-studio-ok' : text.startsWith('[warn]') ? 'text-amber-300' : 'text-studio-dim'
  return (
    <span className={lineTone}>
      {text.split(token).map((part, i) => {
        if (!part) return null
        if (tagStyle[part]) return <span key={i} className={tagStyle[part]}>{part}</span>
        if (part === 'GET') return <span key={i} className="font-semibold text-studio-accent">{part}</span>
        if (part === 'POST') return <span key={i} className="font-semibold text-studio-violet">{part}</span>
        if (/^2\d\d OK$/.test(part)) return <span key={i} className="font-bold text-studio-ok">{part}</span>
        if (/^\d+ms$/.test(part)) return <span key={i} className="text-studio-amber">{part}</span>
        if (/^\d.*(MB|KB|fps)$/.test(part)) return <span key={i} className="text-studio-mint">{part}</span>
        if (part.startsWith('"')) return <span key={i} className="text-studio-amber">{part}</span>
        if (part.startsWith('/')) return <span key={i} className="text-white/80">{part}</span>
        return part
      })}
    </span>
  )
}

// Types lines out one character at a time, like a terminal.
export default function Output({ log }: { log: LogLine[] }) {
  const [progress, setProgress] = useState<Record<number, number>>({})
  const end = useRef<HTMLDivElement>(null)

  const active = log.find((l) => (progress[l.id] ?? 0) < l.text.length)
  // Queued lines stay hidden until the typewriter reaches them.
  const visible = active ? log.slice(0, log.indexOf(active) + 1) : log

  useEffect(() => {
    if (!active) return
    const step = reduced() ? active.text.length : 1
    const t = setTimeout(
      () => setProgress((p) => ({ ...p, [active.id]: Math.min(active.text.length, (p[active.id] ?? 0) + step) })),
      active.text.length > 40 ? 4 + Math.random() * 8 : 10 + Math.random() * 18,
    )
    return () => clearTimeout(t)
  }, [active, progress])

  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [progress, log])

  return (
    <div aria-label="Output" aria-live="off" className="h-full overflow-y-auto px-2 py-1 font-mono text-xs leading-5">
      {visible.map((l) => {
        const n = progress[l.id] ?? 0
        return (
          <div key={l.id} className="whitespace-pre-wrap break-words">
            <span className="mr-2 select-none text-studio-dim/50">{l.ts}</span>
            {colorize(l.text.slice(0, n))}
            {active?.id === l.id && <span className="cursor" />}
          </div>
        )
      })}
      {!active && <div><span className="mr-2 select-none text-studio-dim/50">{log[log.length - 1]?.ts}</span><span className="text-studio-mint">$</span><span className="cursor ml-1" /></div>}
      <div ref={end} />
    </div>
  )
}
