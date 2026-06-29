const KV_KEY = 'mapa-rescued';

let memoryStore: string | null = null;

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const kv = context.env?.MAPA_KV || context.env?.KV;

  if (context.request.method === 'GET') {
    try {
      if (kv) {
        const raw = await kv.get(KV_KEY);
        if (raw) {
          return new Response(raw, {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
      }
      if (memoryStore) {
        return new Response(memoryStore, {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  if (context.request.method === 'POST') {
    try {
      const body = await context.request.text();
      if (kv) {
        await kv.put(KV_KEY, body);
      }
      memoryStore = body;
      return new Response(JSON.stringify({ ok: true, kv: !!kv }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch {
      return new Response(JSON.stringify({ ok: false }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
