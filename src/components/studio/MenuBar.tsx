import { Link } from 'react-router-dom'

const items: [string, string][] = [['Home', 'home'], ['Gallery', 'gallery'], ['Services', 'services'], ['About', 'about'], ['Contact', 'contact']]

export default function MenuBar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <header className="flex h-9 shrink-0 items-center gap-1 border-b border-studio-border bg-studio-panel px-2 text-[13px]">
      <span className="mr-2 font-mono font-semibold text-studio-accent">STUDIO</span>
      {items.map(([label, id]) => (
        <button key={id} onClick={() => onSelect(id)}
          className={`rounded px-2 py-1 ${selected === id || (id === 'gallery' && selected.startsWith('work:')) ? 'bg-studio-select text-white' : 'hover:bg-studio-panel2'}`}>
          {label}
        </button>
      ))}
      <Link to="/admin" className="ml-auto rounded px-2 py-1 text-studio-dim hover:bg-studio-panel2">Admin</Link>
    </header>
  )
}
