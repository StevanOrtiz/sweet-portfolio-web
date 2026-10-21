export type Row = Record<string, any>

export type Category = { id: string; name: string; sort: number }
export type Work = {
  id: string; title: string; description: string; category_id: string | null
  images: string[]; tools: string; tags: string; published: boolean; sort: number
}
export type Service = { id: string; title: string; description: string; icon: string; sort: number }
export type LinkItem = { id: string; type: string; label: string; url: string; note?: string; sort: number }
export type Tool = { id: string; name: string; level: number; note: string; icon: string; sort: number }
export type Stat = { id: string; label: string; value: string; sort: number }
export type TimelineItem = { id: string; year: string; title: string; text: string; sort: number }
export type Faq = { id: string; q: string; a: string; sort: number }
export type Profile = { id: string; name: string; tagline: string; bio: string; avatar: string; skills: string; facts: string }
export type Availability = { id: string; open: boolean; response: string; preferred: string }
export type Studio = { id: string; name: string; tagline: string; intro: string; logo: string; ceo_note: string; join_text: string }
export type StudioStat = { id: string; label: string; value: string; sort: number }
export type StudioStep = { id: string; title: string; text: string; sort: number }
export type StudioService = { id: string; title: string; description: string; icon: string; sort: number }
export type TeamMember = { id: string; name: string; role: string; bio: string; avatar: string; skills: string; link: string; ceo: boolean; sort: number }
export type Texts = Record<string, string>

export type Content = {
  categories: Category[]; works: Work[]; services: Service[]; links: LinkItem[]
  tools: Tool[]; stats: Stat[]; timeline: TimelineItem[]; faq: Faq[]
  profile: Profile; availability: Availability; texts: Texts
  studio: Studio; studioStats: StudioStat[]; studioSteps: StudioStep[]; studioServices: StudioService[]; team: TeamMember[]
}

// Raw table names, shared by the local file store and Supabase.
export const tables = ['categories', 'works', 'services', 'links', 'tools', 'stats', 'timeline', 'faq', 'profile', 'availability', 'site_texts', 'studio', 'studio_stats', 'studio_steps', 'studio_services', 'team'] as const
export type Table = (typeof tables)[number]
export type Db = Record<Table, Row[]>
