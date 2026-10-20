import { Link } from 'react-router-dom'

const items: [string, string][] = [['Home', 'home'], ['Gallery', 'gallery'], ['Services', 'services'], ['About', 'about'], ['Contact', 'contact']]

export default function MenuBar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <header className="flex h-9 shrink-0 items-center gap-1 overflow-x-auto whitespace-nowrap border-b border-studio-border bg-studio-panel px-2 text-[13px]">
      <button onClick={() => onSelect('home')} className="grad-text mr-3 font-mono text-sm font-bold tracking-[0.18em]">SWEETKANMI</button>
      {items.map(([label, id]) => {
        const active = selected === id || (id === 'gallery' && (selected.startsWith('work:') || selected.startsWith('cat:')))
        return (
          <button key={id} onClick={() => onSelect(id)}
            className={`relative rounded px-2 py-1 transition-colors ${active ? 'bg-studio-select text-white' : 'hover:bg-studio-panel2'}`}>
            {label}
            {active && <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-studio-accent via-studio-violet to-studio-amber" />}
          </button>
        )
      })}
      <Link to="/admin" className="ml-auto rounded px-2 py-1 text-studio-dim transition-colors hover:bg-studio-panel2">Admin</Link>
    </header>
  )
}
