import { useContent } from '../../lib/content'
import { accents } from '../../lib/palette'

const Prop = ({ k, v, color }: { k: string; v: string; color?: string }) => (
  <div className="flex border-b border-studio-border/50 text-[13px]">
    <div className="w-1/3 shrink-0 truncate px-2 py-1 text-studio-dim">{k}</div>
    <div className="min-w-0 flex-1 break-words px-2 py-1" style={color ? { color } : undefined}>{v || '—'}</div>
  </div>
)

type Row = [string, string, string?]

export default function Properties({ selected }: { selected: string }) {
  const { content } = useContent()
  let rows: Row[] = [['Name', 'SweetKanmi'], ['ClassName', 'Model', accents.amber]]

  if (selected.startsWith('work:')) {
    const w = content.works.find((x) => x.id === selected.slice(5))
    if (w) rows = [
      ['Name', w.title], ['ClassName', 'Render', accents.amber],
      ['Category', content.categories.find((c) => c.id === w.category_id)?.name ?? '', accents.violet],
      ['Tools', w.tools, accents.mint], ['Tags', w.tags, accents.rose], ['Images', String(w.images.length), accents.coral],
    ]
  } else if (selected.startsWith('cat:')) {
    const c = content.categories.find((x) => x.id === selected.slice(4))
    rows = [['Name', c?.name ?? ''], ['ClassName', 'Folder', accents.amber], ['Children', String(content.works.filter((w) => w.category_id === c?.id && w.published).length), accents.coral]]
  } else if (selected === 'gallery') {
    rows = [['Name', 'Gallery'], ['ClassName', 'Folder', accents.amber], ['Children', String(content.works.filter((w) => w.published).length), accents.coral]]
  } else if (selected === 'services') {
    rows = [['Name', 'Services'], ['ClassName', 'Folder', accents.amber], ['Children', String(content.services.length), accents.coral]]
  } else if (selected === 'studio') {
    rows = [['Name', content.studio.name], ['ClassName', 'Studio', accents.amber], ['Members', String(content.team.length), accents.coral], ['CEO', content.team.find((m) => m.ceo)?.name ?? '', accents.violet]]
  } else if (selected === 'about') {
    rows = [['Name', content.profile.name], ['ClassName', 'Profile', accents.amber], ['Skills', content.profile.skills, accents.mint]]
  } else if (selected === 'contact') {
    rows = [['Name', 'Contact'], ['ClassName', 'Folder', accents.amber], ['Channels', String(content.links.length), accents.coral]]
  } else {
    rows = [['Name', content.profile.name], ['ClassName', 'Model', accents.amber], ['Role', content.profile.tagline, accents.violet]]
  }

  return (
    <div key={selected} aria-label="Properties" className="flash h-full overflow-y-auto">
      {rows.map(([k, v, c]) => <Prop key={k} k={k} v={v} color={c} />)}
    </div>
  )
}
