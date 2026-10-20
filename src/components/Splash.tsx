import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { accents } from '../lib/palette'

const steps = ['Initializing studio', 'Loading workspace', 'Streaming assets', 'Compiling scripts', 'Ready']
const faces = ['translateZ(var(--h))', 'rotateY(180deg) translateZ(var(--h))', 'rotateY(90deg) translateZ(var(--h))', 'rotateY(-90deg) translateZ(var(--h))', 'rotateX(90deg) translateZ(var(--h))', 'rotateX(-90deg) translateZ(var(--h))']

function Cube({ size, color, reverse }: { size: number; color: string; reverse?: boolean }) {
  return (
    <div className="scene absolute" style={{ width: size, height: size }}>
      <div className={`cube3d ${reverse ? 'rev' : ''}`} style={{ ['--h' as string]: `${size / 2}px` }}>
        {faces.map((t, i) => <div key={i} className="f" style={{ transform: t, borderColor: color, background: `${color}14`, boxShadow: `inset 0 0 22px ${color}40` }} />)}
      </div>
    </div>
  )
}

export default function Splash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        const cap = ready ? 100 : 92
        return p >= cap ? p : Math.min(cap, p + (p < 55 ? 1.7 : p < 85 ? 1 : 0.7))
      })
    }, 30)
    return () => clearInterval(t)
  }, [ready])

  useEffect(() => {
    if (pct < 100) return
    const t = setTimeout(onDone, 550)
    return () => clearTimeout(t)
  }, [pct, onDone])

  const stage = steps[Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length))]

  return (
    <motion.div
      role="status" aria-label="Loading"
      initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }} transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#121214]"
    >
      <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full opacity-60" style={{ background: `radial-gradient(circle, ${accents.violet}40, transparent 65%)`, animation: 'drift 9s ease-in-out infinite' }} />
      <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full opacity-60" style={{ background: `radial-gradient(circle, ${accents.blue}40, transparent 65%)`, animation: 'drift 11s ease-in-out infinite reverse' }} />
      <div className="absolute bottom-10 right-1/3 h-[300px] w-[300px] rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${accents.amber}30, transparent 65%)`, animation: 'drift 13s ease-in-out infinite' }} />
      <div className="floor" aria-hidden />

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative z-10 flex h-40 w-40 items-center justify-center">
        <Cube size={104} color={accents.blue} />
        <Cube size={52} color={accents.amber} reverse />
      </motion.div>

      <h1 className="relative z-10 mt-8 flex font-mono text-3xl font-bold tracking-[0.3em] sm:text-5xl" aria-label="SweetKanmi">
        {'SWEETKANMI'.split('').map((ch, i) => (
          <motion.span key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }} className="grad-text">{ch}</motion.span>
        ))}
      </h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="relative z-10 mt-2 font-mono text-xs uppercase tracking-[0.35em] text-studio-dim">Roblox Builder &amp; 3D Modeler</motion.p>

      <div className="relative z-10 mt-10 w-72 sm:w-96">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="splash-bar h-full rounded-full" style={{ width: `${pct}%`, transition: 'width .08s linear' }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs text-studio-dim">
          <span>{stage}<span className="cursor" /></span>
          <span style={{ color: accents.amber }}>{Math.floor(pct)}%</span>
        </div>
      </div>

      <button onClick={onDone} className="absolute bottom-5 right-5 z-10 font-mono text-xs text-studio-dim transition-colors hover:text-white">Skip →</button>
    </motion.div>
  )
}
