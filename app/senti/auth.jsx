// ============================================================================
// Zaman v2 — Authentication gate
// Wraps the main App. Handles: registration (email/password + minimal profile),
// email verification notice, 4-digit PIN setup, and PIN unlock for returning
// users. Talks to the senti-v2-api Worker. Russian UI.
// ============================================================================

const SENTI_API = 'https://senti-v2-api.ecoholding-perm.workers.dev';

// ─── API helper ──────────────────────────────────────────────────────────────
async function apiCall(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(SENTI_API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

// localStorage keys
const LS = {
  token: 'senti_token',
  email: 'senti_email',
  name: 'senti_name',
  pinSet: 'senti_pin_set',
};

// ─── Shared UI bits ──────────────────────────────────────────────────────────
function AuthShell({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'linear-gradient(160deg, #F2F6FF 0%, #F7F8F6 55%, #FFFFFF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: SC.fontDisplay, overflowY: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, background: SC.paper,
        borderRadius: 24, border: `1px solid ${SC.ink200}`,
        boxShadow: '0 30px 70px -20px rgba(5,46,128,0.25)',
        padding: '32px 28px', margin: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <SentiWordmark height={26} color={SC.green} textColor={SC.ink1000} />
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthInput({ label, ...props }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SC.ink500, marginBottom: 6, letterSpacing: '-0.1px' }}>{label}</span>
      <input {...props} style={{
        width: '100%', boxSizing: 'border-box', padding: '12px 14px',
        borderRadius: 12, border: `1px solid ${SC.ink200}`, background: SC.ink50,
        fontSize: 15, fontFamily: SC.fontDisplay, color: SC.ink1000, outline: 'none',
      }} />
    </label>
  );
}

function AuthButton({ children, disabled, onClick, variant = 'primary' }) {
  const base = {
    width: '100%', padding: '13px', borderRadius: 999, border: 'none',
    fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 15, cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.55 : 1, transition: 'opacity .15s, background .15s',
  };
  const variants = {
    primary: { background: SC.green, color: '#fff' },
    ghost: { background: 'transparent', color: SC.greenDeep },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function ErrorNote({ msg }) {
  if (!msg) return null;
  return <div style={{ background: '#FDECEC', color: SC.danger, fontSize: 13, padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontWeight: 500 }}>{msg}</div>;
}

// ─── 4-digit PIN pad ─────────────────────────────────────────────────────────
function PinPad({ value, onChange }) {
  const press = (d) => { if (value.length < 4) onChange(value + d); };
  const del = () => onChange(value.slice(0, -1));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '8px 0 28px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: 999,
            background: i < value.length ? SC.green : 'transparent',
            border: `2px solid ${i < value.length ? SC.green : SC.ink300}`,
            transition: 'background .12s',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 260, margin: '0 auto' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button key={d} onClick={() => press(d)} style={pinKeyStyle}>{d}</button>
        ))}
        <div />
        <button onClick={() => press('0')} style={pinKeyStyle}>0</button>
        <button onClick={del} style={{ ...pinKeyStyle, fontSize: 20 }}>⌫</button>
      </div>
    </div>
  );
}
const pinKeyStyle = {
  height: 60, borderRadius: 16, border: `1px solid ${SC.ink200}`, background: SC.ink50,
  fontSize: 24, fontWeight: 600, fontFamily: SC.fontDisplay, color: SC.ink1000, cursor: 'pointer',
};

