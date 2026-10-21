import { motion } from 'framer-motion'
import { useContent } from '../../lib/content'
import { accents, pick } from '../../lib/palette'
import { LevelBar } from './Hotbar'
import { toolIcon } from './icons'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } }
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-studio-dim">{children}</h3>
)

export default function AboutView() {
  const { content } = useContent()
  const { profile: p, tools, timeline } = content

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-8 p-6 lg:grid-cols-2">
      <div className="space-y-6">
        <motion.div variants={rise} className="flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-studio-accent/60 bg-studio-panel2">
            {p.avatar ? <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-5xl font-bold text-studio-accent">{p.name.slice(0, 1)}</span>}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{p.name}</h2>
            <p className="font-mono text-sm" style={{ color: accents.steel }}>{p.tagline}</p>
          </div>
        </motion.div>

        <motion.p variants={rise} className="whitespace-pre-line leading-relaxed text-studio-text">{p.bio}</motion.p>

        {list(p.facts).length > 0 && (
          <motion.div variants={rise}>
            <Heading>Fun facts</Heading>
            <div className="flex flex-wrap gap-2">
              {list(p.facts).map((f, i) => (
                <span key={f} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${pick(i + 2)}66`, color: pick(i + 2), background: `${pick(i + 2)}14` }}>{f}</span>
              ))}
            </div>
          </motion.div>
        )}

        {timeline.length > 0 && (
          <motion.div variants={rise}>
            <Heading>Journey</Heading>
            <ol className="relative ml-2 border-l border-studio-border pl-5">
              {timeline.map((t, i) => (
                <li key={t.id} className="relative pb-5 last:pb-0">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-studio-bg" style={{ background: pick(i) }} />
                  <div className="font-mono text-xs" style={{ color: pick(i) }}>{t.year}</div>
                  <div className="font-semibold text-white">{t.title}</div>
                  <p className="text-sm text-studio-dim">{t.text}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </div>

      <motion.div variants={rise}>
        <Heading>Toolbelt</Heading>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((t, i) => (
            <div key={t.id} className="rounded-sm border border-studio-border bg-studio-panel p-3 transition-all hover:-translate-y-0.5" onMouseEnter={(e) => (e.currentTarget.style.borderColor = pick(i))} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}>
              <div className="flex items-center gap-2">
                <span className="rounded-sm p-1.5" style={{ color: pick(i), background: `${pick(i)}1f` }}>{toolIcon(t.icon, 18)}</span>
                <span className="font-semibold">{t.name}</span>
                <span className="ml-auto font-mono text-xs text-studio-dim">{t.level}%</span>
              </div>
              <div className="mt-2"><LevelBar level={t.level} color={pick(i)} /></div>
              <p className="mt-2 text-xs text-studio-dim">{t.note}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
