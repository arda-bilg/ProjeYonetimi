function App() {
  const [view, setView] = React.useState('login');
  const [session, setSession] = React.useState(null);

  if (session) {
    return (
      <div className="card">
        <h2>Hoş geldiniz, {session.user.name}</h2>
        <p className="muted">{session.user.email}</p>
        <div className="alert success">Oturum başarıyla açıldı.</div>
        <button onClick={() => setSession(null)}>Çıkış Yap</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="tabs">
        <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>
          Giriş
        </button>
        <button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}>
          Kayıt
        </button>
        <button className={view === 'reset' ? 'active' : ''} onClick={() => setView('reset')}>
          Şifre Sıfırla
        </button>
      </div>
      {view === 'login' && <window.Login onSwitch={setView} onLogin={setSession} />}
      {view === 'register' && (
        <window.Register onSwitch={setView} onSuccess={() => setTimeout(() => setView('login'), 1000)} />
      )}
      {view === 'reset' && <window.ResetPassword onSwitch={setView} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
