function ResetPassword({ onSwitch }) {
  const [step, setStep] = React.useState('request');
  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleRequestToken(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kod oluşturulamadı.');
      } else {
        setToken(data.resetToken || '');
        setMessage('Sıfırlama kodu oluşturuldu. Yeni şifrenizi belirleyebilirsiniz.');
        setStep('confirm');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReset(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 6) {
      return setError('Yeni şifre en az 6 karakter olmalıdır.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Şifre güncellenemedi.');
      } else {
        setMessage(data.message || 'Şifreniz güncellendi.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <h2>Şifre Sıfırlama</h2>
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {step === 'request' ? (
        <form onSubmit={handleRequestToken} className="auth-form-inner">
          <label>
            Kayıtlı E-posta
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Kodu Al'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmReset} className="auth-form-inner">
          <label>
            Sıfırlama Kodu
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </label>
          <label>
            Yeni Şifre
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      )}

      <div className="links">
        <button type="button" className="link-btn" onClick={() => onSwitch('login')}>
          Giriş ekranına dön
        </button>
      </div>
    </div>
  );
}

window.ResetPassword = ResetPassword;
