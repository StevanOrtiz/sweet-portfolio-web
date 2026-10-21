import { useEffect, useState } from 'react'
import { Box, Building2, ChevronDown, ChevronRight, Folder, Image, Mail, User, Wrench } from 'lucide-react'
import { useContent } from '../../lib/content'
import { accents, pick } from '../../lib/palette'

type Props = { selected: string; onSelect: (id: string) => void }

const CAP = 6 // works shown per category before "Show more"

function Row({ depth, icon, color, label, hint, id, selected, onSelect, toggle }: {
  depth: number; icon: React.ReactNode; color: string; label: string; hint?: string; id: string; selected: string
  onSelect: (id: string) => void; toggle?: { open: boolean; set: () => void }
}) {
  const active = selected === id
  return (
    <button
      onClick={() => { onSelect(id); toggle?.set() }}
      className={`relative flex w-full items-center gap-1 py-[3px] pr-2 text-left text-[13px] transition-all duration-150 ${active ? 'bg-studio-select text-white' : 'hover:bg-studio-panel2 hover:pl-[2px]'}`}
      style={{ paddingLeft: 8 + depth * 14 }}
    >
      {active && <span className="absolute inset-y-0 left-0 w-0.5" style={{ background: color }} />}
      <span className="w-3.5 shrink-0 text-studio-dim">
        {toggle ? (toggle.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
      </span>
      <span className="shrink-0" style={{ color }}>{icon}</span>
      <span className="truncate">{label}</span>
      {hint && <span className="ml-auto shrink-0 font-mono text-[10px] text-studio-dim">{hint}</span>}
    </button>
  )
}

export default function Explorer({ selected, onSelect }: Props) {
  const { content } = useContent()
  const [open, setOpen] = useState<Record<string, boolean>>({ gallery: true })
  const [showAll, setShowAll] = useState<Record<string, boolean>>({})
  const published = content.works.filter((w) => w.published)
  const uncategorized = published.filter((w) => !content.categories.some((c) => c.id === w.category_id))

  // Selecting a project (from anywhere) opens its category so it never hides inside a collapsed folder.
  useEffect(() => {
    const catId = selected.startsWith('cat:') ? selected.slice(4) : selected.startsWith('work:') ? published.find((w) => w.id === selected.slice(5))?.category_id : null
    if (catId) setOpen((o) => ({ ...o, gallery: true, [catId]: true }))
    else if (selected === 'gallery') setOpen((o) => ({ ...o, gallery: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const flip = (k: string) => () => setOpen((o) => ({ ...o, [k]: !o[k] }))

  const WorkRows = ({ list, depth, color, groupId }: { list: typeof published; depth: number; color: string; groupId: string }) => {
    const selectedBeyondCap = list.slice(CAP).some((w) => `work:${w.id}` === selected)
    const expanded = showAll[groupId] || selectedBeyondCap || list.length <= CAP + 1
    const visible = expanded ? list : list.slice(0, CAP)
    return (
      <>
        {visible.map((w) => (
          <Row key={w.id} depth={depth} color={color} icon={<Image size={14} />} label={w.title} id={`work:${w.id}`} selected={selected} onSelect={onSelect} />
        ))}
        {list.length > CAP + 1 && !selectedBeyondCap && (
          <button onClick={() => setShowAll((s) => ({ ...s, [groupId]: !s[groupId] }))}
            className="w-full py-[3px] text-left text-[12px] text-studio-dim transition-colors hover:text-white" style={{ paddingLeft: 8 + depth * 14 + 18 }}>
            {showAll[groupId] ? 'Show less' : `Show ${list.length - CAP} more...`}
          </button>
        )}
      </>
    )
  }

  return (
    <nav aria-label="Explorer" className="h-full overflow-y-auto py-1">
      <Row depth={0} color={accents.ice} icon={<Box size={14} />} label="Workspace" id="home" selected={selected} onSelect={onSelect} />
      <Row depth={1} color={accents.steel} icon={<Wrench size={14} />} label="Services" id="services" selected={selected} onSelect={onSelect} />
      <Row depth={1} color={accents.steel} icon={<Building2 size={14} />} label="Ware Studios" id="studio" selected={selected} onSelect={onSelect} />
      <Row depth={1} color={accents.steel} icon={<User size={14} />} label="About" id="about" selected={selected} onSelect={onSelect} />
      <Row depth={1} color={accents.steel} icon={<Mail size={14} />} label="Contact" id="contact" selected={selected} onSelect={onSelect} />
      <div className="mx-2 my-1 border-t border-studio-border" />
      <Row depth={1} color={accents.steel} icon={<Folder size={14} />} label="Gallery" hint={String(published.length)} id="gallery" selected={selected} onSelect={onSelect} toggle={{ open: !!open.gallery, set: flip('gallery') }} />
      {open.gallery && (
        <>
          {content.categories.map((c, i) => {
            const list = published.filter((w) => w.category_id === c.id)
            return (
              <div key={c.id}>
                <Row depth={2} color={pick(i)} icon={<Folder size={14} />} label={c.name} hint={String(list.length)} id={`cat:${c.id}`} selected={selected} onSelect={onSelect} toggle={{ open: !!open[c.id], set: flip(c.id) }} />
                {open[c.id] && <WorkRows list={list} depth={3} color={pick(i)} groupId={c.id} />}
              </div>
            )
          })}
          <WorkRows list={uncategorized} depth={2} color={accents.ice} groupId="uncategorized" />
        </>
      )}
    </nav>
  )
}
