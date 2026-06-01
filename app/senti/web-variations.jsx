// Zaman brokerage — three web dashboard variations
// Each renders an 1440×900 surface (the personal cabinet of a newbie investor).
// V1: Зелёный/light · V2: Минимализм/light · V3: Тёмная/dark

// ──────────────────────────────────────────────────────────────
// Shared web-only data (extends PORTFOLIO from mobile-variations)
// ──────────────────────────────────────────────────────────────
const WEB_NEWS_RU = [
  { tag: 'Товары',  title: 'Золото удержало $4 514/унц. на фоне переговоров США–Иран',    meta: 'Kitco News · 29 мая' },
  { tag: 'Акции',   title: 'Dell +32,76% — крупнейший однодневный рост за 10 лет',         meta: 'Yahoo Finance · 29 мая' },
  { tag: 'Крипто',  title: 'Stellar XLM взлетел на 50%+ после партнёрства с DTCC',        meta: 'CoinTelegraph · 28 мая' },
  { tag: 'Акции',   title: 'Microsoft +5,45%: рекордный рост Azure AI превзошёл прогнозы', meta: 'Yahoo Finance · 28 мая' },
];
const WEB_NEWS_EN = WEB_NEWS_RU;

const WATCHLIST_RU = [
  { symbol: 'GOOGL', name: 'Alphabet',   ccy: '$', price: 174.55, change:  0.6, spark: [172,173,174,173,174,174,174.55] },
  { symbol: 'USDT',  name: 'USDT / KGS', ccy: 'с', price: 88.30,  change:  0,   spark: [88.2,88.2,88.25,88.3,88.3,88.3,88.3] },
  { symbol: 'USD',   name: 'USD / KGS',  ccy: 'с', price: 88.95,  change: -0.1, spark: [89.1,89.05,89.0,88.98,88.96,88.95,88.95] },
  { symbol: 'EUR',   name: 'EUR / KGS',  ccy: 'с', price: 95.20,  change:  0.3, spark: [94.7,94.9,95.0,95.1,95.0,95.15,95.2] },
];

// Sidebar nav items for the personal cabinet
const NAV_RU = [
  { id: 'home',     label: 'Главная',    icon: 'home',     active: true },
  { id: 'portfolio',label: 'Активы',     icon: 'wallet' },
  { id: 'markets',  label: 'Рынки',      icon: 'chart' },
  { id: 'withdraw', label: 'Вывод',       icon: 'upload' },
  { id: 'history',  label: 'История',    icon: 'layers' },
  { id: 'learn',    label: 'Обучение',   icon: 'book' },
  { id: 'settings', label: 'Настройки',  icon: 'settings' },
];
const NAV_EN = [
  { id: 'home',     label: 'Home',       icon: 'home',     active: true },
  { id: 'portfolio',label: 'Assets',     icon: 'wallet' },
  { id: 'markets',  label: 'Markets',    icon: 'chart' },
  { id: 'withdraw', label: 'Withdraw',   icon: 'upload' },
  { id: 'history',  label: 'History',    icon: 'layers' },
  { id: 'learn',    label: 'Learn',      icon: 'book' },
  { id: 'settings', label: 'Settings',   icon: 'settings' },
];

