function handleRequestReset(reqBody, store) {
  const { email } = reqBody || {};
  if (!email) {
    return { status: 400, body: { error: 'E-posta adresi zorunludur.' } };
  }

  const token = store.setResetToken(email);
  if (!token) {
    return { status: 404, body: { error: 'Bu e-posta adresine sahip kullanıcı bulunamadı.' } };
  }

  return {
    status: 200,
    body: {
      message: 'Şifre sıfırlama kodu oluşturuldu.',
      resetToken: token,
    },
  };
}

function handleConfirmReset(reqBody, store) {
  const { email, token, newPassword } = reqBody || {};
  if (!email || !token || !newPassword) {
    return { status: 400, body: { error: 'E-posta, sıfırlama kodu ve yeni şifre zorunludur.' } };
  }
  if (String(newPassword).length < 6) {
    return { status: 400, body: { error: 'Yeni şifre en az 6 karakter olmalıdır.' } };
  }

  const result = store.resetPasswordWithToken(email, token, newPassword);
  if (!result.ok) {
    const msg =
      result.reason === 'expired_token'
        ? 'Sıfırlama kodunun süresi dolmuş.'
        : 'Geçersiz sıfırlama kodu veya e-posta.';
    return { status: 400, body: { error: msg } };
  }

  return {
    status: 200,
    body: { message: 'Şifreniz başarıyla güncellendi.' },
  };
}

module.exports = { handleRequestReset, handleConfirmReset };
