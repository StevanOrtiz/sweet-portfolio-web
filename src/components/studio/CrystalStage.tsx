import { Suspense, lazy, useCallback, useState } from 'react'
import { accents } from '../../lib/palette'

const CrystalCanvas = lazy(() => import('./CrystalCanvas'))

const stages = [
  { n: '01', label: 'Blockout', hint: 'Wireframe', color: accents.mint },
  { n: '02', label: 'Detail', hint: 'Shaded', color: accents.amber },
  { n: '03', label: 'Lighting', hint: 'Lit', color: accents.coral },
]

// Static fallback when WebGL is not available.
function FallbackCrystal() {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full" role="img" aria-label="Low-poly crystal">
      <polygon points="50,6 82,40 82,78 50,114 18,78 18,40" fill="#ff7a8c" fillOpacity="0.25" stroke="#f6e9d8" strokeWidth="1.2" />
      <polygon points="50,6 82,40 50,48" fill="#ff9aa6" /><polygon points="50,6 18,40 50,48" fill="#e86f86" />
      <polygon points="18,40 50,48 50,114 18,78" fill="#b78ad9" /><polygon points="82,40 50,48 50,114 82,78" fill="#8d62b8" />
    </svg>
  )
}

export default function CrystalStage({ name, role }: { name: string; role: string }) {
  const [stage, setStage] = useState(0)
  const [failed, setFailed] = useState(false)
  const onStage = useCallback((s: number) => setStage(s), [])
  const onFail = useCallback(() => setFailed(true), [])

  return (
    <div className="relative flex w-full max-w-[460px] flex-col items-center">
      <div className="z-10 text-center">
        <div className="bob rounded-full border border-studio-border bg-black/55 px-3 py-1 backdrop-blur-sm">
          <div className="text-sm font-bold leading-tight text-white">{name}</div>
          <div className="font-mono text-[10px] leading-tight text-studio-amber">{role}</div>
        </div>
        <div className="mx-auto h-2 w-px bg-studio-border" />
      </div>

      <div className="relative -mt-1 aspect-square w-full" style={{ maxHeight: 'min(46vh, 430px)', maxWidth: 'min(46vh, 430px)' }}>
        {failed ? <FallbackCrystal /> : (
          <Suspense fallback={null}><CrystalCanvas onStage={onStage} onFail={onFail} /></Suspense>
        )}
      </div>

      <div className="z-10 -mt-1 flex flex-col items-center gap-1.5" aria-live="polite">
        <div className="flex gap-1.5">
          {stages.map((s, i) => (
            <span key={s.n} className="rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide transition-all duration-300"
              style={{ borderColor: i === stage ? s.color : '#43386b', color: i === stage ? '#231020' : '#a99bc4', background: i === stage ? s.color : 'rgba(26,21,48,0.6)' }}>
              {s.n} {s.label}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] text-white/70">{stages[stage].hint} - move your cursor closer</span>
      </div>
    </div>
  )
}
