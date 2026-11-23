const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.json');

function createStore(dbPath = DEFAULT_DB_PATH) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  function readUsers() {
    if (!fs.existsSync(dbPath)) {
      return [];
    }
    const raw = fs.readFileSync(dbPath, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  }

  function writeUsers(users) {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
  }

  function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    const derived = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(derived, keyBuf);
  }

  function findByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    return readUsers().find((u) => u.email === normalized) || null;
  }

  function createUser({ name, email, password }) {
    const users = readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      return null;
    }
    const user = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      resetToken: null,
      resetTokenExpiresAt: null,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);
    return user;
  }

  function setResetToken(email) {
    const users = readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) return null;

    const token = crypto.randomBytes(16).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;
    writeUsers(users);
    return token;
  }

  function resetPasswordWithToken(email, token, newPassword) {
    const users = readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user || !user.resetToken || user.resetToken !== token) {
      return { ok: false, reason: 'invalid_token' };
    }
    if (Date.now() > user.resetTokenExpiresAt) {
      return { ok: false, reason: 'expired_token' };
    }
    user.passwordHash = hashPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    writeUsers(users);
    return { ok: true };
  }

  return {
    findByEmail,
    createUser,
    verifyPassword,
    setResetToken,
    resetPasswordWithToken,
  };
}

module.exports = { createStore };
