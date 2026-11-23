function Login({ onSwitch, onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      return setError('E-posta ve şifre zorunludur.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Giriş başarısız.');
      } else if (onLogin) {
        onLogin(data);
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Giriş Yap</h2>
      {error && <div className="alert error">{error}</div>}
      <label>
        E-posta
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          required
        />
      </label>
      <label>
        Şifre
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifreniz"
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
      <div className="links">
        <button type="button" className="link-btn" onClick={() => onSwitch('register')}>
          Yeni hesap oluştur
        </button>
        <button type="button" className="link-btn" onClick={() => onSwitch('reset')}>
          Şifremi unuttum
        </button>
      </div>
    </form>
  );
}

window.Login = Login;
