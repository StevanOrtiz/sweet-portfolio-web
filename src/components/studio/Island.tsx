import { useEffect, useMemo, useRef } from 'react'

type Col = { top: string; left: string; right: string }
type Block = { x: number; y: number; z: number; c: Col; s?: number }

const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`
}
const mat = (hex: string): Col => ({ top: shade(hex, 1.08), left: shade(hex, 0.8), right: shade(hex, 0.6) })

const dirt = mat('#8a6450')
const grass: Col = { top: '#a3d16f', left: dirt.left, right: dirt.right }
const stone = mat('#6d5a86')
const stoneDeep = mat('#4e4068')
const wood = mat('#7a4b3a')
const sakura = mat('#ff8fa3')
const sakuraLight = mat('#ffc2cd')
const wall = mat('#f2dfc4')
const roof = mat('#ff6b57')
const crate = mat('#c08a55')
const pond: Col = { top: '#4cc3bd', left: dirt.left, right: dirt.right }
const sand: Col = { top: '#ecd3a0', left: dirt.left, right: dirt.right }

function build(): Block[] {
  const b: Block[] = []
  const corners = new Set(['0,0', '5,0', '0,5', '5,5'])
  for (let x = 0; x < 6; x++) for (let y = 0; y < 6; y++) {
    if (corners.has(`${x},${y}`)) continue
    const k = `${x},${y}`
    b.push({ x, y, z: 0, c: k === '3,4' ? pond : k === '2,3' || k === '3,3' ? sand : grass })
  }
  for (let x = 1; x < 5; x++) for (let y = 1; y < 5; y++) b.push({ x, y, z: -1, c: dirt })
  for (let x = 1; x < 5; x++) for (let y = 1; y < 5; y++) if ((x + y) % 3 !== 0) b.push({ x, y, z: -2, c: stone })
  b.push({ x: 2, y: 2, z: -3, c: stoneDeep }, { x: 3, y: 2, z: -3, c: stone }, { x: 2, y: 3, z: -3, c: stone }, { x: 3, y: 3, z: -4, c: stoneDeep })
  // sakura tree
  b.push({ x: 1, y: 1, z: 1, c: wood }, { x: 1, y: 1, z: 2, c: wood })
  for (const [x, y] of [[1, 1], [0, 1], [2, 1], [1, 0], [1, 2]]) b.push({ x, y, z: 3, c: sakura })
  b.push({ x: 1, y: 1, z: 4, c: sakuraLight })
  // little house
  for (const z of [1, 2]) b.push({ x: 4, y: 1, z, c: wall }, { x: 4, y: 2, z, c: wall })
  b.push({ x: 4, y: 1, z: 3, c: roof }, { x: 4, y: 2, z: 3, c: roof }, { x: 4, y: 1, z: 4, c: stoneDeep, s: 0.4 })
  // crates
  b.push({ x: 1, y: 4, z: 1, c: crate }, { x: 2, y: 4, z: 1, c: crate }, { x: 1, y: 4, z: 2, c: crate })
  // floating pebbles
  b.push({ x: 6.3, y: 1.2, z: -2.6, c: stone, s: 0.5 }, { x: -0.9, y: 4.4, z: -3.2, c: stoneDeep, s: 0.4 }, { x: 5.8, y: 5.6, z: -4.4, c: stone, s: 0.35 })
  return b
}

const W = 52, H = 26, ZH = 28
const P = (x: number, y: number, z: number): [number, number] => [((x - y) * W) / 2, ((x + y) * H) / 2 - z * ZH]
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ')

function IsoCube({ x, y, z, c, s = 1 }: Block) {
  const top = [P(x, y, z + s), P(x + s, y, z + s), P(x + s, y + s, z + s), P(x, y + s, z + s)]
  const left = [P(x, y + s, z), P(x + s, y + s, z), P(x + s, y + s, z + s), P(x, y + s, z + s)]
  const right = [P(x + s, y, z), P(x + s, y + s, z), P(x + s, y + s, z + s), P(x + s, y, z + s)]
  const edge = { stroke: '#1a153044', strokeWidth: 0.6, strokeLinejoin: 'round' as const }
  return (
    <g>
      <polygon points={pts(left)} fill={c.left} {...edge} />
      <polygon points={pts(right)} fill={c.right} {...edge} />
      <polygon points={pts(top)} fill={c.top} {...edge} />
    </g>
  )
}

// Low-poly isometric floating island drawn with SVG; bobs gently and shifts with the pointer.
export default function Island({ name, role }: { name: string; role: string }) {
  const blocks = useMemo(() => build().sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z) || a.z - b.z), [])
  const wrap = useRef<HTMLDivElement>(null)

  const box = useMemo(() => {
    const all = blocks.flatMap(({ x, y, z, s = 1 }) => [P(x, y, z), P(x + s, y + s, z + s), P(x + s, y, z), P(x, y + s, z)])
    const xs = all.map((p) => p[0]), ys = all.map((p) => p[1])
    const minX = Math.min(...xs) - 6, minY = Math.min(...ys) - 6
    return { minX, minY, w: Math.max(...xs) + 6 - minX, h: Math.max(...ys) + 6 - minY }
  }, [blocks])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5
      if (wrap.current) wrap.current.style.transform = `translate(${nx * -22}px, ${ny * -14}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <div ref={wrap} className="relative w-full max-w-[420px] transition-transform duration-300 ease-out">
      <div className="absolute left-1/2 top-[-4px] z-10 -translate-x-1/2 text-center">
        <div className="bob rounded-full border border-studio-border bg-black/55 px-3 py-1 backdrop-blur-sm">
          <div className="text-sm font-bold leading-tight text-white">{name}</div>
          <div className="font-mono text-[10px] leading-tight text-studio-amber">{role}</div>
        </div>
        <div className="mx-auto h-2 w-px bg-studio-border" />
      </div>
      <div className="bob pt-14" style={{ animationDelay: '-1.5s' }}>
        <svg viewBox={`${box.minX} ${box.minY} ${box.w} ${box.h}`} className="w-full drop-shadow-[0_24px_30px_rgba(10,6,24,0.45)]" role="img" aria-label="Floating isometric island with a sakura tree and a small house">
          {blocks.map((b, i) => <IsoCube key={i} {...b} />)}
        </svg>
      </div>
    </div>
  )
}
