/**
 * CORS proxy for Little Dream Sleep Coach.
 * - /cursor/*  → api.cursor.com (Cursor API key in Authorization header)
 * - /*         → api.openai.com (OpenAI key, legacy path)
 */
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    const url = new URL(request.url)
    const auth = request.headers.get('Authorization')

    if (!auth && (url.pathname === '/' || url.pathname === '')) {
      return new Response(
        JSON.stringify({
          ok: true,
          service: 'Little Dream Sleep Coach proxy',
          hint: 'Do not open this in a browser for chat. In the app: Coach → Setup → Proxy URL + crsr_ key → Test key.',
        }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    if (!auth) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Missing Authorization',
            hint: 'Only the Little Dream app (or curl with Authorization) should call this proxy.',
          },
        }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    let target

    if (url.pathname.startsWith('/cursor/')) {
      const path = url.pathname.replace(/^\/cursor/, '') || '/'
      target = `https://api.cursor.com${path}${url.search}`
    } else {
      const path = url.pathname.replace(/^\//, '')
      target = `https://api.openai.com/${path || 'v1/chat/completions'}${url.search}`
    }

    const headers = {
      Authorization: auth,
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    }

    const res = await fetch(target, {
      method: request.method,
      headers: request.method === 'GET' ? { Authorization: auth } : headers,
      body: request.method === 'GET' ? undefined : request.body,
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
