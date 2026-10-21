import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Props = { onStage: (stage: number) => void; onFail: () => void }

const palette = { bottom: new THREE.Color('#3f6178'), top: new THREE.Color('#d6f0ff') }

// Paints each triangle one flat color from a steel-to-ice gradient so the facets read as low-poly.
function paint(geo: THREE.BufferGeometry, seed: number) {
  geo.computeBoundingBox()
  const { min, max } = geo.boundingBox!
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let f = 0; f < pos.count; f += 3) {
    const y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3
    const c = palette.bottom.clone().lerp(palette.top, (y - min.y) / (max.y - min.y || 1)).multiplyScalar(0.78 + rand() * 0.4)
    for (let k = 0; k < 3; k++) c.toArray(colors, (f + k) * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(170,220,250,0.9)')
  grad.addColorStop(0.35, 'rgba(140,200,232,0.28)')
  grad.addColorStop(0.8, 'rgba(140,200,232,0)')
  grad.addColorStop(1, 'rgba(140,200,232,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

const IDLE = 0.12
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b)

// A crystal cluster that goes wireframe -> shaded -> lit depending on how close the pointer is.
export default function CrystalCanvas({ onStage, onFail }: Props) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) } catch { onFail(); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
    el.appendChild(renderer.domElement)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    camera.position.set(0, 0.1, 8.4)

    const profile = [[0.001, -1.7], [0.85, -0.45], [0.85, 0.55], [0.001, 1.6]].map(([x, y]) => new THREE.Vector2(x, y))
    const crystalGeo = new THREE.LatheGeometry(profile, 6).toNonIndexed()
    paint(crystalGeo, 11)
    const shardGeo = new THREE.OctahedronGeometry(0.17, 0).toNonIndexed()
    paint(shardGeo, 5)
    const edgeGeo = new THREE.EdgesGeometry(crystalGeo, 5)
    const shardEdgeGeo = new THREE.EdgesGeometry(shardGeo, 5)

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, flatShading: true, roughness: 0.32, metalness: 0.15, transparent: true, opacity: 0,
      emissive: new THREE.Color('#8cc8e8'), emissiveIntensity: 0,
    })
    const lineMat = new THREE.LineBasicMaterial({ color: '#e8ecf1', transparent: true, opacity: 0.95 })

    const cluster = new THREE.Group()
    scene.add(cluster)
    const specs: { s: number; pos: [number, number, number]; rot: [number, number, number] }[] = [
      { s: 1, pos: [0, 0, 0], rot: [0, 0.3, 0] },
      { s: 0.52, pos: [-1.05, -0.7, 0.15], rot: [0.1, 0.9, 0.5] },
      { s: 0.42, pos: [0.98, -0.8, 0.25], rot: [-0.1, 0.2, -0.55] },
      { s: 0.3, pos: [0.15, -1.0, -0.8], rot: [0.5, 0.6, 0.1] },
    ]
    for (const sp of specs) {
      const g = new THREE.Group()
      g.add(new THREE.Mesh(crystalGeo, mat), new THREE.LineSegments(edgeGeo, lineMat))
      g.scale.setScalar(sp.s)
      g.position.set(...sp.pos)
      g.rotation.set(...sp.rot)
      cluster.add(g)
    }

    const shards = Array.from({ length: 7 }, (_, i) => {
      const g = new THREE.Group()
      g.add(new THREE.Mesh(shardGeo, mat), new THREE.LineSegments(shardEdgeGeo, lineMat))
      scene.add(g)
      return { g, r: 1.7 + (i % 3) * 0.35, sp: 0.35 + i * 0.07, ph: i * 0.9, y: -0.6 + (i % 4) * 0.55 }
    })

    const glowMat = new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    const glow = new THREE.Sprite(glowMat)
    glow.position.set(0, 0, -1.4)
    scene.add(glow)

    const ambient = new THREE.AmbientLight('#9fb4c8', 0.3)
    const key = new THREE.DirectionalLight('#ffffff', 0)
    key.position.set(4, 5, 5)
    const rim = new THREE.DirectionalLight('#8cc8e8', 0)
    rim.position.set(-5, 2, -3)
    const inner = new THREE.PointLight('#bfe6ff', 0, 10)
    inner.position.set(0, 0, 1.6)
    scene.add(ambient, key, rim, inner)

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let pointerTarget = IDLE
    let tap: number | null = null
    let tapIndex = 0
    let nx = 0, ny = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height
      pointerTarget = Math.pow(clamp(1 - Math.hypot(dx, dy) / 0.9), 0.8)
      nx = clamp(dx, -1, 1); ny = clamp(dy, -1, 1)
      tap = null
    }
    const onLeave = () => { pointerTarget = IDLE; nx = ny = 0 }
    const onTap = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      tapIndex = (tapIndex + 1) % 3
      tap = [IDLE, 0.5, 1][tapIndex]
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerdown', onTap)

    // One-time intro that shows all three stages before handing control to the pointer.
    const intro = (t: number) => (t < 0.6 ? 0 : t < 2.4 ? smooth(t, 0.6, 2.4) : t < 3 ? 1 : 1 - smooth(t, 3, 3.5) * (1 - IDLE))

    let p = reduced ? 0.7 : 0
    let stage = -1
    let raf = 0
    let last = performance.now()
    const t0 = last
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = (now - t0) / 1000
      const target = reduced ? 0.7 : t < 3.5 && tap === null ? intro(t) : tap ?? pointerTarget
      p += (target - p) * (1 - Math.exp(-dt * 5))

      const shaded = smooth(p, 0.15, 0.5)
      const lit = smooth(p, 0.55, 0.95)
      mat.opacity = shaded
      mat.emissiveIntensity = lit * 0.55
      lineMat.opacity = 0.95 - 0.6 * lit
      ambient.intensity = 0.3 + 0.5 * shaded
      key.intensity = 0.25 * shaded + 2.4 * lit
      rim.intensity = 0.2 * shaded + 1.8 * lit
      inner.intensity = 38 * lit
      glowMat.opacity = lit * 0.8
      glow.scale.setScalar(3.6 + lit * 1.3)

      if (!reduced) {
        cluster.rotation.y += dt * 0.38
        cluster.rotation.x += (ny * 0.28 - cluster.rotation.x) * 0.06
        cluster.rotation.z += (-nx * 0.12 - cluster.rotation.z) * 0.06
        cluster.position.y = Math.sin(t * 0.9) * 0.1
        for (const s of shards) {
          const a = t * s.sp + s.ph
          s.g.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.8 + s.ph) * 0.15, Math.sin(a) * s.r * 0.65)
          s.g.rotation.set(a, a * 0.7, 0)
        }
      } else {
        shards.forEach((s, i) => s.g.position.set(Math.cos(i) * s.r, s.y, Math.sin(i) * s.r * 0.65))
      }

      const next = p < 0.34 ? 0 : p < 0.7 ? 1 : 2
      if (next !== stage) { stage = next; onStage(next) }
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', onTap)
      crystalGeo.dispose(); shardGeo.dispose(); edgeGeo.dispose(); shardEdgeGeo.dispose()
      mat.dispose(); lineMat.dispose(); glowMat.map?.dispose(); glowMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [onStage, onFail])

  return <div ref={host} className="h-full w-full" />
}
