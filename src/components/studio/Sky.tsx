const stars: [number, number, number, number][] = [
  [6, 8, 2, 0], [14, 22, 1.5, 1.2], [23, 6, 2, 2.1], [31, 17, 1.5, 0.6], [42, 9, 2, 1.7], [51, 24, 1.5, 2.6],
  [58, 5, 2, 0.9], [67, 15, 1.5, 3.1], [76, 8, 2, 1.4], [84, 20, 1.5, 0.3], [92, 7, 2, 2.4], [96, 26, 1.5, 1.1],
  [10, 34, 1.5, 2.8], [37, 30, 1.5, 0.4], [72, 32, 1.5, 1.9],
]

// Sunset sky: gradient, stars, sun, drifting clouds and layered low-poly mountains.
export default function Sky() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1530 0%, #2f2259 28%, #6c3573 52%, #c4506a 74%, #f08a62 92%, #ffb36b 100%)' }}>
      {stars.map(([x, y, s, d], i) => (
        <span key={i} className="absolute rounded-full bg-studio-text" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: 0.8, animation: `twinkle 3.5s ${d}s ease-in-out infinite` }} />
      ))}

      <div className="absolute left-[58%] top-[44%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 35%, #ffe9b8 0%, #ffc27a 55%, #ff8a5c 100%)', boxShadow: '0 0 90px 20px #ff8a5c40' }} />

      {[
        { t: '18%', w: 150, d: 70, delay: -10, o: 0.22 },
        { t: '30%', w: 220, d: 95, delay: -50, o: 0.16 },
        { t: '10%', w: 110, d: 60, delay: -30, o: 0.18 },
      ].map((c, i) => (
        <svg key={i} viewBox="0 0 220 60" className="absolute" style={{ top: c.t, width: c.w, opacity: c.o, animation: `cloud ${c.d}s ${c.delay}s linear infinite` }}>
          <path d="M10 50 L40 22 L75 30 L105 8 L145 26 L180 18 L210 50 Z" fill="#f6e9d8" />
        </svg>
      ))}

      <svg className="absolute inset-x-0 bottom-0 h-[42%] w-full" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <polygon points="0,320 0,170 120,90 230,160 360,60 480,150 590,100 720,175 860,70 990,150 1100,105 1200,160 1200,320" fill="#4a2f6e" />
        <polygon points="0,320 0,220 90,170 210,225 330,150 450,215 580,165 700,230 830,170 960,225 1080,180 1200,225 1200,320" fill="#34234f" />
        <polygon points="0,320 0,265 140,235 260,270 400,225 520,268 660,240 790,275 930,238 1060,270 1200,245 1200,320" fill="#231a3a" />
      </svg>
    </div>
  )
}
