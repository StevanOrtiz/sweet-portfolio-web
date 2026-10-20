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
