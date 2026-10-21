import { useContent } from '../../lib/content'
import { accents, linkColor } from '../../lib/palette'
import { linkIcon } from './icons'

export default function AvailabilityCard() {
  const { content } = useContent()
  const { availability: a, links } = content
  const preferred = links.find((l) => l.type === a.preferred)
  const color = a.open ? accents.ok : accents.warn

  return (
    <div className="rounded-sm border bg-studio-panel p-4" style={{ borderColor: `${color}77` }}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {a.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: color }} />}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        </span>
        <span className="font-semibold" style={{ color }}>{a.open ? 'Open for commissions' : 'Currently booked'}</span>
      </div>
      {a.response && <p className="mt-2 text-sm text-studio-dim">{a.response}</p>}
      {preferred && (
        <p className="mt-2 flex items-center gap-2 text-sm text-studio-text">
          <span style={{ color: linkColor(preferred.type) }}>{linkIcon(preferred.type, 15)}</span>
          Prefers <span className="font-semibold">{preferred.label}</span>
        </p>
      )}
    </div>
  )
}
