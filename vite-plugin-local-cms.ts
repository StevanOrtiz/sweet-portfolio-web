import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'

const MAX_BYTES = 25 * 1024 * 1024
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'])

const readBody = (req: NodeJS.ReadableStream) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > MAX_BYTES) reject(new Error('Payload too large'))
      else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

// Dev-only content API: the admin edits src/data/content.json and public/uploads on disk.
export default function localCms(): Plugin {
  const root = process.cwd()
  const dataFile = path.join(root, 'src/data/content.json')
  const uploadDir = path.join(root, 'public/uploads')

  return {
    name: 'local-cms',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__cms', async (req, res) => {
        const send = (code: number, body: unknown, type = 'application/json') => {
          res.statusCode = code
          res.setHeader('Content-Type', type)
          res.end(typeof body === 'string' ? body : JSON.stringify(body))
        }
        try {
          // Only the machine running the dev server may use this (blocks DNS rebinding / LAN access).
          const host = (req.headers.host ?? '').split(':')[0]
          if (host !== 'localhost' && host !== '127.0.0.1') return send(403, 'Forbidden', 'text/plain')

          const url = new URL(req.url ?? '/', 'http://localhost')
          if (req.method === 'GET' && url.pathname === '/load') return send(200, await readFile(dataFile, 'utf8'))

          if (req.method === 'POST' && url.pathname === '/save') {
            const body = (await readBody(req)).toString('utf8')
            JSON.parse(body)
            await writeFile(dataFile, JSON.stringify(JSON.parse(body), null, 2) + '\n')
            return send(200, { ok: true })
          }

          if (req.method === 'POST' && url.pathname === '/upload') {
            const original = path.basename(url.searchParams.get('name') ?? 'image')
            const ext = path.extname(original).toLowerCase()
            if (!IMAGE_EXT.has(ext)) return send(400, 'Unsupported file type', 'text/plain')
            const safe = original.replace(/[^\w.-]/g, '_')
            const file = `${Date.now()}-${safe}`
            await mkdir(uploadDir, { recursive: true })
            await writeFile(path.join(uploadDir, file), await readBody(req))
            return send(200, { url: `/uploads/${file}` })
          }
          send(404, 'Not found', 'text/plain')
        } catch (e) {
          send(500, (e as Error).message, 'text/plain')
        }
      })
    },
  }
}
