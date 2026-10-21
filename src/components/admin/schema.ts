import { BarChart3, Building2, CircleHelp, Folder, History, Image, Layers, Link2, ListOrdered, Radio, Shapes, Type, User, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { Row, Table } from '../../types'

export type FieldType = 'text' | 'textarea' | 'level' | 'bool' | 'images' | 'image' | 'category' | 'linktype' | 'icon'
export type Field = {
  key: string; label: string; type?: FieldType; help?: string; placeholder?: string; required?: boolean
  url?: boolean; options?: string[]; iconKind?: 'service' | 'tool'
}
export type Entity = {
  table: Table; label: string; noun: string; icon: LucideIcon; titleKey: string; defaults: Row; fields: Field[]
  singleton?: boolean; hint?: string
  subtitle?: (r: Row) => string; thumb?: (r: Row) => string | undefined; badge?: (r: Row) => string | undefined
}

export const linkTypes = ['discord', 'email', 'roblox', 'x', 'github', 'linkedin', 'other']
const serviceIcons = ['box', 'map', 'sun', 'code']
const toolIcons = ['cube', 'shapes', 'sun', 'map', 'code', 'layers', 'brush', 'hammer', 'sparkles']
const clip = (s: string, n = 48) => (s.length > n ? s.slice(0, n) + '...' : s)

export const entities: Entity[] = [
  { table: 'works', label: 'Works', noun: 'work', icon: Image, titleKey: 'title', hint: 'Projects shown in the gallery. The first image is the cover; the rest appear on the back of the card.',
    defaults: { title: '', description: '', category_id: null, images: [], tools: '', tags: '', published: true, sort: 0 },
    subtitle: (r) => `${r.images?.length ?? 0} image${r.images?.length === 1 ? '' : 's'}`, thumb: (r) => r.images?.[0], badge: (r) => (r.published ? undefined : 'Draft'),
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Medieval castle' },
      { key: 'images', label: 'Images', type: 'images', help: 'Drop renders here. Drag to reorder; the first is the cover.' },
      { key: 'description', label: 'Description', type: 'textarea', help: 'Shown over the image when the card flips. Keep it short.' },
      { key: 'category_id', label: 'Category', type: 'category' },
      { key: 'tools', label: 'Tools', placeholder: 'Roblox Studio, Blender' },
      { key: 'tags', label: 'Tags', placeholder: 'build, terrain', help: 'Comma separated.' },
      { key: 'published', label: 'Published', type: 'bool', help: 'Turn off to keep it as a hidden draft.' },
    ] },
  { table: 'categories', label: 'Categories', noun: 'category', icon: Folder, titleKey: 'name', hint: 'Folders in the gallery and Explorer.',
    defaults: { name: '', sort: 0 }, fields: [{ key: 'name', label: 'Name', required: true, placeholder: 'Environments' }] },
  { table: 'services', label: 'Services', noun: 'service', icon: Wrench, titleKey: 'title', hint: 'What you can build or solve. No prices.',
    defaults: { title: '', description: '', icon: 'box', sort: 0 }, subtitle: (r) => clip(r.description ?? ''),
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon', type: 'icon', options: serviceIcons, iconKind: 'service' },
    ] },
  { table: 'profile', label: 'About me', noun: 'profile', icon: User, titleKey: 'name', singleton: true, hint: 'Your name, bio and skills. Shown on Home and About.',
    defaults: { name: '', tagline: '', bio: '', avatar: '', skills: '', facts: '' },
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'tagline', label: 'Tagline', placeholder: 'Roblox Builder & 3D Modeler' },
      { key: 'avatar', label: 'Avatar', type: 'image', help: 'Square images work best.' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'skills', label: 'Skills', help: 'Comma separated.' },
      { key: 'facts', label: 'Fun facts', help: 'Comma separated.' },
    ] },
  { table: 'tools', label: 'Toolbelt', noun: 'tool', icon: Shapes, titleKey: 'name', hint: 'Slots in the Home hotbar (first nine) and the About toolbelt.',
    defaults: { name: '', level: 50, note: '', icon: 'cube', sort: 0 }, subtitle: (r) => `${r.level ?? 0}%`,
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'level', label: 'Skill level', type: 'level' },
      { key: 'icon', label: 'Icon', type: 'icon', options: toolIcons, iconKind: 'tool' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ] },
  { table: 'stats', label: 'Stats', noun: 'stat', icon: BarChart3, titleKey: 'label', hint: 'The three numbers on your Home card.',
    defaults: { label: '', value: '', sort: 0 }, subtitle: (r) => r.value ?? '',
    fields: [{ key: 'label', label: 'Label', required: true, placeholder: 'Builds' }, { key: 'value', label: 'Value', placeholder: '50+' }] },
  { table: 'timeline', label: 'Journey', noun: 'milestone', icon: History, titleKey: 'title', hint: 'Milestones on the About page.',
    defaults: { year: '', title: '', text: '', sort: 0 }, subtitle: (r) => r.year ?? '',
    fields: [{ key: 'year', label: 'Year', placeholder: '2024' }, { key: 'title', label: 'Title', required: true }, { key: 'text', label: 'Text', type: 'textarea' }] },
  { table: 'links', label: 'Channels', noun: 'channel', icon: Link2, titleKey: 'label', hint: 'Contact channels. The message appears in the channel window.',
    defaults: { type: 'other', label: '', url: 'https://', note: '', sort: 0 }, subtitle: (r) => clip(r.url ?? ''),
    fields: [
      { key: 'type', label: 'Type', type: 'linktype' },
      { key: 'label', label: 'Label', required: true, placeholder: 'Discord' },
      { key: 'url', label: 'URL', required: true, url: true, placeholder: 'https://discord.com/users/... or mailto:you@mail.com' },
      { key: 'note', label: 'Window message', type: 'textarea', help: 'Optional. Leave empty to use the default message for this type.' },
    ] },
  { table: 'availability', label: 'Availability', noun: 'availability', icon: Radio, titleKey: 'response', singleton: true, hint: 'The status badge on Home and Contact.',
    defaults: { open: true, response: '', preferred: 'discord' },
    fields: [
      { key: 'open', label: 'Open for commissions', type: 'bool' },
      { key: 'response', label: 'Response time', placeholder: 'Usually replies within 24 hours' },
      { key: 'preferred', label: 'Preferred channel', type: 'linktype', help: 'Must match the type of one of your channels.' },
    ] },
  { table: 'faq', label: 'FAQ', noun: 'question', icon: CircleHelp, titleKey: 'q', hint: 'Commission questions on the Contact page.',
    defaults: { q: '', a: '', sort: 0 }, fields: [{ key: 'q', label: 'Question', required: true }, { key: 'a', label: 'Answer', type: 'textarea' }] },
  { table: 'studio', label: 'Studio', noun: 'studio', icon: Building2, titleKey: 'name', singleton: true, hint: 'Header of the Ware Studios tab.',
    defaults: { name: 'WARE STUDIOS', tagline: '', intro: '', logo: '', ceo_note: '', join_text: '' },
    fields: [
      { key: 'name', label: 'Studio name', required: true },
      { key: 'tagline', label: 'Tagline' },
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'ceo_note', label: 'CEO note' },
      { key: 'join_text', label: 'Call to action text', type: 'textarea' },
    ] },
  { table: 'team', label: 'Team', noun: 'member', icon: Users, titleKey: 'name', hint: 'Team cards. Mark one as CEO to feature them first.',
    defaults: { name: '', role: '', bio: '', avatar: '', skills: '', link: '', ceo: false, sort: 0 },
    subtitle: (r) => r.role ?? '', thumb: (r) => r.avatar || undefined, badge: (r) => (r.ceo ? 'CEO' : undefined),
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'role', label: 'Role' },
      { key: 'avatar', label: 'Avatar', type: 'image' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'skills', label: 'Skills', help: 'Comma separated.' },
      { key: 'link', label: 'Link', url: true, placeholder: 'https://...' },
      { key: 'ceo', label: 'CEO', type: 'bool', help: 'Shown first and larger.' },
    ] },
  { table: 'studio_stats', label: 'Studio stats', noun: 'stat', icon: BarChart3, titleKey: 'label', hint: 'Numbers count up on the Ware Studios tab.',
    defaults: { label: '', value: '', sort: 0 }, subtitle: (r) => r.value ?? '',
    fields: [{ key: 'label', label: 'Label', required: true }, { key: 'value', label: 'Value', help: 'Numbers like 50+ animate.' }] },
  { table: 'studio_steps', label: 'Process', noun: 'step', icon: ListOrdered, titleKey: 'title', hint: 'How a commission works, in order.',
    defaults: { title: '', text: '', sort: 0 }, fields: [{ key: 'title', label: 'Title', required: true }, { key: 'text', label: 'Text', type: 'textarea' }] },
  { table: 'studio_services', label: 'Studio services', noun: 'service', icon: Layers, titleKey: 'title', hint: 'What the studio offers.',
    defaults: { title: '', description: '', icon: 'box', sort: 0 }, subtitle: (r) => clip(r.description ?? ''),
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon', type: 'icon', options: serviceIcons, iconKind: 'service' },
    ] },
  { table: 'site_texts', label: 'Texts', noun: 'text', icon: Type, titleKey: 'key', hint: 'Loose texts: hero_title (Home greeting) and contact_intro.',
    defaults: { key: '', value: '' }, subtitle: (r) => clip(r.value ?? ''),
    fields: [{ key: 'key', label: 'Key', required: true, help: 'hero_title or contact_intro' }, { key: 'value', label: 'Value', type: 'textarea' }] },
]

export const navGroups: { label: string; tables: Table[] }[] = [
  { label: 'Portfolio', tables: ['works', 'categories', 'services'] },
  { label: 'Home & About', tables: ['profile', 'tools', 'stats', 'timeline'] },
  { label: 'Contact', tables: ['links', 'availability', 'faq'] },
  { label: 'Ware Studios', tables: ['studio', 'team', 'studio_stats', 'studio_steps', 'studio_services'] },
  { label: 'Site', tables: ['site_texts'] },
]

export function validate(fields: Field[], row: Row): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    const v = row[f.key]
    if (f.required && (v === undefined || v === null || String(v).trim() === '')) errors[f.key] = 'Required'
    else if (f.url && v && !/^(https?:\/\/|mailto:)\S+/.test(String(v))) errors[f.key] = 'Use a full link starting with https:// or mailto:'
    else if (f.type === 'level' && (Number(v) < 0 || Number(v) > 100)) errors[f.key] = 'Between 0 and 100'
  }
  return errors
}
