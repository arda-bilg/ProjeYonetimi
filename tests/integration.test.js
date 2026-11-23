const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createServer } = require('../backend/src/server');

describe('Authentication Modülü Entegrasyon Testleri (AUTH-7)', () => {
  let server;
  let baseUrl;
  let tempDir;

  before(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-test-'));
    const dbPath = path.join(tempDir, 'users.json');
    server = createServer({ dbPath });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('AUTH-4: Yeni kullanıcı kaydı başarılı olmalı ve mükerrer kayıt engellenmeli', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.user.email, 'test@example.com');

    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    assert.equal(dupRes.status, 409);
  });

  it('AUTH-5: Geçerli bilgilerle giriş yapılabilmeli, hatalı şifre reddedilmeli', async () => {
    const badRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
    });
    assert.equal(badRes.status, 401);

    const okRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    assert.equal(okRes.status, 200);
    const body = await okRes.json();
    assert.ok(body.token);
  });

  it('AUTH-6: Şifre sıfırlama kodu ile şifre güncellenebilmeli', async () => {
    const reqRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    assert.equal(reqRes.status, 200);
    const { resetToken } = await reqRes.json();
    assert.ok(resetToken);

    const confirmRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        token: resetToken,
        newPassword: 'newPassword456',
      }),
    });
    assert.equal(confirmRes.status, 200);

    const loginNewRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'newPassword456' }),
    });
    assert.equal(loginNewRes.status, 200);
  });
});
