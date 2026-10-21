// Technical stage behind the Home scene: perspective grid floor, inspection rings and corner readouts.
export default function Sky() {
  const ring = 'absolute left-[72%] top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-studio-bg">
      <div className="floor" style={{ height: '48%' }} />
      <div className="absolute inset-x-0 bottom-[48%] h-px bg-studio-accent/15" />

      <div className="hidden md:block">
        <div className={`${ring} border-studio-accent/10`} style={{ width: 'min(86vh, 700px)', height: 'min(86vh, 700px)' }} />
        <div className={`${ring} border-dashed border-studio-accent/20`} style={{ width: 'min(64vh, 520px)', height: 'min(64vh, 520px)' }} />
        <div className={`${ring} border-studio-accent/15`} style={{ width: 'min(44vh, 360px)', height: 'min(44vh, 360px)' }} />
        <div className="absolute left-[72%] top-[10%] h-[68%] w-px -translate-x-1/2 bg-studio-accent/10" />
        <div className="absolute left-[38%] right-[0%] top-[44%] h-px bg-studio-accent/10" />
      </div>

      <div className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-widest text-studio-dim/70">Perspective / FOV 32</div>
      <div className="absolute right-4 top-3 font-mono text-[10px] uppercase tracking-widest text-studio-dim/70">Cam 0.00, 0.10, 8.40</div>
      <div className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-widest text-studio-dim/70">Origin 0, 0, 0</div>
    </div>
  )
}