// ──────────────────────────────────────────────────────────────
// Sidebar — left column, ~240px
// ──────────────────────────────────────────────────────────────
function WebSidebar({ lang = 'ru', dark = false, active = 'home', onNav, accent = SC.green }) {
  const items = lang === 'ru' ? NAV_RU : NAV_EN;
  const bg = dark ? SC.ink1000 : SC.paper;
  const sectionBg = dark ? 'rgba(255,255,255,0.04)' : SC.ink50;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const hover = dark ? 'rgba(255,255,255,0.06)' : SC.ink100;
  return (
    <aside style={{
      width: 240, flex: '0 0 240px',
      background: bg,
      borderRight: dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`,
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px 20px',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 28px' }}>
        <SentiWordmark height={26} color={SC.green} textColor={text}/>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => {
          const on = (active === item.id) || (active === undefined && item.active);
          return (
            <button key={item.id} onClick={() => onNav && onNav(item.id)} style={{
              background: on ? (dark ? 'rgba(12,71,183,0.16)' : SC.greenWash) : 'transparent',
              color: on ? (dark ? SC.greenBright : SC.greenDeep) : sub,
              border: 'none', cursor: 'pointer',
              padding: '10px 12px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: SC.fontDisplay, fontWeight: on ? 600 : 500, fontSize: 14,
              letterSpacing: '-0.2px', textAlign: 'left',
            }}>
              <Icon name={item.icon} size={18} color={on ? (dark ? SC.greenBright : SC.greenDeep) : sub}/>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'learn' && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                  background: SC.lime, color: SC.ink1000,
                }}>NEW</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }}/>

      {/* Education card — same as ProtoSidebar */}
      <div style={{
        marginTop: 16, padding: 14, borderRadius: 14,
        background: dark ? 'rgba(255,255,255,0.05)' : SC.ink50,
        border: dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${SC.ink200}`,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: SC.lime, display: 'grid', placeItems: 'center', marginBottom: 10 }}>
          <Icon name="book" size={17} color={SC.ink1000} strokeWidth={2}/>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: dark ? '#fff' : SC.ink1000, letterSpacing: '-0.2px', marginBottom: 4, lineHeight: 1.3 }}>
          {lang === 'ru' ? 'Не уверены, с чего начать?' : 'Not sure where to start?'}
        </div>
        <div style={{ fontSize: 11, color: sub, marginBottom: 12, lineHeight: 1.4 }}>
          {lang === 'ru' ? 'Пройдите 5-минутный тест.' : 'Take a 5-minute test.'}
        </div>
        <Pill variant="primary" size="sm" arrow full>{lang === 'ru' ? 'Начать' : 'Start'}</Pill>
      </div>

      {/* User card */}
      <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: sectionBg, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: SC.greenSoft, color: SC.greenDeep, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, fontFamily: SC.fontDisplay }}>{clientInitial(lang)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>{clientName(lang)}</div>
          <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{clientMeta(lang)}</div>
        </div>
        <Icon name="chevR" size={16} color={sub}/>
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────────────────────
// Web top bar — search + language switch + bell + small avatar
// ──────────────────────────────────────────────────────────────
function WebTopBar({ lang = 'ru', setLang, dark = false, onChat = () => {}, onNotif = () => {} }) {
  const bg = dark ? SC.ink1000 : SC.paper;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const border = dark ? 'rgba(255,255,255,0.08)' : SC.ink200;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  return (
    <div style={{
      height: 64, flex: '0 0 64px',
      background: bg,
      borderBottom: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 28px',
    }}>
      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 420, display: 'flex', alignItems: 'center', gap: 10,
        background: fieldBg, borderRadius: 12, padding: '8px 14px',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
        <Icon name="search" size={16} color={sub}/>
        <input placeholder={lang === 'ru' ? 'Поиск тикера, валюты, новостей…' : 'Search ticker, currency, news…'}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: 13, color: text, fontFamily: SC.fontDisplay, letterSpacing: '-0.2px',
          }}/>
        <span style={{ fontFamily: SC.fontMono, fontSize: 11, padding: '2px 6px', borderRadius: 6, background: dark ? 'rgba(255,255,255,0.07)' : SC.ink100, color: sub }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }}/>

      {/* lang switch */}
      <div style={{ display: 'flex', alignItems: 'center', background: fieldBg, borderRadius: 999, padding: 2, gap: 0 }}>
        {['ru', 'en'].map(l => (
          <button key={l} onClick={() => setLang && setLang(l)} style={{
            background: lang === l ? (dark ? '#fff' : SC.ink1000) : 'transparent',
            color: lang === l ? (dark ? SC.ink1000 : '#fff') : sub,
            border: 'none', cursor: 'pointer',
            padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            fontFamily: SC.fontDisplay, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>{l}</button>
        ))}
      </div>

      <button onClick={onNotif} style={{ width: 36, height: 36, borderRadius: 999, background: fieldBg, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', position: 'relative' }}>
        <Icon name="bell" size={16} color={text}/>
        <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 999, background: SC.green, border: `2px solid ${bg}` }}/>
      </button>

      <button onClick={onChat} style={{ width: 36, height: 36, borderRadius: 999, background: fieldBg, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
        <Icon name="chat" size={16} color={text}/>
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Web chat overlay panel (slides in from right)
// ──────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────
// Web notifications overlay (slides in from right, like chat)
// ──────────────────────────────────────────────────────────────
function WebNotifOverlay({ lang = 'ru', dark = false, onClose = () => {} }) {
  const bg      = dark ? '#1a2235' : SC.paper;
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const border  = dark ? 'rgba(255,255,255,0.08)' : SC.ink200;
  const fieldBg = dark ? 'rgba(255,255,255,0.07)' : SC.ink50;

  const [tab, setTab]       = React.useState('trading');
  const [notifs, setNotifs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const r = await fetch(`${BYBIT_WORKER}/notifications`);
      if (r.ok) { const d = await r.json(); setNotifs(Array.isArray(d) ? d : []); }
    } catch(_) {}
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [load]);

  const markAll = async () => {
    try {
      await fetch(`${BYBIT_WORKER}/notifications/read-all`, { method: 'POST' });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch(_) {}
  };

  const markOne = async (id) => {
    try {
      await fetch(`${BYBIT_WORKER}/notifications/${id}/read`, { method: 'POST' });
      setNotifs(prev => prev.map(n => String(n.id) === String(id) ? { ...n, read: true } : n));
    } catch(_) {}
  };

  const NOTIF_ICONS = { order_fill: '✅', deposit: '💰', withdrawal: '📤', system: '📢' };
  const filtered = tab === 'system'
    ? notifs.filter(n => n.type === 'system')
    : notifs.filter(n => n.type !== 'system');
  const unreadTotal = notifs.filter(n => !n.read).length;

  const fmtTime = ts => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date(), diff = now - d;
    if (diff < 3600000) return Math.floor(diff / 60000) + (lang === 'ru' ? ' мин' : 'm');
    if (diff < 86400000) return Math.floor(diff / 3600000) + (lang === 'ru' ? ' ч' : 'h');
    return d.getDate() + ' ' + ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()];
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: '7px 0', border: 'none', borderRadius: 7, cursor: 'pointer',
      fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 12,
      background: tab === id ? (dark ? '#fff' : SC.ink1000) : 'transparent',
      color: tab === id ? (dark ? SC.ink1000 : '#fff') : sub,
    }}>{label}</button>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, zIndex: 200,
      background: bg, borderLeft: `1px solid ${border}`,
      boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.08)' : SC.ink100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="bell" size={18} color={text}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{lang === 'ru' ? 'Уведомления' : 'Notifications'}</div>
            {unreadTotal > 0 && <div style={{ fontSize: 11, color: SC.green, fontWeight: 600 }}>{unreadTotal} {lang === 'ru' ? 'непрочитанных' : 'unread'}</div>}
          </div>
          {unreadTotal > 0 && (
            <button onClick={markAll} style={{ fontSize: 11, color: SC.green, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: SC.fontDisplay }}>
              {lang === 'ru' ? 'Прочитать все' : 'Mark all read'}
            </button>
          )}
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: fieldBg, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="chevL" size={16} color={text}/>
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100, borderRadius: 9, padding: 3, gap: 2 }}>
          {tabBtn('trading', `📈 ${lang === 'ru' ? 'Торговые' : 'Trading'}`)}
          {tabBtn('system',  `⚙️ ${lang === 'ru' ? 'Системные' : 'System'}`)}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{ width: 24, height: 24, border: `3px solid ${border}`, borderTop: `3px solid ${SC.green}`, borderRadius: '50%', animation: 'spin360 0.7s linear infinite' }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: sub, fontSize: 13 }}>
            {tab === 'system'
              ? (lang === 'ru' ? 'Нет системных уведомлений' : 'No system notifications')
              : (lang === 'ru' ? 'Нет торговых уведомлений' : 'No trading notifications')}
          </div>
        ) : filtered.map(n => (
          <div key={n.id} onClick={() => !n.read && markOne(n.id)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px',
            borderBottom: `1px solid ${border}`, cursor: !n.read ? 'pointer' : 'default',
            background: !n.read ? (dark ? 'rgba(12,71,183,0.05)' : 'rgba(12,71,183,0.04)') : 'transparent',
          }}>
            <div style={{ fontSize: 20, width: 36, height: 36, display: 'grid', placeItems: 'center', flexShrink: 0,
              borderRadius: 10, background: n.type === 'system' ? 'rgba(99,102,241,0.12)' : fieldBg }}>
              {NOTIF_ICONS[n.type] || '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: text }}>{n.title}</span>
                {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: SC.green, flexShrink: 0, display: 'inline-block' }}/>}
              </div>
              {n.message && <div style={{ fontSize: 12, color: sub, lineHeight: 1.5, marginBottom: 4 }}>{n.message}</div>}
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{fmtTime(n.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebChatOverlay({ lang = 'ru', dark = false, onClose = () => {} }) {
  const bg      = dark ? '#1a2235' : SC.paper;
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.07)' : SC.ink50;
  const border  = dark ? 'rgba(255,255,255,0.08)' : SC.ink200;

  const [messages, setMessages] = React.useState([]);
  const [input, setInput]       = React.useState('');
  const [sending, setSending]   = React.useState(false);
  const [loading, setLoading]   = React.useState(true);
  const bottomRef = React.useRef(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const load = React.useCallback(async () => {
    try {
      const r = await fetch(`${BYBIT_WORKER}/chat`);
      if (r.ok) { const d = await r.json(); setMessages(Array.isArray(d) ? d : []); }
    } catch(_) {}
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, [load]);
  React.useEffect(() => { scrollBottom(); }, [messages]);

  const send = async () => {
    const t = input.trim();
    if (!t || sending) return;
    setSending(true);
    const optimistic = { id: Date.now(), sender: 'user', text: t, ts: Date.now(), read: false };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    try {
      await fetch(`${BYBIT_WORKER}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t, sender: 'user' }),
      });
      await load();
    } catch(_) {}
    finally { setSending(false); }
  };

  const fmtTime = ts => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, zIndex: 200,
      background: bg, borderLeft: `1px solid ${border}`,
      boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${border}` }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: SC.greenSoft, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="sparkles" size={18} color={SC.greenDeep}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{lang === 'ru' ? 'Поддержка Zaman' : 'Zaman Support'}</div>
          <div style={{ fontSize: 11, color: SC.green, fontWeight: 500 }}>● {lang === 'ru' ? 'Онлайн' : 'Online'}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: fieldBg, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon name="chevL" size={16} color={text}/>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div style={{ textAlign: 'center', color: sub, fontSize: 13 }}>…</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: text, marginBottom: 6 }}>
              {lang === 'ru' ? 'Напишите нам' : 'Write to us'}
            </div>
            <div style={{ fontSize: 13, color: sub, lineHeight: 1.6 }}>
              {lang === 'ru' ? 'Мы отвечаем в рабочее время.' : 'We reply during business hours.'}
            </div>
          </div>
        )}
        {messages.map(m => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 14px',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser ? SC.green : (dark ? 'rgba(255,255,255,0.09)' : SC.ink100),
                color: isUser ? '#fff' : text,
                fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {m.text}
              </div>
              <div style={{ fontSize: 10, color: sub, marginTop: 4, paddingLeft: 4, paddingRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                {fmtTime(m.ts)}
                {isUser && <span style={{ color: m.read ? SC.green : sub }}>✓✓</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 20px', borderTop: `1px solid ${border}`, display: 'flex', gap: 10, background: bg }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
          placeholder={lang === 'ru' ? 'Сообщение…' : 'Message…'}
          style={{
            flex: 1, background: fieldBg, border: `1px solid ${border}`,
            borderRadius: 12, padding: '10px 14px', color: text, fontSize: 13,
            outline: 'none', fontFamily: SC.fontDisplay,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: input.trim() ? SC.green : (dark ? 'rgba(255,255,255,0.08)' : SC.ink100),
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <Icon name="arrUp" size={18} color={input.trim() ? '#fff' : sub} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Donut / pie chart for allocation (SVG)
// ──────────────────────────────────────────────────────────────
function Donut({ segments, size = 160, thickness = 22, gap = 2, dark = false }) {
  const total = segments.reduce((s, x) => s + x.pct, 0);
  const c = size / 2;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={dark ? 'rgba(255,255,255,0.06)' : SC.ink100} strokeWidth={thickness}/>
      {segments.map(s => {
        const len = (s.pct / total) * C;
        const dashArr = `${len - gap} ${C - len + gap}`;
        const el = (
          <circle key={s.id} cx={c} cy={c} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={dashArr} strokeDashoffset={-offset}
            strokeLinecap="butt"/>
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// V1 — Web "Зелёный" : green hero card, allocation donut, holdings table
// ──────────────────────────────────────────────────────────────
function WebV1Green({ lang = 'ru', setLang = () => {}, onNav, active = 'home', onTrade = () => {}, onTopUp = () => {}, onWithdraw = () => {} }) {
  const [chatOpen, setChatOpen]   = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [tab, setTab] = React.useState('portfolio');
  const { holdings: liveHoldings } = usePortfolio();
  const { rates: kgsRates } = typeof useKgsRates === 'function' ? useKgsRates() : { rates: {} };
  const stats = React.useMemo(() => computePortfolioStats(liveHoldings, kgsRates['USD']), [liveHoldings, kgsRates['USD']]);
  const { balances: bybitBals } = typeof useBybitAccount === 'function' ? useBybitAccount() : { balances: [] };
  const bybitHoldings = React.useMemo(() => bybitBals.filter(b => parseFloat(b.usdValue) > 0.01).map(b => {
    const qty = parseFloat(b.walletBalance || b.free);
    const usd = parseFloat(b.usdValue);
    return { symbol: b.asset, name: b.asset, qty, price: qty > 0 ? usd / qty : 0, ccy: '$', change: 0 };
  }), [bybitBals]);
  const cashHoldings   = liveHoldings.filter(h => h.cls === 'cash' && h.source !== 'bybit');
  const kgHoldings     = liveHoldings.filter(h => h.cls === 'kg');
  const cryptoHoldings = liveHoldings.filter(h => h.cls === 'crypto' && h.source !== 'bybit');
  const cfdHoldings    = liveHoldings.filter(h => h.cls === 'cfd');
  const STABLE_COINS = ['USDT','USDC','BUSD','DAI','TUSD'];
  const stableVarSegs1 = React.useMemo(() => {
    const stableUsd = liveHoldings.filter(h => h.cls === 'cash').reduce((s, h) => s + (h.qty||0)*(h.price||0), 0)
      + bybitBals.filter(b => STABLE_COINS.includes(b.asset)).reduce((s, b) => s + parseFloat(b.usdValue||0), 0);
    const varUsd = liveHoldings.filter(h => h.cls !== 'cash').reduce((s, h) => s + (h.qty||0)*(h.price||0), 0)
      + bybitBals.filter(b => !STABLE_COINS.includes(b.asset)).reduce((s, b) => s + parseFloat(b.usdValue||0), 0);
    const total = stableUsd + varUsd || 1;
    return [
      { id: 'stable', label: lang === 'ru' ? 'Стабильная цена' : 'Stable price',   usd: stableUsd, pct: Math.round(stableUsd/total*100), color: '#7C8CF8' },
      { id: 'var',    label: lang === 'ru' ? 'Переменная цена' : 'Variable price', usd: varUsd,    pct: Math.round(varUsd/total*100),    color: '#0C47B7' },
    ].filter(s => s.usd > 0);
  }, [liveHoldings, bybitBals, lang]);
  const { orders: allRecords1, refetch: refetchHistory1 } = typeof useBybitHistory === 'function' ? useBybitHistory() : { orders: [], refetch: () => {} };
  const openOrders1   = React.useMemo(() => allRecords1.filter(r => r.recordType === 'open_order'), [allRecords1]);
  const closedTrades1 = React.useMemo(() => allRecords1.filter(r => r.recordType === 'order'), [allRecords1]);
  const [cancellingId1, setCancellingId1] = React.useState(null);
  const cancelOrder1 = React.useCallback(async (o) => {
    if (cancellingId1) return;
    if (!window.confirm(lang === 'ru' ? `Вы хотите отменить ордер?\n${o.side === 'Buy' ? 'Покупка' : 'Продажа'} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}` : `Cancel this order?\n${o.side} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}`)) return;
    setCancellingId1(o.id);
    try {
      const res = await fetch(`${BYBIT_WORKER}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: o.id, symbol: o.symbol, category: o.category || 'spot' }) });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Error');
      refetchHistory1();
    } catch(e) { alert(lang === 'ru' ? `Ошибка отмены: ${e.message}` : `Cancel error: ${e.message}`); }
    finally { setCancellingId1(null); }
  }, [cancellingId1, lang, refetchHistory1]);
  const tabsCfg = [
    { id: 'portfolio', label: lang === 'ru' ? 'Портфель' : 'Portfolio' },
    { id: 'orders',    label: lang === 'ru' ? 'Приказы'  : 'Orders' },
    { id: 'trades',    label: lang === 'ru' ? 'Сделки'   : 'Trades' },
  ];
  return (
    <div data-screen-label={`Web / V1 Green / ${lang}`} style={{
      display: 'flex', flex: 1, minWidth: 0, minHeight: 0,
      background: SC.bg2 || SC.ink50,
      fontFamily: SC.fontDisplay, color: SC.ink1000,
    }}>
      {chatOpen  && <WebChatOverlay  lang={lang} dark={false} onClose={() => setChatOpen(false)}/>}
      {notifOpen && <WebNotifOverlay lang={lang} dark={false} onClose={() => setNotifOpen(false)}/>}
      <WebSidebar lang={lang} onNav={onNav} active={active}/>
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: SC.paper, overflow: 'hidden' }}>
        <WebTopBar lang={lang} setLang={setLang} onChat={() => setChatOpen(v => !v)} onNotif={() => setNotifOpen(v => !v)}/>

        <div style={{ flex: 1, padding: '24px 32px 32px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px', gridTemplateRows: 'auto auto', gap: 20, alignContent: 'start' }}>
          {/* Hero card — green wash */}
          <section style={{
            gridColumn: '1 / -1', gridRow: '1',
            background: SC.greenWash, borderRadius: 28, padding: '24px 28px',
            border: `1px solid ${SC.greenSoft}`,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: SC.greenDeep, fontWeight: 500 }}>{t(lang, 'totalBalance')}</span>
                <Icon name="eye" size={14} color={SC.greenDeep}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                <MoneyKGS value={stats.totalKgs} size={68} weight={600}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <DeltaPill value={stats.dayChangePct} size="md"/>
                <span style={{ fontFamily: SC.fontMono, fontSize: 14, color: SC.ink500 }}>
                  {fmtKGS(stats.dayChangeKgs, { sign: true })} {t(lang, 'soms')} · {t(lang, 'todayChange')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Pill variant="dark" size="md" arrow icon="plus" onClick={() => onTrade('buy')}>{t(lang, 'buy')}</Pill>
                <Pill variant="outline" size="md" onClick={() => onTrade('sell')}>{t(lang, 'sell')}</Pill>
                <Pill variant="outline" size="md" icon="upload" onClick={onWithdraw}>{t(lang, 'withdraw')}</Pill>
                <Pill variant="outline" size="md" icon="download" onClick={onTopUp}>{t(lang, 'topUp')}</Pill>
              </div>
            </div>
            {/* Portfolio structure — donut */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' }}>
              <div style={{ flex: '0 0 auto', position: 'relative' }}>
                <Donut segments={stats.allocation[lang]} size={150} thickness={22}/>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: SC.ink1000 }}>{stats.classCount}</div>
                    <div style={{ fontSize: 10, color: SC.ink500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'класса' : 'classes'}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.allocation[lang].map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: s.color }}/>
                    <span style={{ fontSize: 13, color: SC.ink500, fontWeight: 500, flex: 1 }}>{s.label}</span>
                    <span style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 700, color: SC.ink1000 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Holdings table */}
          <section style={{
            gridColumn: '1', gridRow: '2',
            background: SC.paper, borderRadius: 24, padding: '20px 24px',
            border: `1px solid ${SC.ink200}`,
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: SC.ink50, borderRadius: 10, padding: 3, gap: 0, marginBottom: 16, alignSelf: 'flex-start' }}>
              {tabsCfg.map(tg => (
                <button key={tg.id} onClick={() => setTab(tg.id)} style={{
                  background: tab === tg.id ? SC.ink1000 : 'transparent',
                  color: tab === tg.id ? '#fff' : SC.ink500,
                  border: 'none', cursor: 'pointer',
                  padding: '6px 16px', borderRadius: 8,
                  fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.2px',
                }}>{tg.label}</button>
              ))}
            </div>

            {/* Portfolio tab */}
            {tab === 'portfolio' && (<>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr', gap: 12, padding: '8px 4px', fontSize: 11, color: SC.ink500, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: SC.ink1000, textTransform: 'none', letterSpacing: '-0.2px' }}>{lang === 'ru' ? 'Актив' : 'Asset'}</span>
                <span>{lang === 'ru' ? 'Кол-во' : 'Qty'}</span>
                <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Цена' : 'Price'}</span>
                <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Итого' : 'Total'}</span>
                <span></span>
              </div>
              {[
                { title: lang === 'ru' ? 'Валюта' : 'Currency',   rows: cashHoldings,   extra: [] },
                { title: 'KG рынок',                               rows: kgHoldings,     extra: [] },
                { title: lang === 'ru' ? 'Крипто' : 'Crypto',     rows: cryptoHoldings, extra: bybitHoldings },
                { title: 'CFD',                                    rows: cfdHoldings,    extra: [] },
              ].map(group => (group.rows.length + group.extra.length) === 0 ? null : (
                <React.Fragment key={group.title}>
                  <div style={{ padding: '10px 4px 6px', fontSize: 10, fontWeight: 700, color: SC.ink400, letterSpacing: '0.08em', textTransform: 'uppercase', borderTop: `1px solid ${SC.ink100}`, marginTop: 4 }}>
                    {group.title}
                  </div>
                  {group.rows.map((h, i, arr) => {
                    const total = (h.qty || 0) * (h.price || 0);
                    const isLast = i === arr.length - 1 && group.extra.length === 0;
                    return (
                      <div key={h.symbol} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr', gap: 12, padding: '12px 4px', alignItems: 'center', borderBottom: isLast ? 'none' : `1px solid ${SC.ink200}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <TickerLogo symbol={h.symbol} size={34}/>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{h.symbol}</div>
                            <div style={{ fontSize: 12, color: SC.ink500 }}>{h.name}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 500, color: SC.ink1000 }}>{h.qty}</div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: SC.ink1000, textAlign: 'right' }}>
                          {h.price > 0 ? (h.ccy + h.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '—'}
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: SC.ink1000, textAlign: 'right' }}>
                          {total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: total < 1000 ? 2 : 0, maximumFractionDigits: total < 1000 ? 2 : 0 }) : '—'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Sparkline data={h.spark} width={72} height={28}/></div>
                      </div>
                    );
                  })}
                  {group.extra.map((h, i, arr) => {
                    const total = h.qty * h.price;
                    return (
                      <div key={'bybit-' + h.symbol} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr', gap: 12, padding: '12px 4px', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${SC.ink200}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <TickerLogo symbol={h.symbol} size={34}/>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{h.symbol}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'rgba(12,71,183,0.15)', color: '#0C47B7', padding: '2px 5px', borderRadius: 4 }}>bybit live</span>
                            </div>
                            <div style={{ fontSize: 12, color: SC.ink500 }}>{h.name}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 500, color: SC.ink1000 }}>
                          {h.qty < 0.01 ? h.qty.toFixed(6) : h.qty < 1 ? h.qty.toFixed(4) : h.qty.toFixed(2)}
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: SC.ink1000, textAlign: 'right' }}>
                          {h.price > 0 ? ('$' + h.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '—'}
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: SC.ink1000, textAlign: 'right' }}>
                          {total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: total < 1000 ? 2 : 0, maximumFractionDigits: total < 1000 ? 2 : 0 }) : '—'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><DeltaPill value={0} size="sm" mode="ghost"/></div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </>)}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, padding: '8px 4px', fontSize: 11, color: SC.ink500, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: `1px solid ${SC.ink200}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SC.ink1000, textTransform: 'none', letterSpacing: '-0.2px' }}>{lang === 'ru' ? 'Инструмент' : 'Instrument'}</span>
                  <span>{lang === 'ru' ? 'Вид' : 'Type'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Кол-во × Цена' : 'Qty × Price'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Дата' : 'Date'}</span>
                  <span/>
                </div>
                {openOrders1.length === 0
                  ? <div style={{ textAlign: 'center', padding: '32px 0', color: SC.ink500, fontSize: 14 }}>{lang === 'ru' ? 'Нет активных приказов' : 'No open orders'}</div>
                  : openOrders1.map((o, i, arr) => (
                  <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, padding: '14px 4px', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${SC.ink100}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TickerLogo symbol={bhSym(o.symbol)} size={34}/>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{bhSym(o.symbol)}</div>
                        <div style={{ fontSize: 12, color: SC.ink500 }}>{bhFmtDate(o.time, lang)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: o.side === 'Buy' ? SC.greenSoft : '#FBE0E0', display: 'grid', placeItems: 'center' }}>
                        <Icon name={o.side === 'Buy' ? 'arrUp' : 'arrDn'} size={14} color={o.side === 'Buy' ? SC.greenDeep : '#8E1F1F'} strokeWidth={2.2}/>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: o.side === 'Buy' ? SC.greenDeep : '#C0392B' }}>
                        {o.side === 'Buy' ? (lang === 'ru' ? 'Покупка' : 'Buy') : (lang === 'ru' ? 'Продажа' : 'Sell')}
                      </span>
                    </div>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: SC.ink1000, textAlign: 'right' }}>{bhQtyPrice(o)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: SC.ink1000 }}>{bhTotal(o)}</div>
                      <div style={{ fontSize: 11, color: '#F7A600', fontWeight: 600, marginTop: 2 }}>● {bhStatusLabel(o.status, o.recordType, lang)}</div>
                    </div>
                    <button onClick={() => cancelOrder1(o)} disabled={cancellingId1 === o.id} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#FEF2F2', color: '#EF4444', display: 'grid', placeItems: 'center', opacity: cancellingId1 === o.id ? 0.5 : 1 }}>
                      {cancellingId1 === o.id ? '…' : <Icon name="close" size={12} color="#EF4444" strokeWidth={2.5}/>}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trades tab */}
            {tab === 'trades' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '8px 4px', fontSize: 11, color: SC.ink500, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: `1px solid ${SC.ink200}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SC.ink1000, textTransform: 'none', letterSpacing: '-0.2px' }}>{lang === 'ru' ? 'Инструмент' : 'Instrument'}</span>
                  <span>{lang === 'ru' ? 'Тип' : 'Side'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Кол-во × Цена' : 'Qty × Price'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Итого' : 'Total'}</span>
                </div>
                {closedTrades1.length === 0
                  ? <div style={{ textAlign: 'center', padding: '32px 0', color: SC.ink500, fontSize: 14 }}>{lang === 'ru' ? 'Нет исполненных сделок' : 'No trades yet'}</div>
                  : closedTrades1.map((tr, i, arr) => (
                  <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '14px 4px', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${SC.ink100}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TickerLogo symbol={bhSym(tr.symbol)} size={34}/>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{bhSym(tr.symbol)}</div>
                        <div style={{ fontSize: 12, color: SC.ink500 }}>{bhFmtDate(tr.time, lang)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: bhSideColor(tr.side, false) }}>
                      {tr.side === 'Buy' ? (lang === 'ru' ? 'Купил' : 'Bought') : (lang === 'ru' ? 'Продал' : 'Sold')}
                    </div>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 500, color: SC.ink1000, textAlign: 'right' }}>{bhQtyPrice(tr)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, color: SC.ink1000 }}>{bhTotal(tr)}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: bhStatusColor(tr.status, tr.recordType, false) }}>{bhStatusLabel(tr.status, tr.recordType, lang)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right rail */}
          <aside style={{ gridColumn: '2', gridRow: '2', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Asset type breakdown card */}
            <div style={{ background: SC.ink50, borderRadius: 24, padding: 20, border: `1px solid ${SC.ink200}` }}>
              <div style={{ fontSize: 11, color: SC.ink500, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                {lang === 'ru' ? 'Структура активов' : 'Asset structure'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Donut */}
                <div style={{ position: 'relative', flex: '0 0 auto' }}>
                  <Donut segments={stableVarSegs1} size={110} thickness={18}/>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 12, fontWeight: 700, color: SC.ink1000, letterSpacing: '-0.03em' }}>
                        ${stableVarSegs1.reduce((s, x) => s + x.usd, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: 9, color: SC.ink500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>total</div>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stableVarSegs1.map(s => (
                    <div key={s.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, fontWeight: 600, color: SC.ink1000 }}>{s.label}</span>
                      </div>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 11, color: SC.ink500, paddingLeft: 15 }}>
                        ${s.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })} · {s.pct}%
                      </div>
                    </div>
                  ))}
                  {stableVarSegs1.length === 0 && (
                    <div style={{ fontSize: 12, color: SC.ink500 }}>{lang === 'ru' ? 'Нет данных' : 'No data'}</div>
                  )}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// V2 — Web "Минимализм" : ink only on paper, sparse, generous whitespace
