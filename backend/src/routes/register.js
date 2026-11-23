const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function handleRegister(reqBody, store) {
  const { name, email, password } = reqBody || {};

  if (!name || String(name).trim().length < 2) {
    return { status: 400, body: { error: 'Ad Soyad en az 2 karakter olmalıdır.' } };
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return { status: 400, body: { error: 'Geçerli bir e-posta adresi giriniz.' } };
  }
  if (!password || String(password).length < 6) {
    return { status: 400, body: { error: 'Şifre en az 6 karakter olmalıdır.' } };
  }

  const created = store.createUser({ name, email, password });
  if (!created) {
    return { status: 409, body: { error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.' } };
  }

  return {
    status: 201,
    body: {
      message: 'Kayıt başarılı.',
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        createdAt: created.createdAt,
      },
    },
  };
}

module.exports = { handleRegister };
