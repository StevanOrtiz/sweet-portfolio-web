// Sunset low-poly palette. Keep in sync with tailwind.config.js.
export const accents = { coral: '#ff6b57', violet: '#b78ad9', amber: '#f3c677', mint: '#4cc3bd', rose: '#ff8fa3' }
export const border = '#43386b'
const cycle = [accents.coral, accents.violet, accents.amber, accents.mint, accents.rose]
export const pick = (i: number) => cycle[((i % cycle.length) + cycle.length) % cycle.length]

export const linkColor = (type: string) =>
  ({ discord: accents.violet, email: accents.amber, roblox: accents.rose, github: accents.mint, x: accents.coral, linkedin: accents.mint } as Record<string, string>)[type] ?? accents.coral

export const defaultNote = (type: string) =>
  ({
    discord: 'Discord is where I reply most often. If you have questions or want to talk about a commission, I prefer you reach out here.',
    email: 'Best for formal requests or detailed briefs. I usually answer within a day or two.',
    roblox: 'My Roblox profile has my published work and groups.',
    github: 'Code projects and web experiments live here.',
    x: 'Updates and work-in-progress shots. DMs are open.',
    linkedin: 'My professional profile and software development background.',
  } as Record<string, string>)[type] ?? 'Get in touch through this channel.'