// ──────────────────────────────────────────────────────────────
function WebV2Minimal({ lang = 'ru', setLang = () => {}, onNav, active = 'home', onTrade = () => {}, onTopUp = () => {}, onWithdraw = () => {} }) {
  const [chatOpen, setChatOpen]   = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [tab, setTab] = React.useState('portfolio');
  const { holdings: liveHoldings } = usePortfolio();
  const { rates: kgsRates } = typeof useKgsRates === 'function' ? useKgsRates() : { rates: {} };
  const stats = React.useMemo(() => computePortfolioStats(liveHoldings, kgsRates['USD']), [liveHoldings, kgsRates['USD']]);
  const { balances: bybitBals } = typeof useBybitAccount === 'function' ? useBybitAccount() : { balances: [] };
  const bybitHoldings = React.useMemo(() => bybitBals.filter(b => parseFloat(b.usdValue) > 0.01).map(b => {
    const qty = parseFloat(b.walletBalance || b.free);
    const usd = parseFloat(b.usdValue);
    return { symbol: b.asset, name: b.asset, qty, price: qty > 0 ? usd / qty : 0, ccy: '$', change: 0 };
  }), [bybitBals]);
  const cashHoldings   = liveHoldings.filter(h => h.cls === 'cash' && h.source !== 'bybit');
  const kgHoldings     = liveHoldings.filter(h => h.cls === 'kg');
  const cryptoHoldings = liveHoldings.filter(h => h.cls === 'crypto' && h.source !== 'bybit');
  const cfdHoldings    = liveHoldings.filter(h => h.cls === 'cfd');
  const { orders: allRecords2, refetch: refetchHistory2 } = typeof useBybitHistory === 'function' ? useBybitHistory() : { orders: [], refetch: () => {} };
  const openOrders2   = React.useMemo(() => allRecords2.filter(r => r.recordType === 'open_order'), [allRecords2]);
  const closedTrades2 = React.useMemo(() => allRecords2.filter(r => r.recordType === 'order'), [allRecords2]);
  const [cancellingId2, setCancellingId2] = React.useState(null);
  const cancelOrder2 = React.useCallback(async (o) => {
    if (cancellingId2) return;
    if (!window.confirm(lang === 'ru' ? `Вы хотите отменить ордер?\n${o.side === 'Buy' ? 'Покупка' : 'Продажа'} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}` : `Cancel this order?\n${o.side} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}`)) return;
    setCancellingId2(o.id);
    try {
      const res = await fetch(`${BYBIT_WORKER}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: o.id, symbol: o.symbol, category: o.category || 'spot' }) });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Error');
      refetchHistory2();
    } catch(e) { alert(lang === 'ru' ? `Ошибка отмены: ${e.message}` : `Cancel error: ${e.message}`); }
    finally { setCancellingId2(null); }
  }, [cancellingId2, lang, refetchHistory2]);
  const tabsCfg = [
    { id: 'portfolio', label: lang === 'ru' ? 'Портфель' : 'Portfolio' },
    { id: 'orders',    label: lang === 'ru' ? 'Приказы'  : 'Orders' },
    { id: 'trades',    label: lang === 'ru' ? 'Сделки'   : 'Trades' },
  ];
  return (
    <div data-screen-label={`Web / V2 Minimal / ${lang}`} style={{
      display: 'flex', flex: 1, minWidth: 0, minHeight: 0,
      background: SC.paper,
      fontFamily: SC.fontDisplay, color: SC.ink1000,
    }}>
      {chatOpen  && <WebChatOverlay  lang={lang} dark={false} onClose={() => setChatOpen(false)}/>}
      {notifOpen && <WebNotifOverlay lang={lang} dark={false} onClose={() => setNotifOpen(false)}/>}
      <WebSidebar lang={lang} onNav={onNav} active={active}/>
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: SC.paper, overflow: 'hidden' }}>
        <WebTopBar lang={lang} setLang={setLang} onChat={() => setChatOpen(v => !v)} onNotif={() => setNotifOpen(v => !v)}/>

        <div style={{ flex: 1, padding: '40px 56px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Eyebrow */}
          <div>
            <div style={{ fontSize: 12, color: SC.ink500, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              {t(lang, 'hi')}, {clientFirstName(lang)}
            </div>
            <div style={{ fontSize: 14, color: SC.ink500, letterSpacing: '-0.2px' }}>
              {lang === 'ru' ? 'Вот ваш портфель сегодня.' : 'Here is your portfolio today.'}
            </div>
          </div>

          {/* Hero — pure ink */}
          <section style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: SC.ink500, fontWeight: 500, marginBottom: 14 }}>{t(lang, 'totalBalance')}</div>
              <MoneyKGS value={stats.totalKgs} size={84} weight={600}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
                <DeltaPill value={stats.dayChangePct} size="md" mode="ghost"/>
                <span style={{ fontFamily: SC.fontMono, fontSize: 14, color: SC.ink500 }}>
                  {fmtKGS(stats.dayChangeKgs, { sign: true })} {t(lang, 'soms')}
                </span>
                <span style={{ fontSize: 13, color: SC.ink500 }}>· {t(lang, 'todayChange')}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <Pill variant="dark" size="md" arrow icon="plus" onClick={() => onTrade('buy')}>{t(lang, 'buy')}</Pill>
                <Pill variant="outline" size="md" onClick={() => onTrade('sell')}>{t(lang, 'sell')}</Pill>
                <Pill variant="outline" size="md" icon="upload" onClick={onWithdraw}>{t(lang, 'withdraw')}</Pill>
                <Pill variant="outline" size="md" icon="download" onClick={onTopUp}>{t(lang, 'topUp')}</Pill>
              </div>
            </div>
            {/* Portfolio structure — donut */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' }}>
              <div style={{ flex: '0 0 auto', position: 'relative' }}>
                <Donut segments={stats.allocation[lang]} size={150} thickness={22}/>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: SC.ink1000 }}>{stats.classCount}</div>
                    <div style={{ fontSize: 10, color: SC.ink500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'класса' : 'classes'}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.allocation[lang].map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: s.color }}/>
                    <span style={{ fontSize: 13, color: SC.ink500, fontWeight: 500, flex: 1 }}>{s.label}</span>
                    <span style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 700, color: SC.ink1000 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Assets — tabs */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: SC.ink500, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t(lang, 'assets')}</div>
              <div style={{ display: 'flex', background: SC.ink50, borderRadius: 10, padding: 3 }}>
                {tabsCfg.map(tg => (
                  <button key={tg.id} onClick={() => setTab(tg.id)} style={{
                    background: tab === tg.id ? SC.ink1000 : 'transparent',
                    color: tab === tg.id ? '#fff' : SC.ink500,
                    border: 'none', cursor: 'pointer',
                    padding: '5px 14px', borderRadius: 8,
                    fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 12, letterSpacing: '-0.2px',
                  }}>{tg.label}</button>
                ))}
              </div>
            </div>

            {tab === 'portfolio' && [
              { title: lang === 'ru' ? 'Валюта' : 'Currency',   rows: cashHoldings,   extra: [] },
              { title: 'KG рынок',                               rows: kgHoldings,     extra: [] },
              { title: lang === 'ru' ? 'Крипто' : 'Crypto',     rows: cryptoHoldings, extra: bybitHoldings },
              { title: 'CFD',                                    rows: cfdHoldings,    extra: [] },
            ].map(group => (group.rows.length + group.extra.length) === 0 ? null : (
              <React.Fragment key={group.title}>
                <div style={{ fontSize: 10, fontWeight: 700, color: SC.ink400, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 0 6px', borderTop: `1px solid ${SC.ink100}` }}>
                  {group.title}
                </div>
                {group.rows.map((h, i, arr) => (
                  <AssetRow key={h.symbol} {...h} sparkData={h.spark} priceCcy={h.ccy} last={i === arr.length - 1 && group.extra.length === 0}/>
                ))}
                {group.extra.map((h, i, arr) => (
                  <AssetRow key={'bybit-' + h.symbol} {...h} priceCcy="$" last={i === arr.length - 1} badge="bybit live"/>
                ))}
              </React.Fragment>
            ))}

            {tab === 'orders' && (
              openOrders2.length === 0
                ? <div style={{ textAlign: 'center', padding: '32px 0', color: SC.ink500, fontSize: 14 }}>{lang === 'ru' ? 'Нет активных приказов' : 'No open orders'}</div>
                : openOrders2.map((o, i, arr) => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${SC.ink100}` }}>
                  <TickerLogo symbol={bhSym(o.symbol)} size={36}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>
                      <span style={{ color: o.side === 'Buy' ? SC.greenDeep : '#C0392B', marginRight: 6 }}>
                        {o.side === 'Buy' ? (lang === 'ru' ? 'Покупка' : 'Buy') : (lang === 'ru' ? 'Продажа' : 'Sell')}
                      </span>
                      {bhSym(o.symbol)}
                    </div>
                    <div style={{ fontSize: 12, color: SC.ink500, marginTop: 2 }}>{bhQtyPrice(o)} · {bhFmtDate(o.time, lang)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600 }}>{bhTotal(o)}</div>
                    <div style={{ fontSize: 11, color: '#F7A600', fontWeight: 600, marginTop: 2 }}>● {bhStatusLabel(o.status, o.recordType, lang)}</div>
                  </div>
                  <button onClick={() => cancelOrder2(o)} disabled={cancellingId2 === o.id} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#FEF2F2', color: '#EF4444', display: 'grid', placeItems: 'center', opacity: cancellingId2 === o.id ? 0.5 : 1, flexShrink: 0 }}>
                    {cancellingId2 === o.id ? '…' : <Icon name="close" size={12} color="#EF4444" strokeWidth={2.5}/>}
                  </button>
                </div>
              ))
            )}

            {tab === 'trades' && (
              closedTrades2.length === 0
                ? <div style={{ textAlign: 'center', padding: '32px 0', color: SC.ink500, fontSize: 14 }}>{lang === 'ru' ? 'Нет исполненных сделок' : 'No trades yet'}</div>
                : closedTrades2.map((tr, i, arr) => (
                <div key={tr.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${SC.ink100}` }}>
                  <TickerLogo symbol={bhSym(tr.symbol)} size={36}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>
                      <span style={{ color: bhSideColor(tr.side, false), marginRight: 6 }}>
                        {tr.side === 'Buy' ? (lang === 'ru' ? 'Купил' : 'Bought') : (lang === 'ru' ? 'Продал' : 'Sold')}
                      </span>
                      {bhSym(tr.symbol)}
                    </div>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 12, color: SC.ink500, marginTop: 2 }}>{bhQtyPrice(tr)} · {bhFmtDate(tr.time, lang)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, color: SC.ink1000 }}>{bhTotal(tr)}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: bhStatusColor(tr.status, tr.recordType, false) }}>{bhStatusLabel(tr.status, tr.recordType, lang)}</div>
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// V3 — Web "Тёмная" : ink-1000 surfaces, green accent, denser
// ──────────────────────────────────────────────────────────────
function WebV3Dark({ lang = 'ru', setLang = () => {}, onNav, active = 'home', onTrade = () => {}, onTopUp = () => {}, onWithdraw = () => {} }) {
  const [chatOpen, setChatOpen]   = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [tab, setTab] = React.useState('portfolio');
  const { holdings: liveHoldings } = usePortfolio();
  const { rates: kgsRates } = typeof useKgsRates === 'function' ? useKgsRates() : { rates: {} };
  const stats = React.useMemo(() => computePortfolioStats(liveHoldings, kgsRates['USD']), [liveHoldings, kgsRates['USD']]);
  const { balances: bybitBals } = typeof useBybitAccount === 'function' ? useBybitAccount() : { balances: [] };
  const bybitHoldings = React.useMemo(() => bybitBals.filter(b => parseFloat(b.usdValue) > 0.01).map(b => {
    const qty = parseFloat(b.walletBalance || b.free);
    const usd = parseFloat(b.usdValue);
    return { symbol: b.asset, name: b.asset, qty, price: qty > 0 ? usd / qty : 0, ccy: '$', change: 0 };
  }), [bybitBals]);
  const cashHoldings   = liveHoldings.filter(h => h.cls === 'cash' && h.source !== 'bybit');
  const kgHoldings     = liveHoldings.filter(h => h.cls === 'kg');
  const cryptoHoldings = liveHoldings.filter(h => h.cls === 'crypto' && h.source !== 'bybit');
  const cfdHoldings    = liveHoldings.filter(h => h.cls === 'cfd');
  const STABLE_COINS_3 = ['USDT','USDC','BUSD','DAI','TUSD'];
  const stableVarSegs3 = React.useMemo(() => {
    const stableUsd = liveHoldings.filter(h => h.cls === 'cash').reduce((s, h) => s + (h.qty||0)*(h.price||0), 0)
      + bybitBals.filter(b => STABLE_COINS_3.includes(b.asset)).reduce((s, b) => s + parseFloat(b.usdValue||0), 0);
    const varUsd = liveHoldings.filter(h => h.cls !== 'cash').reduce((s, h) => s + (h.qty||0)*(h.price||0), 0)
      + bybitBals.filter(b => !STABLE_COINS_3.includes(b.asset)).reduce((s, b) => s + parseFloat(b.usdValue||0), 0);
    const total = stableUsd + varUsd || 1;
    return [
      { id: 'stable', label: lang === 'ru' ? 'Стабильная цена' : 'Stable price',   usd: stableUsd, pct: Math.round(stableUsd/total*100), color: '#7C8CF8' },
      { id: 'var',    label: lang === 'ru' ? 'Переменная цена' : 'Variable price', usd: varUsd,    pct: Math.round(varUsd/total*100),    color: '#0C47B7' },
    ].filter(s => s.usd > 0);
  }, [liveHoldings, bybitBals, lang]);
  const { orders: allRecords3, refetch: refetchHistory3 } = typeof useBybitHistory === 'function' ? useBybitHistory() : { orders: [], refetch: () => {} };
  const openOrders3   = React.useMemo(() => allRecords3.filter(r => r.recordType === 'open_order'), [allRecords3]);
  const closedTrades3 = React.useMemo(() => allRecords3.filter(r => r.recordType === 'order'), [allRecords3]);
  const [cancellingId3, setCancellingId3] = React.useState(null);
  const cancelOrder3 = React.useCallback(async (o) => {
    if (cancellingId3) return;
    if (!window.confirm(lang === 'ru' ? `Вы хотите отменить ордер?\n${o.side === 'Buy' ? 'Покупка' : 'Продажа'} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}` : `Cancel this order?\n${o.side} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}`)) return;
    setCancellingId3(o.id);
    try {
      const res = await fetch(`${BYBIT_WORKER}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: o.id, symbol: o.symbol, category: o.category || 'spot' }) });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Error');
      refetchHistory3();
    } catch(e) { alert(lang === 'ru' ? `Ошибка отмены: ${e.message}` : `Cancel error: ${e.message}`); }
    finally { setCancellingId3(null); }
  }, [cancellingId3, lang, refetchHistory3]);
  const tabsCfg = [
    { id: 'portfolio', label: lang === 'ru' ? 'Портфель' : 'Portfolio' },
    { id: 'orders',    label: lang === 'ru' ? 'Приказы'  : 'Orders' },
    { id: 'trades',    label: lang === 'ru' ? 'Сделки'   : 'Trades' },
  ];
  return (
    <div data-screen-label={`Web / V3 Dark / ${lang}`} style={{
      display: 'flex', flex: 1, minWidth: 0, minHeight: 0,
      background: SC.ink1000,
      fontFamily: SC.fontDisplay, color: '#fff',
    }}>
      {chatOpen  && <WebChatOverlay  lang={lang} dark={true} onClose={() => setChatOpen(false)}/>}
      {notifOpen && <WebNotifOverlay lang={lang} dark={true} onClose={() => setNotifOpen(false)}/>}
      <WebSidebar lang={lang} dark onNav={onNav} active={active}/>
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: SC.ink1000, overflow: 'hidden' }}>
        <WebTopBar lang={lang} setLang={setLang} dark onChat={() => setChatOpen(v => !v)} onNotif={() => setNotifOpen(v => !v)}/>

        <div style={{ flex: 1, padding: '24px 32px 32px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px', gridTemplateRows: 'auto auto', gap: 20, alignContent: 'start' }}>
          {/* Hero — black with subtle gradient */}
          <section style={{
            gridColumn: '1 / -1', gridRow: '1',
            background: 'linear-gradient(135deg, #161D1B 0%, #0E1413 100%)',
            borderRadius: 28, padding: '24px 28px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* subtle green glow */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(12,71,183,0.18), rgba(12,71,183,0) 70%)' }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t(lang, 'totalBalance')}</span>
                <Icon name="eye" size={14} color="rgba(255,255,255,0.45)"/>
              </div>
              <MoneyKGS value={stats.totalKgs} size={64} weight={600} color="#fff"/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 18 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 999,
                  background: stats.dayChangePct >= 0 ? 'rgba(12,71,183,0.22)' : 'rgba(239,68,68,0.22)',
                  color: stats.dayChangePct >= 0 ? SC.greenBright : '#EF4444',
                  fontFamily: SC.fontMono, fontWeight: 600, fontSize: 13,
                }}>
                  <Icon name={stats.dayChangePct >= 0 ? 'arrUp' : 'arrDn'} size={12} color={stats.dayChangePct >= 0 ? SC.greenBright : '#EF4444'} strokeWidth={2.4}/>
                  {stats.dayChangePct >= 0 ? '+' : ''}{stats.dayChangePct.toFixed(2)}%
                </span>
                <span style={{ fontFamily: SC.fontMono, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                  {fmtKGS(stats.dayChangeKgs, { sign: true })} {t(lang, 'soms')} · {t(lang, 'todayChange')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Pill variant="primary" size="md" arrow icon="plus" onClick={() => onTrade('buy')}>{t(lang, 'buy')}</Pill>
                <Pill variant="softDark" size="md" onClick={() => onTrade('sell')}>{t(lang, 'sell')}</Pill>
                <Pill variant="softDark" size="md" icon="upload" onClick={onWithdraw}>{t(lang, 'withdraw')}</Pill>
                <Pill variant="softDark" size="md" icon="download" onClick={onTopUp}>{t(lang, 'topUp')}</Pill>
              </div>
            </div>
            {/* Portfolio structure — donut */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' }}>
              <div style={{ flex: '0 0 auto', position: 'relative' }}>
                <Donut segments={stats.allocation[lang]} size={150} thickness={22} dark/>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff' }}>{stats.classCount}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'класса' : 'classes'}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.allocation[lang].map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: s.color }}/>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500, flex: 1 }}>{s.label}</span>
                    <span style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Holdings */}
          <section style={{
            gridColumn: '1', gridRow: '2',
            background: SC.ink900, borderRadius: 24, padding: '20px 24px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 0, marginBottom: 16, alignSelf: 'flex-start' }}>
              {tabsCfg.map(tg => (
                <button key={tg.id} onClick={() => setTab(tg.id)} style={{
                  background: tab === tg.id ? '#fff' : 'transparent',
                  color: tab === tg.id ? SC.ink1000 : 'rgba(255,255,255,0.5)',
                  border: 'none', cursor: 'pointer',
                  padding: '6px 16px', borderRadius: 8,
                  fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.2px',
                }}>{tg.label}</button>
              ))}
            </div>

            {/* Portfolio tab */}
            {tab === 'portfolio' && (<>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr', gap: 12, padding: '8px 4px', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'none', letterSpacing: '-0.2px' }}>{lang === 'ru' ? 'Актив' : 'Asset'}</span>
                <span>{lang === 'ru' ? 'Кол-во' : 'Qty'}</span>
                <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Цена' : 'Price'}</span>
                <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Итого' : 'Total'}</span>
                <span></span>
              </div>
              {[
                { title: lang === 'ru' ? 'Валюта' : 'Currency',   rows: cashHoldings,   extra: [] },
                { title: 'KG рынок',                               rows: kgHoldings,     extra: [] },
                { title: lang === 'ru' ? 'Крипто' : 'Crypto',     rows: cryptoHoldings, extra: bybitHoldings },
                { title: 'CFD',                                    rows: cfdHoldings,    extra: [] },
              ].map(group => (group.rows.length + group.extra.length) === 0 ? null : (
                <React.Fragment key={group.title}>
                  <div style={{ padding: '10px 4px 6px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
                    {group.title}
                  </div>
                  {group.rows.map((h, i, arr) => {
                    const total = (h.qty || 0) * (h.price || 0);
                    const isLast = i === arr.length - 1 && group.extra.length === 0;
                    return (
                      <div key={h.symbol} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr', gap: 12, padding: '12px 4px', alignItems: 'center', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <TickerLogo symbol={h.symbol} size={34}/>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>{h.symbol}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{h.name}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 500, color: '#fff' }}>{h.qty}</div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                          {h.price > 0 ? (h.ccy + h.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '—'}
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                          {total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: total < 1000 ? 2 : 0, maximumFractionDigits: total < 1000 ? 2 : 0 }) : '—'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Sparkline data={h.spark} width={72} height={28}/></div>
                      </div>
                    );
                  })}
                  {group.extra.map((h, i, arr) => {
                    const total = h.qty * h.price;
                    return (
                      <div key={'bybit-' + h.symbol} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr', gap: 12, padding: '12px 4px', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <TickerLogo symbol={h.symbol} size={34}/>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>{h.symbol}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'rgba(12,71,183,0.2)', color: '#0C47B7', padding: '2px 5px', borderRadius: 4 }}>bybit live</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{h.name}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 500, color: '#fff' }}>
                          {h.qty < 0.01 ? h.qty.toFixed(6) : h.qty < 1 ? h.qty.toFixed(4) : h.qty.toFixed(2)}
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                          {h.price > 0 ? ('$' + h.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '—'}
                        </div>
                        <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                          {total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: total < 1000 ? 2 : 0, maximumFractionDigits: total < 1000 ? 2 : 0 }) : '—'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><DeltaPill value={0} size="sm" mode="ghost"/></div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </>)}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, padding: '8px 4px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'none', letterSpacing: '-0.2px' }}>{lang === 'ru' ? 'Инструмент' : 'Instrument'}</span>
                  <span>{lang === 'ru' ? 'Вид' : 'Type'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Кол-во × Цена' : 'Qty × Price'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Дата' : 'Date'}</span>
                  <span/>
                </div>
                {openOrders3.length === 0
                  ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{lang === 'ru' ? 'Нет активных приказов' : 'No open orders'}</div>
                  : openOrders3.map((o, i, arr) => (
                  <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, padding: '14px 4px', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TickerLogo symbol={bhSym(o.symbol)} size={34}/>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>{bhSym(o.symbol)}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{bhFmtDate(o.time, lang)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: o.side === 'Buy' ? 'rgba(12,71,183,0.2)' : 'rgba(239,68,68,0.18)', display: 'grid', placeItems: 'center' }}>
                        <Icon name={o.side === 'Buy' ? 'arrUp' : 'arrDn'} size={14} color={o.side === 'Buy' ? SC.greenBright : '#EF4444'} strokeWidth={2.2}/>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: o.side === 'Buy' ? SC.greenBright : '#EF4444' }}>
                        {o.side === 'Buy' ? (lang === 'ru' ? 'Покупка' : 'Buy') : (lang === 'ru' ? 'Продажа' : 'Sell')}
                      </span>
                    </div>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>{bhQtyPrice(o)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: '#fff' }}>{bhTotal(o)}</div>
                      <div style={{ fontSize: 11, color: '#F7A600', fontWeight: 600, marginTop: 2 }}>● {bhStatusLabel(o.status, o.recordType, lang)}</div>
                    </div>
                    <button onClick={() => cancelOrder3(o)} disabled={cancellingId3 === o.id} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', color: '#EF4444', display: 'grid', placeItems: 'center', opacity: cancellingId3 === o.id ? 0.5 : 1 }}>
                      {cancellingId3 === o.id ? '…' : <Icon name="close" size={12} color="#EF4444" strokeWidth={2.5}/>}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trades tab */}
            {tab === 'trades' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '8px 4px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'none', letterSpacing: '-0.2px' }}>{lang === 'ru' ? 'Инструмент' : 'Instrument'}</span>
                  <span>{lang === 'ru' ? 'Тип' : 'Side'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Кол-во × Цена' : 'Qty × Price'}</span>
                  <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Итого' : 'Total'}</span>
                </div>
                {closedTrades3.length === 0
                  ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{lang === 'ru' ? 'Нет исполненных сделок' : 'No trades yet'}</div>
                  : closedTrades3.map((tr, i, arr) => (
                  <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '14px 4px', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TickerLogo symbol={bhSym(tr.symbol)} size={34}/>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>{bhSym(tr.symbol)}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{bhFmtDate(tr.time, lang)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: bhSideColor(tr.side, true) }}>
                      {tr.side === 'Buy' ? (lang === 'ru' ? 'Купил' : 'Bought') : (lang === 'ru' ? 'Продал' : 'Sold')}
                    </div>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 500, color: '#fff', textAlign: 'right' }}>{bhQtyPrice(tr)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, color: '#fff' }}>{bhTotal(tr)}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: bhStatusColor(tr.status, tr.recordType, true) }}>{bhStatusLabel(tr.status, tr.recordType, lang)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right rail */}
          <aside style={{ gridColumn: '2', gridRow: '2', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Asset type breakdown card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                {lang === 'ru' ? 'Структура активов' : 'Asset structure'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Donut */}
                <div style={{ position: 'relative', flex: '0 0 auto' }}>
                  <Donut segments={stableVarSegs3} size={110} thickness={18} dark/>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
                        ${stableVarSegs3.reduce((s, x) => s + x.usd, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>total</div>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stableVarSegs3.map(s => (
                    <div key={s.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{s.label}</span>
                      </div>
                      <div style={{ fontFamily: SC.fontMono, fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingLeft: 15 }}>
                        ${s.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })} · {s.pct}%
                      </div>
                    </div>
                  ))}
                  {stableVarSegs3.length === 0 && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{lang === 'ru' ? 'Нет данных' : 'No data'}</div>
                  )}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { WebSidebar, WebTopBar, Donut, WebChatOverlay, WebNotifOverlay, WebV1Green, WebV2Minimal, WebV3Dark });
