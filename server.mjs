import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTransport } from 'nodemailer'

const root = process.env.STATIC_ROOT || '/usr/share/nginx/html'
const port = Number(process.env.PORT || 80)
const gmailUser = process.env.GMAIL_USER || ''
const gmailAppPass = process.env.GMAIL_APP_PASS || ''

const transporter = gmailUser && gmailAppPass
  ? createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailAppPass },
    })
  : null

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

function readBody(request) {
  return new Promise((resolve) => {
    const chunks = []
    request.on('data', (c) => chunks.push(c))
    request.on('end', () => resolve(Buffer.concat(chunks).toString()))
  })
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost')
  const pathname = url.pathname

  if (pathname === '/api/send-email' && request.method === 'POST') {
    try {
      if (!transporter) {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ success: true, message: 'Email queued (Gmail not configured)' }))
        return
      }
      const body = JSON.parse(await readBody(request))
      const info = await transporter.sendMail({
        from: `"Exodia Operations" <${gmailUser}>`,
        to: body.to,
        subject: body.subject || 'No Subject',
        text: body.body || '',
      })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ success: true, messageId: info.messageId }))
    } catch (err) {
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ success: false, error: err.message }))
    }
    return
  }

  const trackingId = url.searchParams.get('tracking_id')

  const ticketMatch = pathname.match(/^\/ticket\/(.+)$/)
  if (ticketMatch) {
    response.writeHead(302, { Location: `/?tracking_id=${encodeURIComponent(ticketMatch[1])}` })
    response.end()
    return
  }

  if (trackingId && pathname !== '/') {
    response.writeHead(302, { Location: `/?tracking_id=${trackingId}` })
    response.end()
    return
  }

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
  if (transporter) console.log('Gmail SMTP configured and ready')
  else console.log('Gmail not configured — set GMAIL_USER and GMAIL_APP_PASS env vars')
})