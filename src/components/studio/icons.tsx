import { Box, Briefcase, Code, Code2, Globe, Link2, Mail, Map as MapIcon, MessageCircle, Sun } from 'lucide-react'

export const serviceIcons: Record<string, React.ReactNode> = {
  box: <Box />, map: <MapIcon />, sun: <Sun />, code: <Code />,
}

export const linkIcon = (type: string, size = 18) => {
  switch (type) {
    case 'discord': return <MessageCircle size={size} />
    case 'email': return <Mail size={size} />
    case 'github': return <Code2 size={size} />
    case 'linkedin': return <Briefcase size={size} />
    case 'roblox': case 'x': return <Globe size={size} />
    default: return <Link2 size={size} />
  }
}

import { Brush, Hammer, Layers, Shapes, Sparkles } from 'lucide-react'

const toolIcons: Record<string, typeof Box> = { cube: Box, shapes: Shapes, sun: Sun, map: MapIcon, code: Code, layers: Layers, brush: Brush, hammer: Hammer, sparkles: Sparkles }
export const toolIcon = (key: string, size = 22) => {
  const Icon = toolIcons[key] ?? Box
  return <Icon size={size} />
}
