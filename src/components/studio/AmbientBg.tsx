import { useEffect, useRef } from 'react'

type P = { x: number; y: number; vx: number; vy: number; r: number }

const LINK = 150
const ICE = '140,200,232'

// Quiet particle network behind the viewport content: slow drift, faint links, a soft link to the cursor.
export default function AmbientBg() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0
    let ps: P[] = []
    const mouse = { x: -999, y: -999 }

    const init = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      if (!w || !h) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(80, Math.max(28, (w * h) / 18000)))
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: Math.random() * 1.1 + 0.6,
      }))
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        if (!reduced) {
          p.x += p.vx; p.y += p.vy
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10
        }
      }
      ctx.lineWidth = 1
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i]
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${ICE},${(1 - d / LINK) * 0.24})`
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y)
        if (dm < LINK * 1.3) {
          ctx.strokeStyle = `rgba(${ICE},${(1 - dm / (LINK * 1.3)) * 0.4})`
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke()
        }
        ctx.fillStyle = `rgba(${ICE},0.6)`
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill()
      }
      if (!reduced) {
        // slow radar line sweeping down
        const y = ((t / 1000) * 22) % (h + 40) - 20
        ctx.fillStyle = `rgba(${ICE},0.05)`
        ctx.fillRect(0, y, w, 1)
        raf = requestAnimationFrame(draw)
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = mouse.y = -999 }

    const ro = new ResizeObserver(() => { init(); if (reduced) draw(0) })
    ro.observe(canvas)
    init()
    raf = requestAnimationFrame(draw)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
}
