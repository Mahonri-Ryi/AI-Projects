/**
 * Optional CORS proxy for Little Dream Sleep Coach.
 * Deploy to Cloudflare Workers; users paste the worker URL in app settings.
 * Does not log or store API keys.
 */
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: cors })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\//, '')
    const target = `https://api.openai.com/${path || 'v1/chat/completions'}`

    const auth = request.headers.get('Authorization')
    if (!auth) {
      return new Response(JSON.stringify({ error: { message: 'Missing Authorization' } }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: request.body,
    })

    return new Response(res.body, {
      status: res.status,
      headers: {
        ...cors,
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    })
  },
}
