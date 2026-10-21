import type { Content } from '../types'

export type Issue = { level: 'error' | 'warn'; text: string }
export type BulkWork = { title: string; description: string; category: string; images: string[]; tools: string; tags: string; published: boolean }
export type BulkItem = { index: number; work: BulkWork; issues: Issue[] }

const text = (v: unknown): string =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).join(', ') : typeof v === 'string' ? v.trim() : v == null ? '' : String(v)

function imageList(v: unknown): string[] {
  if (typeof v === 'string') return v.trim() ? [v.trim()] : []
  return Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []
}

function normalize(o: any, index: number): BulkItem {
  const issues: Issue[] = []
  if (!o || typeof o !== 'object' || Array.isArray(o)) {
    return { index, work: { title: '', description: '', category: '', images: [], tools: '', tags: '', published: true }, issues: [{ level: 'error', text: 'Entry is not an object' }] }
  }
  const work: BulkWork = {
    title: text(o.title ?? o.name),
    description: text(o.description ?? o.desc),
    category: text(o.category),
    images: imageList(o.images ?? o.image),
    tools: text(o.tools),
    tags: text(o.tags),
    published: typeof (o.published ?? o.visible) === 'boolean' ? (o.published ?? o.visible) : true,
  }
  if (!work.title) issues.push({ level: 'error', text: 'Missing title' })
  if (!work.images.length) issues.push({ level: 'warn', text: 'No images' })
  if (!work.description) issues.push({ level: 'warn', text: 'No description' })
  if (!work.category) issues.push({ level: 'warn', text: 'No category' })
  return { index, work, issues }
}

export function parseBulk(src: string): { items: BulkItem[]; fatal?: string } {
  if (!src.trim()) return { items: [] }
  let data: any
  try { data = JSON.parse(src) } catch (e) { return { items: [], fatal: `Invalid JSON: ${(e as Error).message}` } }
  const list = Array.isArray(data) ? data : Array.isArray(data?.works) ? data.works : null
  if (!list) return { items: [], fatal: 'Expected an array of projects, or an object with a "works" array.' }
  const items = list.map(normalize)
  const seen = new Map<string, number>()
  for (const it of items) {
    const k = it.work.title.toLowerCase()
    if (!k) continue
    if (seen.has(k)) it.issues.push({ level: 'warn', text: `Same title as entry ${seen.get(k)! + 1}` })
    else seen.set(k, it.index)
  }
  return { items }
}

// Bare file names point at public/uploads; full URLs and absolute paths are kept as they are.
export function resolveImage(ref: string, uploaded: Record<string, string>): string {
  if (uploaded[ref]) return uploaded[ref]
  const base = ref.split('/').pop()!.toLowerCase()
  const hit = Object.keys(uploaded).find((k) => k.toLowerCase() === base)
  if (hit) return uploaded[hit]
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('/') || ref.startsWith('data:')) return ref
  return `/uploads/${ref}`
}

export const templateJson = JSON.stringify({
  works: [
    { title: 'Medieval Castle', description: 'A hilltop fortress with a working drawbridge and detailed interiors.', category: 'Environments', images: ['castle-1.png', 'castle-2.png', 'castle-3.png'], tools: 'Roblox Studio', tags: 'build, medieval, interior', published: true },
    { title: 'Crystal Sword', description: 'Stylized low-poly sword with an emissive blade.', category: 'Props & Assets', images: ['sword-1.png'], tools: 'Blender', tags: 'model, weapon', published: true },
  ],
}, null, 2)

export function exportWorks(c: Content): string {
  const cat = (id: string | null) => c.categories.find((x) => x.id === id)?.name ?? ''
  return JSON.stringify({
    works: c.works.map((w) => ({ title: w.title, description: w.description, category: cat(w.category_id), images: w.images, tools: w.tools, tags: w.tags, published: w.published })),
  }, null, 2)
}
