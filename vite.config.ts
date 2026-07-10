import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

/* ─── Email HTML template ─── */

function buildEmailHtml(fields: {
  name: string
  company: string
  email: string
  message: string
  timestamp: string
  page_url: string
}): string {
  const { name, company, email, message, timestamp, page_url } = fields

  const formatted = new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Demo Request — MIRA Website</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:18px;font-weight:800;color:#FFD400;letter-spacing:-0.02em;">MIRA</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.12em;text-transform:uppercase;">Demo Request</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

              <!-- Yellow top bar -->
              <div style="height:3px;background:linear-gradient(90deg,transparent,#FFD400 40%,transparent);"></div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px 12px;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);">New Submission</p>
                    <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.025em;line-height:1.2;">New Demo Request</h1>
                  </td>
                </tr>

                <!-- Fields -->
                <tr>
                  <td style="padding:24px 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">

                      ${[
                        { label: 'Full Name',   value: name },
                        { label: 'Company',     value: company },
                        { label: 'Work Email',  value: email, isEmail: true },
                      ].map(row => `
                      <tr>
                        <td style="padding-bottom:20px;vertical-align:top;width:120px;">
                          <p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.3);">${row.label}</p>
                        </td>
                        <td style="padding-bottom:20px;vertical-align:top;">
                          ${(row as { isEmail?: boolean }).isEmail
                            ? `<a href="mailto:${row.value}" style="color:#FFD400;text-decoration:none;font-size:14px;font-weight:500;">${row.value}</a>`
                            : `<p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:500;">${row.value}</p>`
                          }
                        </td>
                      </tr>`).join('')}

                    </table>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="padding:0 40px 32px;">
                    <p style="margin:0 0 10px;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.3);">Message</p>
                    <div style="background:#0e0e0e;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 18px;">
                      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.72);line-height:1.72;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                    </div>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
                  </td>
                </tr>

                <!-- Meta -->
                <tr>
                  <td style="padding:20px 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:8px;vertical-align:top;width:120px;">
                          <p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.22);">Submitted</p>
                        </td>
                        <td style="padding-bottom:8px;vertical-align:top;">
                          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);">${formatted}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align:top;width:120px;">
                          <p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.22);">Source URL</p>
                        </td>
                        <td style="vertical-align:top;">
                          <a href="${page_url}" style="font-size:12px;color:rgba(255,255,255,0.38);text-decoration:none;word-break:break-all;">${page_url}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
                This email was sent automatically by the MIRA website contact form.<br/>
                Reply directly to this email to respond to <strong style="color:rgba(255,255,255,0.35);">${name}</strong>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/* ─── Body parser ─── */

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => (data += chunk.toString()))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/* ─── Contact API plugin ─── */

function contactApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'mira-contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req: IncomingMessage, res: ServerResponse) => {
        // CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.writeHead(204).end()
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const raw = await readBody(req)
          const body = JSON.parse(raw) as {
            name?: string; company?: string; email?: string
            message?: string; timestamp?: string; page_url?: string
          }

          const { name = '', company = '', email = '', message = '',
                  timestamp = new Date().toISOString(),
                  page_url = 'https://ai-mira.tech' } = body

          if (!name || !company || !email || !message) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'All fields are required.' }))
            return
          }

          const apiKey = env.RESEND_API_KEY
          if (!apiKey || apiKey === 're_your_api_key_here') {
            console.warn('[MIRA] RESEND_API_KEY not configured — email not sent.')
            // Return success so the form UX still works during local development
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, dev: true }))
            return
          }

          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Sender must be a verified domain in your Resend account.
              // Verify ai-mira.tech at: https://resend.com/domains
              from: 'MIRA Website <noreply@ai-mira.tech>',
              to: ['hello@ai-mira.tech'],
              reply_to: email,
              subject: 'New Demo Request — MIRA Website',
              html: buildEmailHtml({ name, company, email, message, timestamp, page_url }),
            }),
          })

          if (!resendRes.ok) {
            const errBody = await resendRes.json().catch(() => ({})) as { message?: string; name?: string }
            const detail = errBody.message ?? errBody.name ?? `HTTP ${resendRes.status}`
            console.error('[MIRA] Resend error:', detail)
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `Email delivery failed: ${detail}` }))
            return
          }

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))

        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unexpected server error'
          console.error('[MIRA] Contact API error:', msg)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Something went wrong. Please try again or email us directly at hello@ai-mira.tech.' }))
        }
      })
    },
  }
}

/* ─── Vite config ─── */


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_-prefixed) — they stay server-side only
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
    figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make — do not remove
      react(),
      tailwindcss(),
      contactApiPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