// ============================================================================
// AuthGate
// ============================================================================
function AuthGate({ children }) {
  // mode: loading | login | register | verify | pin-setup | pin-unlock | authed
  const [mode, setMode] = React.useState('loading');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [client, setClient] = React.useState(null);

  // login form
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  // register form
  const [reg, setReg] = React.useState({ name: '', dob: '', gender: '', phone: '', email: '', password: '' });
  // pin
  const [pin, setPin] = React.useState('');
  const [pin2, setPin2] = React.useState('');
  const [pinStage, setPinStage] = React.useState('enter'); // enter | confirm

  // On mount: validate any stored session
  React.useEffect(() => {
    const token = localStorage.getItem(LS.token);
    if (!token) { setMode('login'); return; }
    apiCall('/auth/me', { token })
      .then(({ client }) => {
        setClient(client);
        localStorage.setItem(LS.email, client.email);
        localStorage.setItem(LS.pinSet, client.pinSet ? '1' : '');
        if (client.pinSet) setMode('pin-unlock');
        else setMode('pin-setup');
      })
      .catch(() => { localStorage.removeItem(LS.token); setMode('login'); });
  }, []);

  const enterApp = (c, token) => {
    if (token) localStorage.setItem(LS.token, token);
    if (c) {
      localStorage.setItem(LS.email, c.email);
      localStorage.setItem(LS.name, c.profile?.name || '');
      localStorage.setItem(LS.pinSet, c.pinSet ? '1' : '');
      window.SENTI_CLIENT = c;
    }
    setMode('authed');
  };

  // ─── handlers ───────────────────────────────────────────────────────────
  const doLogin = async () => {
    setErr(''); setBusy(true);
    try {
      const { token, client } = await apiCall('/auth/login', { method: 'POST', body: { email, password } });
      setClient(client); localStorage.setItem(LS.token, token);
      if (client.pinSet) { enterApp(client, token); }
      else { setPin(''); setPin2(''); setPinStage('enter'); setMode('pin-setup'); }
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const doRegister = async () => {
    setErr('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reg.email)) { setErr('Введите корректный email'); return; }
    if (reg.password.length < 6) { setErr('Пароль должен быть не менее 6 символов'); return; }
    if (!reg.name.trim()) { setErr('Введите имя'); return; }
    setBusy(true);
    try {
      const { token, client } = await apiCall('/auth/register', { method: 'POST', body: reg });
      setClient(client); localStorage.setItem(LS.token, token);
      setMode('verify');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const resendVerify = async () => {
    setErr(''); setBusy(true);
    try { await apiCall('/auth/resend-verify', { method: 'POST', token: localStorage.getItem(LS.token) }); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const submitPinSetup = async () => {
    setErr('');
    if (pinStage === 'enter') {
      if (pin.length !== 4) return;
      setPinStage('confirm');
      return;
    }
    // confirm stage
    if (pin2 !== pin) { setErr('PIN-коды не совпадают'); setPin(''); setPin2(''); setPinStage('enter'); return; }
    setBusy(true);
    try {
      await apiCall('/auth/set-pin', { method: 'POST', token: localStorage.getItem(LS.token), body: { pin } });
      const fresh = { ...(client || {}), pinSet: true };
      enterApp(fresh, localStorage.getItem(LS.token));
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const submitPinUnlock = async () => {
    if (pin.length !== 4) return;
    setErr(''); setBusy(true);
    try {
      const storedEmail = localStorage.getItem(LS.email);
      const { token, client } = await apiCall('/auth/pin-login', { method: 'POST', body: { email: storedEmail, pin } });
      enterApp(client, token);
    } catch (e) { setErr(e.message); setPin(''); } finally { setBusy(false); }
  };

  // auto-submit pin when 4 entered
  React.useEffect(() => {
    if (mode === 'pin-unlock' && pin.length === 4 && !busy) submitPinUnlock();
  }, [pin, mode]);
  React.useEffect(() => {
    if (mode === 'pin-setup' && pinStage === 'enter' && pin.length === 4) { setPinStage('confirm'); }
  }, [pin]);
  React.useEffect(() => {
    if (mode === 'pin-setup' && pinStage === 'confirm' && pin2.length === 4 && !busy) submitPinSetup();
  }, [pin2]);

  const logout = () => {
    const token = localStorage.getItem(LS.token);
    apiCall('/auth/logout', { method: 'POST', token }).catch(() => {});
    localStorage.removeItem(LS.token);
    setPin(''); setPin2(''); setEmail(''); setPassword(''); setMode('login');
  };

  // ─── render ─────────────────────────────────────────────────────────────
  if (mode === 'authed') {
    return React.cloneElement(children, { onLogout: logout, sentiClient: client });
  }

  if (mode === 'loading') {
    return <AuthShell><div style={{ textAlign: 'center', color: SC.ink500, padding: '20px 0' }}>Загрузка…</div></AuthShell>;
  }

  if (mode === 'login') {
    return (
      <AuthShell>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: SC.ink1000, margin: '0 0 4px', textAlign: 'center', letterSpacing: '-0.5px' }}>С возвращением</h1>
        <p style={{ fontSize: 14, color: SC.ink500, margin: '0 0 24px', textAlign: 'center' }}>Войдите в свой аккаунт</p>
        <ErrorNote msg={err} />
        <AuthInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <AuthInput label="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
          onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <div style={{ height: 6 }} />
        <AuthButton disabled={busy} onClick={doLogin}>{busy ? 'Вход…' : 'Войти'}</AuthButton>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: SC.ink500 }}>
          Нет аккаунта?{' '}
          <button onClick={() => { setErr(''); setMode('register'); }} style={{ background: 'none', border: 'none', color: SC.green, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: SC.fontDisplay }}>Зарегистрироваться</button>
        </div>
      </AuthShell>
    );
  }

  if (mode === 'register') {
    const set = (k, v) => setReg(r => ({ ...r, [k]: v }));
    return (
      <AuthShell>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: SC.ink1000, margin: '0 0 4px', textAlign: 'center', letterSpacing: '-0.5px' }}>Создать аккаунт</h1>
        <p style={{ fontSize: 14, color: SC.ink500, margin: '0 0 24px', textAlign: 'center' }}>Базовые данные. Остальное — при верификации.</p>
        <ErrorNote msg={err} />
        <AuthInput label="Имя" value={reg.name} onChange={e => set('name', e.target.value)} placeholder="Иван Иванов" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><AuthInput label="Дата рождения" type="date" value={reg.dob} onChange={e => set('dob', e.target.value)} /></div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SC.ink500, marginBottom: 6 }}>Пол</span>
              <select value={reg.gender} onChange={e => set('gender', e.target.value)} style={{
                width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12,
                border: `1px solid ${SC.ink200}`, background: SC.ink50, fontSize: 15, fontFamily: SC.fontDisplay, color: SC.ink1000, outline: 'none',
              }}>
                <option value="">—</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </label>
          </div>
        </div>
        <AuthInput label="Телефон" type="tel" value={reg.phone} onChange={e => set('phone', e.target.value)} placeholder="+996 700 123 456" />
        <AuthInput label="Email" type="email" value={reg.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
        <AuthInput label="Пароль" type="password" value={reg.password} onChange={e => set('password', e.target.value)} placeholder="Минимум 6 символов" />
        <div style={{ height: 6 }} />
        <AuthButton disabled={busy} onClick={doRegister}>{busy ? 'Создаём…' : 'Зарегистрироваться'}</AuthButton>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: SC.ink500 }}>
          Уже есть аккаунт?{' '}
          <button onClick={() => { setErr(''); setMode('login'); }} style={{ background: 'none', border: 'none', color: SC.green, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: SC.fontDisplay }}>Войти</button>
        </div>
      </AuthShell>
    );
  }

  if (mode === 'verify') {
    return (
      <AuthShell>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: SC.greenWash, display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <Icon name="bell" size={28} color={SC.green} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: SC.ink1000, margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.5px' }}>Подтвердите email</h1>
        <p style={{ fontSize: 14, color: SC.ink500, margin: '0 0 8px', textAlign: 'center', lineHeight: 1.5 }}>
          Мы отправили письмо на<br /><b style={{ color: SC.ink1000 }}>{client?.email}</b>
        </p>
        <p style={{ fontSize: 13, color: SC.ink400, margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 }}>
          Перейдите по ссылке из письма. Можно продолжить и подтвердить позже.
        </p>
        <ErrorNote msg={err} />
        <AuthButton onClick={() => { setPin(''); setPin2(''); setPinStage('enter'); setMode('pin-setup'); }}>Продолжить</AuthButton>
        <div style={{ height: 10 }} />
        <AuthButton variant="ghost" disabled={busy} onClick={resendVerify}>{busy ? 'Отправляем…' : 'Отправить письмо снова'}</AuthButton>
      </AuthShell>
    );
  }

  if (mode === 'pin-setup') {
    const confirming = pinStage === 'confirm';
    return (
      <AuthShell>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: SC.ink1000, margin: '0 0 6px', textAlign: 'center', letterSpacing: '-0.5px' }}>
          {confirming ? 'Повторите PIN' : 'Придумайте PIN'}
        </h1>
        <p style={{ fontSize: 14, color: SC.ink500, margin: '0 0 16px', textAlign: 'center' }}>
          {confirming ? 'Введите код ещё раз' : '4-значный код для быстрого входа'}
        </p>
        <ErrorNote msg={err} />
        <PinPad value={confirming ? pin2 : pin} onChange={confirming ? setPin2 : setPin} />
        {!confirming && pin.length === 4 && (
          <div style={{ marginTop: 8 }}><AuthButton onClick={() => setPinStage('confirm')}>Далее</AuthButton></div>
        )}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: SC.ink400, fontSize: 13, cursor: 'pointer', fontFamily: SC.fontDisplay }}>Выйти</button>
        </div>
      </AuthShell>
    );
  }

  if (mode === 'pin-unlock') {
    const name = localStorage.getItem(LS.name) || client?.profile?.name || '';
    return (
      <AuthShell>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: SC.ink1000, margin: '0 0 6px', textAlign: 'center', letterSpacing: '-0.5px' }}>
          {name ? `Здравствуйте, ${name.split(' ')[0]}` : 'Введите PIN'}
        </h1>
        <p style={{ fontSize: 14, color: SC.ink500, margin: '0 0 16px', textAlign: 'center' }}>Введите PIN-код для входа</p>
        <ErrorNote msg={err} />
        <PinPad value={pin} onChange={setPin} />
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: SC.ink400, fontSize: 13, cursor: 'pointer', fontFamily: SC.fontDisplay }}>Войти другим аккаунтом</button>
        </div>
      </AuthShell>
    );
  }

  return null;
}

