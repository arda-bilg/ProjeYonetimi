function Register({ onSwitch, onSuccess }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (name.trim().length < 2) {
      return setError('Ad Soyad en az 2 karakter olmalıdır.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError('Geçerli bir e-posta adresi giriniz.');
    }
    if (password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır.');
    }
    if (password !== confirmPassword) {
      return setError('Şifreler eşleşmiyor.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kayıt başarısız.');
      } else {
        setMessage(data.message || 'Kayıt başarılı.');
        if (onSuccess) onSuccess(data.user);
      }
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Kayıt Ol</h2>
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}
      <label>
        Ad Soyad
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: Ahmet Yılmaz"
          required
        />
      </label>
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
          placeholder="En az 6 karakter"
          required
        />
      </label>
      <label>
        Şifre Tekrar
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Şifreyi tekrar giriniz"
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </button>
      <div className="links">
        <button type="button" className="link-btn" onClick={() => onSwitch('login')}>
          Zaten hesabım var (Giriş Yap)
        </button>
      </div>
    </form>
  );
}

window.Register = Register;
