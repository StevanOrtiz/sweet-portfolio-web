import { useState } from 'react'
import { Box, ChevronDown, ChevronRight, Folder, Image, Mail, User, Wrench } from 'lucide-react'
import { useContent } from '../../lib/content'

type Props = { selected: string; onSelect: (id: string) => void }

function Row({ depth, icon, label, id, selected, onSelect, toggle }: {
  depth: number; icon: React.ReactNode; label: string; id: string; selected: string
  onSelect: (id: string) => void; toggle?: { open: boolean; set: () => void }
}) {
  const active = selected === id
  return (
    <button
      onClick={() => { onSelect(id); toggle?.set() }}
      className={`flex w-full items-center gap-1 py-[3px] pr-2 text-left text-[13px] ${active ? 'bg-studio-select text-white' : 'hover:bg-studio-panel2'}`}
      style={{ paddingLeft: 8 + depth * 14 }}
    >
      <span className="w-3.5 shrink-0 text-studio-dim">
        {toggle ? (toggle.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
      </span>
      <span className="shrink-0 text-studio-accent">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

export default function Explorer({ selected, onSelect }: Props) {
  const { content } = useContent()
  const [open, setOpen] = useState<Record<string, boolean>>({ gallery: true })
  const flip = (k: string) => () => setOpen((o) => ({ ...o, [k]: !o[k] }))
  const published = content.works.filter((w) => w.published)
  const uncategorized = published.filter((w) => !content.categories.some((c) => c.id === w.category_id))

  const WorkRows = ({ list, depth }: { list: typeof published; depth: number }) => (
    <>
      {list.map((w) => (
        <Row key={w.id} depth={depth} icon={<Image size={14} />} label={w.title} id={`work:${w.id}`} selected={selected} onSelect={onSelect} />
      ))}
    </>
  )

  return (
    <nav aria-label="Explorer" className="h-full overflow-y-auto py-1">
      <Row depth={0} icon={<Box size={14} />} label="Workspace" id="home" selected={selected} onSelect={onSelect} />
      <Row depth={1} icon={<Folder size={14} />} label="Gallery" id="gallery" selected={selected} onSelect={onSelect} toggle={{ open: !!open.gallery, set: flip('gallery') }} />
      {open.gallery && (
        <>
          {content.categories.map((c) => (
            <div key={c.id}>
              <Row depth={2} icon={<Folder size={14} />} label={c.name} id={`cat:${c.id}`} selected={selected} onSelect={onSelect} toggle={{ open: open[c.id] !== false, set: flip(c.id) }} />
              {open[c.id] !== false && <WorkRows list={published.filter((w) => w.category_id === c.id)} depth={3} />}
            </div>
          ))}
          <WorkRows list={uncategorized} depth={2} />
        </>
      )}
      <Row depth={1} icon={<Wrench size={14} />} label="Services" id="services" selected={selected} onSelect={onSelect} />
      <Row depth={1} icon={<User size={14} />} label="About" id="about" selected={selected} onSelect={onSelect} />
      <Row depth={1} icon={<Mail size={14} />} label="Contact" id="contact" selected={selected} onSelect={onSelect} />
    </nav>
  )
}