// ─── Display helpers — read the logged-in client (window.SENTI_CLIENT) ───────
// Used across the prototype to replace the old hardcoded "Айгуль" demo identity.
function clientName(lang = 'ru') {
  const c = (typeof window !== 'undefined') ? window.SENTI_CLIENT : null;
  return (c && c.profile && c.profile.name && c.profile.name.trim()) || (lang === 'ru' ? 'Клиент' : 'Client');
}
function clientFirstName(lang = 'ru') { return clientName(lang).split(' ')[0]; }
function clientInitial(lang = 'ru') { return (clientName(lang).trim()[0] || '?').toUpperCase(); }
function clientId() {
  const c = (typeof window !== 'undefined') ? window.SENTI_CLIENT : null;
  return (c && c.id) || '—';
}
function clientKycVerified() {
  const c = (typeof window !== 'undefined') ? window.SENTI_CLIENT : null;
  return !!(c && c.kycStatus === 'verified');
}
// Compact "ID 10001 · KYC ✓ / KYC не пройден" line for sidebar/menu cards.
function clientMeta(lang = 'ru') {
  const kyc = clientKycVerified() ? 'KYC ✓' : (lang === 'ru' ? 'KYC не пройден' : 'KYC pending');
  return 'ID ' + clientId() + ' · ' + kyc;
}

Object.assign(window, {
  AuthGate, SENTI_API, apiCall,
  clientName, clientFirstName, clientInitial, clientId, clientKycVerified, clientMeta,
});
