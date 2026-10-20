import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useContent } from '../../lib/content'
import { pick } from '../../lib/palette'

export default function Faq() {
  const { content } = useContent()
  const [open, setOpen] = useState<string | null>(null)
  if (!content.faq.length) return null

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-studio-dim">Commission FAQ</h3>
      <div className="space-y-2">
        {content.faq.map((f, i) => {
          const on = open === f.id
          return (
            <div key={f.id} className="overflow-hidden rounded-sm border bg-studio-panel transition-colors" style={{ borderColor: on ? pick(i) : undefined }}>
              <button onClick={() => setOpen(on ? null : f.id)} aria-expanded={on} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm">
                <span className="font-mono text-xs" style={{ color: pick(i) }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{f.q}</span>
                <ChevronDown size={16} className={`text-studio-dim transition-transform ${on ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <p className="px-3 pb-3 pl-9 text-sm text-studio-dim">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
