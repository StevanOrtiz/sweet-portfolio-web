import { useContent } from '../../lib/content'

const Prop = ({ k, v }: { k: string; v: string }) => (
  <div className="flex border-b border-studio-border/50 text-[13px]">
    <div className="w-1/3 shrink-0 truncate px-2 py-1 text-studio-dim">{k}</div>
    <div className="min-w-0 flex-1 break-words px-2 py-1">{v || '—'}</div>
  </div>
)

export default function Properties({ selected }: { selected: string }) {
  const { content } = useContent()
  let rows: [string, string][] = [['Name', 'Workspace'], ['ClassName', 'Model']]

  if (selected.startsWith('work:')) {
    const w = content.works.find((x) => x.id === selected.slice(5))
    if (w) rows = [
      ['Name', w.title], ['ClassName', 'Render'],
      ['Category', content.categories.find((c) => c.id === w.category_id)?.name ?? ''],
      ['Tools', w.tools], ['Tags', w.tags], ['Images', String(w.images.length)],
    ]
  } else if (selected.startsWith('cat:')) {
    const c = content.categories.find((x) => x.id === selected.slice(4))
    rows = [['Name', c?.name ?? ''], ['ClassName', 'Folder'], ['Children', String(content.works.filter((w) => w.category_id === c?.id && w.published).length)]]
  } else if (selected === 'gallery') {
    rows = [['Name', 'Gallery'], ['ClassName', 'Folder'], ['Children', String(content.works.filter((w) => w.published).length)]]
  } else if (selected === 'services') {
    rows = [['Name', 'Services'], ['ClassName', 'Folder'], ['Children', String(content.services.length)]]
  } else if (selected === 'about') {
    rows = [['Name', content.profile.name], ['ClassName', 'Profile'], ['Skills', content.profile.skills]]
  } else if (selected === 'contact') {
    rows = [['Name', 'Contact'], ['ClassName', 'Folder'], ['Channels', String(content.links.length)]]
  }

  return (
    <div aria-label="Properties" className="h-full overflow-y-auto">
      {rows.map(([k, v]) => <Prop key={k} k={k} v={v} />)}
    </div>
  )
}
