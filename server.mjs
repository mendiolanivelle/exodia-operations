import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.env.STATIC_ROOT || '/usr/share/nginx/html'
const port = Number(process.env.PORT || 80)

const types = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
}

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname)
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '')
  return join(root, safePath)
}

function headersFor(filePath) {
  const extension = extname(filePath)
  const headers = {
    'Content-Type': types[extension] || 'application/octet-stream',
  }

  if (extension === '.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  } else if (filePath.includes('/assets/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }

  return headers
}

async function existingFile(filePath) {
  const info = await stat(filePath)
  return info.isDirectory() ? join(filePath, 'index.html') : filePath
}

const server = createServer(async (request, response) => {
  const requestedPath = resolvePath(request.url)
  let filePath

  try {
    filePath = await existingFile(requestedPath)
  } catch {
    filePath = join(root, 'index.html')
  }

  response.writeHead(200, headersFor(filePath))

  if (request.method === 'HEAD') {
    response.end()
    return
  }

  createReadStream(filePath).pipe(response)
})

server.listen(port, '0.0.0.0', () => {
  const script = fileURLToPath(import.meta.url)
  console.log(`${script} serving ${root} on port ${port}`)
})
