// Obsidian + ice palette: neutral base, ONE accent (ice), steel for secondary text. Keep in sync with tailwind.config.js.
export const accents = { ice: '#8cc8e8', steel: '#b4bfcc', ok: '#7fd4a0', warn: '#d9b36a' }
export const border = '#2a3038'
const cycle = [accents.ice, accents.steel, accents.ice, accents.steel, accents.ice]
export const pick = (i: number) => cycle[((i % cycle.length) + cycle.length) % cycle.length]

// Every channel shares the single accent; the icon and label tell them apart.
export const linkColor = (_type: string) => accents.ice

export const defaultNote = (type: string) =>
  ({
    discord: 'Discord is where I reply most often. If you have questions or want to talk about a commission, I prefer you reach out here.',
    email: 'Best for formal requests or detailed briefs. I usually answer within a day or two.',
    roblox: 'My Roblox profile has my published work and groups.',
    github: 'Code projects and web experiments live here.',
    x: 'Updates and work-in-progress shots. DMs are open.',
    linkedin: 'My professional profile and software development background.',
  } as Record<string, string>)[type] ?? 'Get in touch through this channel.'
