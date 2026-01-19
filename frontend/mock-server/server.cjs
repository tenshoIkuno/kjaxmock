const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;

// simple in-memory DB
const clients = [];
const chats = [];

// helper
const now = () => new Date().toISOString();
const randDate = (daysBack) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString();
};

// generate 10 clients
for (let i = 1; i <= 10; i++) {
  clients.push({
    id: `client-${i}`,
    name: `顧問先 ${i}`,
    created_at: randDate(90),
  });
}


// generate 10 chats, each linked to a client and with 3 messages
for (let i = 1; i <= 10; i++) {
  const cid = `client-${((i - 1) % clients.length) + 1}`;
  const msgs = [];
  for (let m = 1; m <= 3; m++) {
    msgs.push({
      id: `c${i}-m${m}`,
      role: m % 2 === 1 ? 'user' : 'assistant',
      content: m % 2 === 1 ? `質問サンプル ${i}-${m}` : `応答サンプル ${i}-${m}`,
      created_at: randDate(30),
    });
  }
  chats.push({
    id: `chat-${i}`,
    title: `チャット ${i}`,
    client_id: cid,
    messages: msgs,
  });
}

// simple current user
const currentUser = {
  id: 'user-1',
  tenant_id: 'tenant-1',
  email: 'local@example.com',
  name: 'ローカル ユーザ',
  created_at: now(),
};

function sendJson(res, status, obj) {
  const b = Buffer.from(JSON.stringify(obj));
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': b.length,
  });
  res.end(b);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
      // simple csrf token endpoint for frontend boot
      if (pathname === '/csrf/token' && req.method === 'GET') {
        return sendJson(res, 200, { token: 'mock-csrf-token' });
      }

        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS: reflect origin and allow credentials so browser fetch with credentials works
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // /chats
    if (pathname === '/chats' && req.method === 'GET') {
      return sendJson(res, 200, chats);
    }

    // /clients
    if (pathname === '/clients' && req.method === 'GET') {
      return sendJson(res, 200, clients);
    }

    // create client
    if (pathname === '/clients' && req.method === 'POST') {
      const body = await parseBody(req);
      const id = `client-${clients.length + 1}`;
      const c = { id, name: body.name || `顧問先 ${id}`, created_at: now() };
      clients.push(c);
      return sendJson(res, 201, c);
    }

    // /chats/:id
    const chatIdMatch = pathname && pathname.match(/^\/chats\/(.+)/);
    if (chatIdMatch) {
      const id = chatIdMatch[1];
      const chat = chats.find((c) => c.id === id);
      if (req.method === 'GET') {
        if (!chat) return sendJson(res, 404, { message: 'not found' });
        return sendJson(res, 200, chat);
      }
      if (req.method === 'DELETE') {
        if (!chat) return sendJson(res, 404, { message: 'not found' });
        const idx = chats.indexOf(chat);
        chats.splice(idx, 1);
        return sendJson(res, 200, chat);
      }
      if (req.method === 'PATCH') {
        const body = await parseBody(req);
        if (!chat) return sendJson(res, 404, { message: 'not found' });
        if (body.title) chat.title = body.title;
        return sendJson(res, 200, chat);
      }
    }

    // /clients/:id
    const clientIdMatch = pathname && pathname.match(/^\/clients\/(.+)/);
    if (clientIdMatch) {
      const id = clientIdMatch[1];
      const client = clients.find((c) => c.id === id);
      if (req.method === 'GET') {
        if (!client) return sendJson(res, 404, { message: 'not found' });
        return sendJson(res, 200, client);
      }
      if (req.method === 'PATCH') {
        const body = await parseBody(req);
        if (!client) return sendJson(res, 404, { message: 'not found' });
        if (body.name) client.name = body.name;
        return sendJson(res, 200, client);
      }
      if (req.method === 'DELETE') {
        if (!client) return sendJson(res, 404, { message: 'not found' });
        const idx = clients.indexOf(client);
        clients.splice(idx, 1);
        return sendJson(res, 200, client);
      }
    }

    // /users/me
    if (pathname === '/users/me' && req.method === 'GET') {
      return sendJson(res, 200, currentUser);
    }

    // (dashboard records served as a plain JSON file in public/)

    // /messages/stream (POST) - simple SSE-like stream
    if (pathname === '/messages/stream' && req.method === 'POST') {
      const body = await parseBody(req);
      const { message, chat_id } = body || {};

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      });

      // send metadata first
      const metadata = {
        type: 'metadata',
        chat_id: chat_id || 'chat-local',
        title: 'ローカルチャット',
      };
      res.write(`data: ${JSON.stringify(metadata)}\n\n`);

      // simulate token streaming
      const reply = `（モック応答）: ${message || ''}`;
      let i = 0;
      const tokens = reply.match(/.{1,8}/g) || [reply];

      const interval = setInterval(() => {
        if (i >= tokens.length) {
          clearInterval(interval);
          // close stream
          res.end();
          return;
        }
        const token = { type: 'token', content: tokens[i++] };
        res.write(`data: ${JSON.stringify(token)}\n\n`);
      }, 120);

      return;
    }

    // Not found
    return sendJson(res, 404, { message: 'not found' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: 'internal error' });
  }
});

server.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
