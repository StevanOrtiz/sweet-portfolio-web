import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import { Box, ExternalLink } from 'lucide-react'
import { useContent } from '../../lib/content'
import { accents, pick } from '../../lib/palette'
import { serviceIcons } from './icons'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } }
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

// Counts up numeric values like "50+" when they scroll into view; other text is shown as is.
function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d+)(.*)$/)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!m || !inView) return
    const c = animate(0, Number(m[1]), { duration: 1.2, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  if (!m) return <span ref={ref}>{value}</span>
  return <span ref={ref}>{String(n).padStart(m[1].length, '0')}{m[2]}</span>
}

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-studio-dim">{children}</h3>
)

function Avatar({ src, name, size, color }: { src: string; name: string; size: number; color: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-md border-2" style={{ width: size, height: size, borderColor: `${color}bb`, background: '#1a1e24' }}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span className="font-bold" style={{ fontSize: size * 0.45, color }}>{name.slice(0, 1)}</span>}
    </div>
  )
}

export default function StudioView({ onSelect }: { onSelect: (id: string) => void }) {
  const { content } = useContent()
  const { studio, studioStats, studioSteps, studioServices, team } = content
  const ceo = team.find((m) => m.ceo)
  const others = team.filter((m) => m !== ceo)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-10 p-6">
      <motion.header variants={rise} className="relative overflow-hidden rounded-md border border-studio-border bg-studio-panel p-6" >
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-studio-accent/60 bg-studio-bg">
            {studio.logo ? <img src={studio.logo} alt={studio.name} className="h-full w-full object-contain" /> : <Box size={38} style={{ color: accents.steel }} />}
          </div>
          <div className="min-w-0">
            <h2 className="text-3xl font-bold tracking-wide text-white sm:text-4xl">{studio.name}</h2>
            <p className="mt-1 font-mono text-sm" style={{ color: accents.steel }}>{studio.tagline}</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-studio-text/90">{studio.intro}</p>
        {studio.ceo_note && <p className="mt-3 font-mono text-xs text-studio-dim">{studio.ceo_note}</p>}
      </motion.header>

      {studioStats.length > 0 && (
        <motion.div variants={rise} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {studioStats.map((s, i) => (
            <div key={s.id} className="rounded-sm border border-studio-border bg-studio-panel px-4 py-4 text-center">
              <div className="text-3xl font-bold" style={{ color: pick(i) }}><CountUp value={s.value} /></div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-studio-dim">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {studioSteps.length > 0 && (
        <motion.section variants={rise}>
          <Heading>How a commission works</Heading>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {studioSteps.map((s, i) => (
              <li key={s.id} className="relative rounded-sm border border-studio-border bg-studio-panel p-4">
                <span className="font-mono text-xs" style={{ color: pick(i) }}>{String(i + 1).padStart(2, '0')}</span>
                <div className="mt-1 font-semibold text-white">{s.title}</div>
                <p className="mt-1 text-xs leading-snug text-studio-dim">{s.text}</p>
                <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: pick(i) }} />
              </li>
            ))}
          </ol>
        </motion.section>
      )}

      {studioServices.length > 0 && (
        <motion.section variants={rise}>
          <Heading>What the studio does</Heading>
          <div className="grid gap-3 sm:grid-cols-2">
            {studioServices.map((s, i) => (
              <div key={s.id} className="rounded-sm border border-studio-border bg-studio-panel p-4 transition-all hover:-translate-y-0.5"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = pick(i))} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}>
                <div className="inline-block rounded-sm p-1.5" style={{ color: pick(i), background: `${pick(i)}1f` }}>{serviceIcons[s.icon] ?? <Box />}</div>
                <h4 className="mt-2 font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-studio-dim">{s.description}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {team.length > 0 && (
        <motion.section variants={rise}>
          <Heading>The team</Heading>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ceo && (
              <div className="rounded-md border-2 p-5 sm:col-span-2 xl:col-span-3" style={{ borderColor: `${accents.ice}88`, background: '#12151a' }}>
                <div className="flex flex-wrap items-center gap-5">
                  <Avatar src={ceo.avatar} name={ceo.name} size={88} color={accents.ice} />
                  <div className="min-w-0 flex-1">
                    <span className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold text-studio-bg" style={{ background: accents.ice }}>CEO</span>
                    <h4 className="mt-1 text-2xl font-bold text-white">{ceo.name}</h4>
                    <p className="font-mono text-xs" style={{ color: accents.steel }}>{ceo.role}</p>
                    <p className="mt-2 max-w-2xl text-sm text-studio-text/90">{ceo.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {list(ceo.skills).map((sk, i) => <span key={sk} className="rounded-sm border px-2 py-0.5 text-xs" style={{ borderColor: `${pick(i)}66`, color: pick(i), background: `${pick(i)}12` }}>{sk}</span>)}
                    </div>
                  </div>
                  <button className="btn" onClick={() => onSelect('about')}>See my profile</button>
                </div>
              </div>
            )}
            {others.map((m, i) => (
              <motion.div key={m.id} whileHover={{ y: -3 }} className="rounded-md border border-studio-border bg-studio-panel p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={m.avatar} name={m.name} size={56} color={pick(i + 1)} />
                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-white">{m.name}</h4>
                    <p className="font-mono text-xs" style={{ color: pick(i + 1) }}>{m.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-studio-dim">{m.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {list(m.skills).map((sk) => <span key={sk} className="rounded-sm border border-studio-border px-1.5 py-0.5 text-[11px] text-studio-text/80">{sk}</span>)}
                </div>
                {m.link && (
                  <a href={m.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs hover:underline" style={{ color: pick(i + 1) }}>
                    Profile <ExternalLink size={12} />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={rise} className="rounded-md border border-studio-border bg-studio-panel p-6 text-center">
        <p className="mx-auto max-w-xl text-studio-text/90">{studio.join_text}</p>
        <button className="btn-primary mt-4" onClick={() => onSelect('contact')}>Get in touch</button>
      </motion.section>
    </motion.div>
  )
}
