import { motion } from 'framer-motion'
import { useContent } from '../../lib/content'
import { accents } from '../../lib/palette'
import Sky from './Sky'
import Island from './Island'
import Hotbar from './Hotbar'

const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } } }

export default function HomeScene({ onSelect }: { onSelect: (id: string) => void }) {
  const { content } = useContent()
  const { profile: p, stats, availability, texts, tools } = content
  const channel = content.links.find((l) => l.type === availability.preferred)

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <Sky />
      <div className="relative z-10 grid flex-1 items-center gap-6 px-5 pt-5 md:grid-cols-[minmax(0,26rem)_1fr] md:px-10">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="rounded-md border border-white/10 bg-studio-bg/70 p-5 shadow-2xl backdrop-blur-md">
          <motion.div variants={rise} className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-studio-dim">
            <span>Player profile</span>
            <span className="flex items-center gap-1.5 normal-case tracking-normal" style={{ color: availability.open ? '#8fd694' : accents.amber }}>
              <span className="h-2 w-2 rounded-full" style={{ background: availability.open ? '#8fd694' : accents.amber }} />
              {availability.open ? 'Open for commissions' : 'Currently booked'}
            </span>
          </motion.div>

          <motion.div variants={rise} className="mt-4 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-studio-amber/70 bg-gradient-to-br from-studio-accent to-studio-violet">
              {p.avatar ? <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-4xl font-bold text-studio-bg">{p.name.slice(0, 1)}</span>}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-studio-dim">{texts.hero_title}</p>
              <h1 className="break-words text-4xl font-bold leading-none tracking-tight text-white">{p.name}</h1>
              <p className="mt-1.5 font-mono text-xs" style={{ color: accents.amber }}>{p.tagline}</p>
            </div>
          </motion.div>

          <motion.p variants={rise} className="mt-4 text-sm leading-relaxed text-studio-text/90">{p.bio}</motion.p>

          {stats.length > 0 && (
            <motion.div variants={rise} className="mt-4 grid grid-cols-3 gap-2">
              {stats.slice(0, 3).map((s, i) => (
                <div key={s.id} className="rounded-sm border border-studio-border bg-black/20 px-2 py-2 text-center">
                  <div className="text-xl font-bold" style={{ color: [accents.coral, accents.amber, accents.mint][i] }}>{s.value}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-studio-dim">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div variants={rise} className="mt-5 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => onSelect('gallery')}>View my work</button>
            <button className="btn" onClick={() => onSelect('contact')}>{channel ? `Message on ${channel.label}` : 'Contact me'}</button>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }} className="flex justify-center">
          <Island name={p.name} role="Builder" />
        </motion.div>
      </div>

      <Hotbar tools={tools} />
    </div>
  )
}
