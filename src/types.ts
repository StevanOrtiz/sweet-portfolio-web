export type Category = { id: string; name: string; sort: number }
export type Work = {
  id: string; title: string; description: string; category_id: string | null
  images: string[]; tools: string; tags: string; published: boolean; sort: number
}
export type Service = { id: string; title: string; description: string; icon: string; sort: number }
export type LinkItem = { id: string; type: string; label: string; url: string; note?: string; sort: number }
export type Profile = { id: string; name: string; tagline: string; bio: string; avatar: string; skills: string }
export type Texts = Record<string, string>

export type Content = {
  categories: Category[]; works: Work[]; services: Service[]
  links: LinkItem[]; profile: Profile; texts: Texts
}
