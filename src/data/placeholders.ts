import type { Content } from '../types'

// Generates a gradient SVG so placeholders need no image files.
export const placeholderImage = (label: string, hue: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,28%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360},60%,12%)"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><text x="640" y="370" fill="#ffffff99" font-family="monospace" font-size="42" text-anchor="middle">${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const placeholders: Content = {
  categories: [
    { id: 'c1', name: 'Environments', sort: 1 },
    { id: 'c2', name: 'Props & Assets', sort: 2 },
    { id: 'c3', name: 'Characters', sort: 3 },
  ],
  works: [
    { id: 'w1', title: 'Placeholder Island', description: 'Replace me from /admin with a real render.', category_id: 'c1', images: [placeholderImage('Placeholder Island', 200)], tools: 'Roblox Studio', tags: 'build, terrain', published: true, sort: 1 },
    { id: 'w2', title: 'Placeholder Castle', description: 'Replace me from /admin with a real render.', category_id: 'c1', images: [placeholderImage('Placeholder Castle', 280)], tools: 'Roblox Studio', tags: 'build, medieval', published: true, sort: 2 },
    { id: 'w3', title: 'Placeholder Sword', description: 'Replace me from /admin with a real render.', category_id: 'c2', images: [placeholderImage('Placeholder Sword', 20)], tools: 'Blender', tags: 'model, weapon', published: true, sort: 3 },
    { id: 'w4', title: 'Placeholder Character', description: 'Replace me from /admin with a real render.', category_id: 'c3', images: [placeholderImage('Placeholder Character', 140)], tools: 'Blender', tags: 'model, rig', published: true, sort: 4 },
  ],
  services: [
    { id: 's1', title: 'Map & Environment Building', description: 'Detailed worlds, interiors and terrain built directly in Roblox Studio.', icon: 'map', sort: 1 },
    { id: 's2', title: '3D Modeling', description: 'Props, weapons, vehicles and assets modeled and optimized for Roblox.', icon: 'box', sort: 2 },
    { id: 's3', title: 'Lighting & Atmosphere', description: 'Mood, post-processing and lighting setups that make a place feel alive.', icon: 'sun', sort: 3 },
    { id: 's4', title: 'Web & App Solutions', description: 'Websites and small applications as a software development student.', icon: 'code', sort: 4 },
  ],
  links: [
    { id: 'l1', type: 'discord', label: 'Discord', url: 'https://discord.com', sort: 1 },
    { id: 'l2', type: 'email', label: 'Email', url: 'mailto:stevanortiz233@gmail.com', sort: 2 },
    { id: 'l3', type: 'roblox', label: 'Roblox', url: 'https://www.roblox.com', sort: 3 },
    { id: 'l4', type: 'github', label: 'GitHub', url: 'https://github.com/stevanortiz', sort: 4 },
  ],
  profile: {
    id: 'p1',
    name: 'Your Name',
    tagline: 'Roblox Builder & 3D Modeler',
    bio: 'Software development student and professional Roblox Studio builder. Edit this text from /admin.',
    avatar: '',
    skills: 'Roblox Studio, Blender, Lighting, Terrain, Web development',
  },
  texts: {
    hero_title: 'Building worlds for Roblox.',
    hero_subtitle: 'Select an item in the Explorer to inspect my work.',
    contact_intro: 'Open for commissions. Reach out through any channel below.',
  },
}
