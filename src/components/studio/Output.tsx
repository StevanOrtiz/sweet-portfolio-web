import { useEffect, useRef } from 'react'
import { useContent } from '../../lib/content'

export default function Output({ log }: { log: string[] }) {
  const { live, loading } = useContent()
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [log])

  return (
    <div aria-label="Output" className="h-full overflow-y-auto px-2 py-1 font-mono text-xs">
      <div className="text-studio-dim">{loading ? 'Loading content...' : live ? 'Content loaded from database.' : 'Showing placeholder content.'}</div>
      {log.map((l, i) => <div key={i}>{l}</div>)}
      <div ref={end} />
    </div>
  )
}
