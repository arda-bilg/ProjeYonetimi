const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createStore } = require('./store');
const { handleRegister } = require('./routes/register');
const { handleLogin } = require('./routes/login');
const { handleRequestReset, handleConfirmReset } = require('./routes/resetPassword');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function createServer({ dbPath } = {}) {
  const store = createStore(dbPath);
  const frontendDir = path.join(__dirname, '..', '..', 'frontend');

  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      return res.end();
    }

    const urlPath = (req.url || '/').split('?')[0];

    if (req.method === 'GET' && urlPath === '/api/health') {
      return sendJson(res, 200, { status: 'ok' });
    }

    if (req.method === 'POST' && urlPath.startsWith('/api/auth/')) {
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { error: 'Geçersiz JSON gövdesi.' });
      }

      if (urlPath === '/api/auth/register') {
        const result = handleRegister(body, store);
        return sendJson(res, result.status, result.body);
      }
      if (urlPath === '/api/auth/login') {
        const result = handleLogin(body, store);
        return sendJson(res, result.status, result.body);
      }
      if (urlPath === '/api/auth/forgot-password') {
        const result = handleRequestReset(body, store);
        return sendJson(res, result.status, result.body);
      }
      if (urlPath === '/api/auth/reset-password') {
        const result = handleConfirmReset(body, store);
        return sendJson(res, result.status, result.body);
      }
      return sendJson(res, 404, { error: 'Endpoint bulunamadı.' });
    }

    const safePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const filePath = path.normalize(path.join(frontendDir, safePath));
    if (!filePath.startsWith(frontendDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return sendJson(res, 404, { error: 'Dosya bulunamadı.' });
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  const server = createServer();
  server.listen(port, () => {
    console.log(`Authentication server running at http://localhost:${port}`);
  });
}

module.exports = { createServer };
