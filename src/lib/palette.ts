export const accents = { blue: '#0d99ff', violet: '#a66bff', amber: '#ffb02e', mint: '#2ee6a6', rose: '#ff5d8f' }
const cycle = [accents.blue, accents.violet, accents.amber, accents.mint, accents.rose]
export const pick = (i: number) => cycle[((i % cycle.length) + cycle.length) % cycle.length]

export const linkColor = (type: string) =>
  ({ discord: accents.violet, email: accents.amber, roblox: accents.rose, github: accents.mint, x: accents.blue, linkedin: accents.blue } as Record<string, string>)[type] ?? accents.blue

export const defaultNote = (type: string) =>
  ({
    discord: 'Discord is where I reply most often. If you have questions or want to talk about a commission, I prefer you reach out here.',
    email: 'Best for formal requests or detailed briefs. I usually answer within a day or two.',
    roblox: 'My Roblox profile has my published work and groups.',
    github: 'Code projects and web experiments live here.',
    x: 'Updates and work-in-progress shots. DMs are open.',
    linkedin: 'My professional profile and software development background.',
  } as Record<string, string>)[type] ?? 'Get in touch through this channel.'
