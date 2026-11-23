const crypto = require('node:crypto');

function handleLogin(reqBody, store) {
  const { email, password } = reqBody || {};

  if (!email || !password) {
    return { status: 400, body: { error: 'E-posta ve şifre zorunludur.' } };
  }

  const user = store.findByEmail(email);
  if (!user || !store.verifyPassword(password, user.passwordHash)) {
    return { status: 401, body: { error: 'E-posta veya şifre hatalı.' } };
  }

  const sessionToken = crypto.randomBytes(24).toString('hex');
  return {
    status: 200,
    body: {
      message: 'Giriş başarılı.',
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  };
}

module.exports = { handleLogin };
