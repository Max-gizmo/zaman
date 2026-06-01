// Zaman brokerage — shared atoms & micro-components
// Loaded as a Babel script; exports go to window at bottom.

// Hide scrollbars while keeping scroll behavior — applies anywhere that
// uses overflow:auto/scroll inside a senti screen. Injected once.
if (typeof document !== 'undefined' && !document.getElementById('senti-no-scrollbar')) {
  const s = document.createElement('style');
  s.id = 'senti-no-scrollbar';
  s.textContent = `
    [data-screen-label] *,
    [data-senti-noscrollbar] {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    [data-screen-label] *::-webkit-scrollbar,
    [data-senti-noscrollbar]::-webkit-scrollbar { display: none; width: 0; height: 0; }
    @keyframes spin360 { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(s);
}

const SC = {
  green: '#0C47B7',
  greenBright: '#1F5FD8',
  greenDeep: '#052E80',
  greenSoft: '#C2D5FB',
  greenWash: '#F2F6FF',
  lime: '#5C8BEE',
  ink1000: '#0E1413',
  ink900: '#161D1B',
  ink800: '#1F2725',
  ink700: '#2A3331',
  ink500: '#6B7672',
  ink400: '#95A09C',
  ink300: '#C7CFCC',
  ink200: '#E4E9E6',
  ink100: '#F1F4F2',
  ink50: '#F7F8F6',
  paper: '#FFFFFF',
  danger: '#DC3232',
  fontDisplay: "'Manrope','Helvetica Neue',system-ui,-apple-system,sans-serif",
  fontMono: "'IBM Plex Mono','SFMono-Regular',Menlo,monospace",
};

// Top inset for screen headers. The full-screen Phone build (window.SENTI_PHONE)
// trims the simulated status-bar gap that the framed prototype needs.
function topPad(framedPx) {
  return (typeof window !== 'undefined' && window.SENTI_PHONE)
    ? 'max(env(safe-area-inset-top, 0px), 14px)'
    : framedPx + 'px';
}

// ──────────────────────────────────────────────────────────────
// i18n — Russian primary, English fallback
// ──────────────────────────────────────────────────────────────
const TR = {
  ru: {
    hi: 'Доброе утро',
    portfolio: 'Портфель',
    portfolioTab: 'Портфель',
    home: 'Главная',
    menu: 'Меню',
    orders: 'Приказы',
    trades: 'Сделки',
    totalBalance: 'Всего на счёте',
    todayChange: 'За сегодня',
    buy: 'Купить',
    sell: 'Продать',
    exchange: 'Обмен',
    withdraw: 'Вывод',
    topUp: 'Пополнить',
    withdrawLong: 'Вывести',
    assets: 'Активы',
    markets: 'Рынки',
    ideas: 'Идеи',
    investIdeas: 'Инвестиционные идеи',
    history: 'История',
    profile: 'Профиль',
    seeAll: 'Все',
    localMarket: 'Кыргызский рынок',
    globalCFD: 'Мировые акции · CFD',
    crypto: 'Криптовалюта',
    forex: 'Валюта',
    allocation: 'Структура портфеля',
    insight: 'Совет на сегодня',
    moversToday: 'Сегодня в движении',
    watchlist: 'Список наблюдения',
    overview: 'Обзор',
    dayPnL: '+4 280 с сегодня',
    insightText: 'Ваш портфель растёт третий день подряд. Лидер — NVDA, +2,3%.',
    quickTrade: 'Быстрая сделка',
    chart7d: '7 дней',
    chart1m: '1 мес',
    chart1y: '1 год',
    welcomeBack: 'С возвращением',
    deposits: 'Депозит',
    learn: 'Обучение',
    education: 'Учиться',
    educationCard: 'Узнайте, как работают CFD',
    educationSub: '3 минуты на чтение',
    news: 'Новости',
    soms: 'сом',
    commodities: 'Товары',
    fx: 'Fx',
    chat: 'Чат',
  },
  en: {
    hi: 'Good morning',
    portfolio: 'Portfolio',
    portfolioTab: 'Portfolio',
    home: 'Home',
    menu: 'Menu',
    orders: 'Orders',
    trades: 'Trades',
    totalBalance: 'Total balance',
    todayChange: 'Today',
    buy: 'Buy',
    sell: 'Sell',
    exchange: 'Exchange',
    withdraw: 'Withdraw',
    topUp: 'Top up',
    withdrawLong: 'Withdraw',
    assets: 'Assets',
    markets: 'Markets',
    ideas: 'Ideas',
    investIdeas: 'Investment ideas',
    history: 'History',
    profile: 'Profile',
    seeAll: 'All',
    localMarket: 'Kyrgyz market',
    globalCFD: 'Global stocks · CFD',
    crypto: 'Crypto',
    forex: 'Forex',
    allocation: 'Portfolio mix',
    insight: 'Today',
    moversToday: 'Today\u2019s movers',
    watchlist: 'Watchlist',
    overview: 'Overview',
    dayPnL: '+4,280 KGS today',
    insightText: 'Your portfolio is up three days running. Top mover — NVDA, +2.3%.',
    quickTrade: 'Quick trade',
    chart7d: '7d',
    chart1m: '1m',
    chart1y: '1y',
    welcomeBack: 'Welcome back',
    deposits: 'Deposit',
    learn: 'Learn',
    education: 'Learn',
    educationCard: 'How CFDs work',
    educationSub: '3 min read',
    news: 'News',
    soms: 'KGS',
    commodities: 'Commodities',
    fx: 'Fx',
    chat: 'Chat',
  },
};
const t = (lang, key) => (TR[lang] && TR[lang][key]) || TR.en[key] || key;

// ──────────────────────────────────────────────────────────────
// Money formatter — KGS with thousands separator, tabular figures
// fmtKGS(value, opts?) -> '248 420,50 с'
// ──────────────────────────────────────────────────────────────
function fmtKGS(value, { decimals = 2, sign = false } = {}) {
  const negative = value < 0;
  const abs = Math.abs(value);
  const [whole, dec] = abs.toFixed(decimals).split('.');
  const w = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F'); // thin space
  const signStr = sign ? (negative ? '−' : '+') : (negative ? '−' : '');
  return decimals ? `${signStr}${w},${dec}` : `${signStr}${w}`;
}
function fmtUSD(value, { decimals = 2, sign = false } = {}) {
  const negative = value < 0;
  const abs = Math.abs(value);
  const [whole, dec] = abs.toFixed(decimals).split('.');
  const w = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const signStr = sign ? (negative ? '−' : '+') : (negative ? '−' : '');
  return decimals ? `${signStr}$${w}.${dec}` : `${signStr}$${w}`;
}

// ──────────────────────────────────────────────────────────────
// KGS money display — large number, sub "с" symbol, tabular
// ──────────────────────────────────────────────────────────────
function MoneyKGS({ value, size = 48, weight = 600, color, decimals = 2, suffix = 'с', monoOnly = false }) {
  const formatted = fmtKGS(value, { decimals });
  return (
    <span style={{
      fontFamily: monoOnly ? SC.fontMono : SC.fontDisplay,
      fontFeatureSettings: "'tnum' 1, 'cv11' 1",
      fontSize: size, fontWeight: weight, color: color || 'inherit',
      letterSpacing: '-0.03em', lineHeight: 1,
      display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap',
    }}>
      <span>{formatted}</span>
      <span style={{ opacity: 0.5, fontSize: size * 0.46, marginLeft: size * 0.12, fontWeight: 500 }}>{suffix}</span>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// Lucide-style icons
// ──────────────────────────────────────────────────────────────
function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 1.75 }) {
  const paths = {
    home:     <><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></>,
    chart:    <><path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-7"/></>,
    swap:     <><path d="M7 3v14m0 0-4-4m4 4 4-4M17 21V7m0 0-4 4m4-4 4 4"/></>,
    wallet:   <><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 14h2"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
    bell:     <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0"/></>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    minus:    <><path d="M5 12h14"/></>,
    arrUp:    <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrDn:    <><path d="M12 5v14M5 12l7 7 7-7"/></>,
    upload:   <><path d="M12 16V3M6 9l6-6 6 6M3 21h18"/></>,
    chat:     <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
    commodity:<><path d="M4 7l8-4 8 4-8 4z"/><path d="M4 17l8 4 8-4M4 12l8 4 8-4"/></>,
    news:     <><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    arrR:     <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrRup:   <><path d="M7 17 17 7M9 7h8v8"/></>,
    arrRdn:   <><path d="M7 7l10 10M17 9v8H9"/></>,
    chevR:    <><path d="m9 18 6-6-6-6"/></>,
    chevL:    <><path d="m15 18-6-6 6-6"/></>,
    chevD:    <><path d="m6 9 6 6 6-6"/></>,
    chevU:    <><path d="m6 15 6-6 6 6"/></>,
    eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff:   <><path d="M3 3l18 18M10.6 6.2A11 11 0 0 1 12 6c7 0 11 6 11 6a18 18 0 0 1-3 3.4M6 6.4a18 18 0 0 0-5 5.6s4 6 11 6c1.7 0 3.3-.4 4.7-1"/></>,
    sliders:  <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></>,
    spark:    <><path d="M12 3v4M3 12h4M12 17v4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></>,
    info:     <><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v4h1"/></>,
    book:     <><path d="M4 4v16h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zM8 4v16"/></>,
    btc:      <><circle cx="12" cy="12" r="10"/><path d="M9 7v10M9 7h4a2.5 2.5 0 0 1 0 5H9M9 12h5a2.5 2.5 0 0 1 0 5H9M11 5v2M11 17v2M14 5v2M14 17v2"/></>,
    coin:     <><circle cx="12" cy="12" r="9"/><path d="M14 9.5C13.5 8.5 12.5 8 11.5 8c-2 0-2.5 4-1 4s2 4 0 4c-1 0-2-.5-2.5-1.5"/></>,
    qr:       <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7h-7v-3"/></>,
    download: <><path d="M12 3v13M6 11l6 6 6-6M3 21h18"/></>,
    flag:     <><path d="M4 21V4M4 4h13l-3 5 3 5H4"/></>,
    layers:   <><path d="m2 12 10 5 10-5M2 17l10 5 10-5M12 2 2 7l10 5 10-5z"/></>,
    target:   <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14zM5 14l.6 1.6L7 16l-1.4.4L5 18l-.6-1.6L3 16l1.4-.4L5 14z"/></>,
    flame:    <><path d="M12 2c4 5 6 8 6 12a6 6 0 0 1-12 0c0-2 1-3 2-5 .5 1 1 1.5 2 1.5C9 6 11 4 12 2z"/></>,
    grid:     <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    star:     <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Sparkline — tiny SVG line chart for asset rows
// ──────────────────────────────────────────────────────────────
function Sparkline({ data, width = 64, height = 22, color, strokeWidth = 1.5, fill = false }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pad = 1;
  const step = (width - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, pad + (1 - (v - min) / range) * (height - pad * 2)]);
  const d = 'M' + pts.map(p => p.map(n => n.toFixed(2)).join(',')).join(' L');
  const last = data[data.length - 1], first = data[0];
  const up = last >= first;
  const stroke = color || (up ? SC.green : SC.danger);
  const gradId = `spg-${Math.random().toString(36).slice(2, 9)}`;
  const areaPath = `${d} L${pts[pts.length-1][0]},${height} L${pts[0][0]},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.25"/>
              <stop offset="100%" stopColor={stroke} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`}/>
        </>
      )}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Big chart — portfolio value over time, with gradient area
// ──────────────────────────────────────────────────────────────
function BigChart({ data, width = 600, height = 200, color = SC.green, fillColor, showDot = true, padX = 0, padY = 18 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = (width - padX * 2) / (data.length - 1);
  const pts = data.map((v, i) => [padX + i * step, padY + (1 - (v - min) / range) * (height - padY * 2)]);
  const d = 'M' + pts.map(p => p.map(n => n.toFixed(2)).join(',')).join(' L');
  const lastPt = pts[pts.length - 1];
  const gradId = `bcg-${Math.random().toString(36).slice(2, 9)}`;
  const areaPath = `${d} L${lastPt[0]},${height} L${pts[0][0]},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={fillColor || color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {showDot && (
        <>
          <circle cx={lastPt[0]} cy={lastPt[1]} r="6" fill={color} opacity="0.18"/>
          <circle cx={lastPt[0]} cy={lastPt[1]} r="3.5" fill={color}/>
        </>
      )}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// CandleChart helpers
// ──────────────────────────────────────────────────────────────
function _niceStep(range, steps) {
  const raw = range / (steps || 4);
  const exp = Math.floor(Math.log10(raw));
  const f = raw / Math.pow(10, exp);
  const nice = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nice * Math.pow(10, exp);
}
function _fmtAxisPrice(p) {
  if (p >= 100000) return `${(p / 1000).toFixed(0)}k`;
  if (p >= 10000)  return `${(p / 1000).toFixed(1)}k`;
  if (p >= 1000)   return p.toFixed(0);
  if (p >= 10)     return p.toFixed(2);
  if (p >= 1)      return p.toFixed(3);
  return p.toFixed(5);
}
function _fmtCandleDate(ts, iv) {
  const d = new Date(ts);
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (iv === '1m' || iv === '5m' || iv === '15m' || iv === '30m' || iv === '1h') {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  if (iv === '4h') return `${d.getDate()} ${mo[d.getMonth()]}`;
  if (iv === '1d') return `${d.getDate()} ${mo[d.getMonth()]}`;
  if (iv === '1w') return `${mo[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ──────────────────────────────────────────────────────────────
// CandleChart — OHLCV candlestick chart with grid and labels
// data: [{t, o, h, l, c, v}]  interval: '1m'|'1h'|'4h'|'1d'|'1w'
// ──────────────────────────────────────────────────────────────
function CandleChart({ data = [], loading = false, height = 200, dark = false, noDataLabel = 'Нет данных', interval = '1d' }) {
  const containerRef = React.useRef(null);
  const [svgW, setSvgW] = React.useState(360);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const upd = () => setSvgW(el.getBoundingClientRect().width || 360);
    upd();
    const obs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null;
    if (obs) obs.observe(el);
    return () => obs && obs.disconnect();
  }, []);

  const lblColor   = dark ? 'rgba(255,255,255,0.38)' : '#9CA3AF';
  const gridStroke = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const UP = '#0C47B7', DN = '#EF4444';

  const spinner = (
    <div ref={containerRef} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ animation: 'spin360 0.75s linear infinite' }}>
        <circle cx="14" cy="14" r="10" fill="none" stroke={dark ? 'rgba(255,255,255,0.1)' : SC.ink200} strokeWidth="2.5"/>
        <path d="M14 4 A10 10 0 0 1 24 14" fill="none" stroke={dark ? 'rgba(255,255,255,0.5)' : SC.ink500} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );

  if (loading) return spinner;

  if (!data || data.length < 2) {
    return (
      <div ref={containerRef} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: lblColor, fontSize: 13, fontFamily: SC.fontDisplay }}>
        {noDataLabel}
      </div>
    );
  }

  const mR = 44, mT = 8, mB = 22;
  const chartW = svgW - mR;
  const chartH = height - mT - mB;
  const n = data.length;
  const slotW = chartW / n;
  const cW = Math.max(1.5, Math.min(slotW * 0.65, 14));

  // Price scale with padding
  const maxP = Math.max(...data.map(d => d.h));
  const minP = Math.min(...data.map(d => d.l));
  const pr = maxP - minP || maxP * 0.01 || 1;
  const pad = pr * 0.07;
  const pMax = maxP + pad, pMin = minP - pad;
  const pR = pMax - pMin;

  const xOf = i => (i + 0.5) * slotW;
  const yOf = v => mT + (1 - (v - pMin) / pR) * chartH;

  // Horizontal price levels
  const step = _niceStep(pR, 4);
  const firstLvl = Math.ceil(pMin / step) * step;
  const priceLvls = [];
  for (let p = firstLvl; p <= pMax; p += step) {
    const pv = parseFloat(p.toPrecision(10));
    if (yOf(pv) >= mT && yOf(pv) <= mT + chartH) priceLvls.push(pv);
  }

  // Date marks every 10 candles
  const dateMarks = [];
  for (let i = 9; i < n; i += 10) dateMarks.push(i);

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      <svg width={svgW} height={height} style={{ display: 'block' }}>
        {/* Horizontal grid + price labels */}
        {priceLvls.map((p, pi) => {
          const y = yOf(p);
          return (
            <g key={pi}>
              <line x1={0} y1={y} x2={chartW} y2={y}
                stroke={gridStroke} strokeWidth="0.6" strokeDasharray="4 4"/>
              <text x={chartW + 4} y={y} fill={lblColor} fontSize="9"
                dominantBaseline="middle" fontFamily="'SF Mono','Fira Code',monospace" fontWeight="500">
                {_fmtAxisPrice(p)}
              </text>
            </g>
          );
        })}

        {/* Vertical grid lines */}
        {dateMarks.map(i => (
          <line key={i} x1={xOf(i)} y1={mT} x2={xOf(i)} y2={mT + chartH}
            stroke={gridStroke} strokeWidth="0.6" strokeDasharray="4 4"/>
        ))}

        {/* Candles */}
        {data.map((d, i) => {
          const x = xOf(i);
          const up = d.c >= d.o;
          const col = up ? UP : DN;
          const bTop = yOf(Math.max(d.o, d.c));
          const bBot = yOf(Math.min(d.o, d.c));
          const bH = Math.max(1.5, bBot - bTop);
          const wickW = Math.max(0.8, cW * 0.15);
          return (
            <g key={i}>
              <line x1={x} y1={yOf(d.h)} x2={x} y2={yOf(d.l)}
                stroke={col} strokeWidth={wickW} opacity="0.75"/>
              <rect x={x - cW / 2} y={bTop} width={cW} height={bH}
                fill={col} rx="0.8" ry="0.8"/>
            </g>
          );
        })}

        {/* Date labels */}
        {dateMarks.map(i => (
          <text key={i} x={xOf(i)} y={mT + chartH + 14} fill={lblColor}
            fontSize="9" textAnchor="middle"
            fontFamily="'SF Mono','Fira Code',monospace" fontWeight="400">
            {_fmtCandleDate(data[i].t, interval)}
          </text>
        ))}
      </svg>
    </div>
  );
}

// Keep PriceChart as alias for backward-compat (replaced by CandleChart)
const PriceChart = CandleChart;

// ──────────────────────────────────────────────────────────────
// Delta pill — "+1.2%" / "−0.4%" — green / red
// ──────────────────────────────────────────────────────────────
function DeltaPill({ value, size = 'sm', mode = 'soft' }) {
  // value as percent number, e.g. 1.2 or -0.4
  const up = value >= 0;
  const colorFg = up ? SC.greenDeep : '#8E1F1F';
  const colorBg = up ? SC.greenSoft : '#FBE0E0';
  const sizes = { sm: { fs: 12, py: 3, px: 8, ai: 10 }, md: { fs: 13, py: 4, px: 10, ai: 12 } };
  const s = sizes[size];
  const styles = mode === 'soft'
    ? { background: colorBg, color: colorFg }
    : mode === 'ghost'
      ? { background: 'transparent', color: colorFg }
      : { background: up ? SC.green : SC.danger, color: '#fff' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: `${s.py}px ${s.px}px`, borderRadius: 999,
      fontFamily: SC.fontMono, fontFeatureSettings: "'tnum' 1",
      fontSize: s.fs, fontWeight: 600, letterSpacing: '-0.2px',
      ...styles,
    }}>
      <span style={{ display: 'inline-block', transform: up ? 'rotate(0deg)' : 'rotate(180deg)', lineHeight: 0 }}>
        <svg width={s.ai} height={s.ai} viewBox="0 0 12 12"><path d="M6 2v8M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
      <span>{(up ? '' : '−')}{Math.abs(value).toFixed(value === Math.floor(value) ? 1 : Math.abs(value) < 1 ? 2 : 1)}%</span>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// Asset logo URLs — real logos from public CDNs
// ──────────────────────────────────────────────────────────────
const ASSET_IMG_URLS = {
  // Crypto — cryptocurrency-icons (open-source, jsdelivr CDN)
  BTC:   'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/btc.svg',
  ETH:   'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/eth.svg',
  BNB:   'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/bnb.svg',
  SOL:   'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/sol.svg',
  XRP:   'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/xrp.svg',
  ADA:   'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/ada.svg',
  DOGE:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/doge.svg',
  USDT:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/usdt.svg',
  USDC:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/usdc.svg',
  // CFD Stocks — Financial Modeling Prep (stable CDN)
  AAPL:  'https://financialmodelingprep.com/image-stock/AAPL.png',
  TSLA:  'https://financialmodelingprep.com/image-stock/TSLA.png',
  NVDA:  'https://financialmodelingprep.com/image-stock/NVDA.png',
  GOOGL: 'https://financialmodelingprep.com/image-stock/GOOGL.png',
  AMZN:  'https://financialmodelingprep.com/image-stock/AMZN.png',
  META:  'https://financialmodelingprep.com/image-stock/META.png',
  MSFT:  'https://financialmodelingprep.com/image-stock/MSFT.png',
  JPM:   'https://financialmodelingprep.com/image-stock/JPM.png',
  AMD:   'https://financialmodelingprep.com/image-stock/AMD.png',
  WMT:   'https://financialmodelingprep.com/image-stock/WMT.png',
  // KG Stocks — official bank/company logos
  KICB:  'https://kicb.net/local/templates/kicb/kicb_html/html/images/general/logos/logo-small.svg',
  OPTB:  'https://optimabank.kg/images/design/optima24logo.webp',
  RSKS:  'https://eldik.kg/images/Logo.png',
  // Forex / Currencies — country flags (flagcdn.com)
  USD:   'https://flagcdn.com/w40/us.png',
  EUR:   'https://flagcdn.com/w40/eu.png',
  GBP:   'https://flagcdn.com/w40/gb.png',
  JPY:   'https://flagcdn.com/w40/jp.png',
  RUB:   'https://flagcdn.com/w40/ru.png',
  CNY:   'https://flagcdn.com/w40/cn.png',
  KZT:   'https://flagcdn.com/w40/kz.png',
  KGS:   'https://flagcdn.com/w40/kg.png',
};

// Commodity inline SVG icons — from capital.com (embedded as data URIs)
const COMMODITY_SVG = {
  GOLD:  `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><path fill='%23D69A00' d='M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16'/><path fill='%23fff' d='M7.389 16a.46.46 0 0 0-.386.19l-3.065 4.574c-.17.255.043.57.386.57H15.23c.343 0 .557-.315.386-.57l-3.065-4.574a.46.46 0 0 0-.386-.19zm12.444 0a.46.46 0 0 0-.386.19l-3.065 4.574c-.17.255.043.57.386.57h10.909c.341 0 .554-.315.384-.57l-3.065-4.574a.46.46 0 0 0-.386-.19zm-6.222-7.111a.46.46 0 0 0-.386.19l-3.065 4.574c-.17.255.043.57.386.57h10.908c.342 0 .555-.316.384-.57L18.773 9.08a.46.46 0 0 0-.385-.19z'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
  SILV:  `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><path fill='%23ADABB8' d='M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16'/><path fill='%23fff' d='M7.51 17.111a.46.46 0 0 0-.384.19l-3.067 4.575c-.169.254.045.57.386.57h10.908c.342 0 .557-.316.386-.57L12.672 17.3a.46.46 0 0 0-.384-.19zm12.444 0a.46.46 0 0 0-.384.19l-3.067 4.575c-.17.254.045.57.386.57h10.909c.341 0 .556-.316.386-.57L25.117 17.3a.46.46 0 0 0-.384-.19zm-6.222-7.11a.46.46 0 0 0-.384.19l-3.067 4.574c-.169.254.045.57.386.57h10.909c.34 0 .556-.316.385-.57l-3.066-4.575a.46.46 0 0 0-.383-.19z'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
  XPT:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='10' fill='%23666'/><rect x='7' y='14' width='26' height='14' rx='3' fill='%23A0A0A8'/><text x='20' y='24' font-family='system-ui,sans-serif' font-size='8' font-weight='800' fill='%23fff' text-anchor='middle'>Pt</text></svg>`,
  XPD:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='10' fill='%23558'/><rect x='7' y='14' width='26' height='14' rx='3' fill='%238888CC'/><text x='20' y='24' font-family='system-ui,sans-serif' font-size='8' font-weight='800' fill='%23fff' text-anchor='middle'>Pd</text></svg>`,
  OIL:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><rect width='32' height='32' fill='%2314171A' rx='16'/><path fill='%23fff' d='M15.017 15.615a.29.29 0 1 1 .488.31c-.014.016-.577.933-.162 1.555a.287.287 0 0 1-.075.4.34.34 0 0 1-.162.044.28.28 0 0 1-.237-.133c-.622-.933.118-2.131.148-2.176'/><path fill='%23fff' fill-rule='evenodd' d='M20.67 21.816h.563c.34 0 .591.252.591.577a.61.61 0 0 1-.606.607H10.607a.62.62 0 0 1-.607-.607.61.61 0 0 1 .607-.607h.562v-3.048h-.148a.62.62 0 0 1-.607-.607.61.61 0 0 1 .607-.607h.148v-3.048h-.148a.62.62 0 0 1-.607-.607.61.61 0 0 1 .607-.607h.148v-3.049h-.562A.62.62 0 0 1 10 9.608.61.61 0 0 1 10.607 9h10.626a.62.62 0 0 1 .606.607.61.61 0 0 1-.606.607h-.563v3.063h.148a.62.62 0 0 1 .607.607.61.61 0 0 1-.607.607h-.148v3.063h.148a.62.62 0 0 1 .607.607.61.61 0 0 1-.607.606h-.148zm-6.837-4.884c0 1.155.932 2.087 2.087 2.087a2.084 2.084 0 0 0 2.086-2.087c0-.932-1.228-3.033-1.598-3.655a.55.55 0 0 0-.488-.281.55.55 0 0 0-.489.281c-.37.622-1.598 2.738-1.598 3.655' clip-rule='evenodd'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
  BRENT: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><rect width='32' height='32' fill='%2314171A' rx='16'/><path fill='%23fff' d='M15.017 15.615a.29.29 0 1 1 .488.31c-.014.016-.577.933-.162 1.555a.287.287 0 0 1-.075.4.34.34 0 0 1-.162.044.28.28 0 0 1-.237-.133c-.622-.933.118-2.131.148-2.176'/><path fill='%23fff' fill-rule='evenodd' d='M20.67 21.816h.563c.34 0 .591.252.591.577a.61.61 0 0 1-.606.607H10.607a.62.62 0 0 1-.607-.607.61.61 0 0 1 .607-.607h.562v-3.048h-.148a.62.62 0 0 1-.607-.607.61.61 0 0 1 .607-.607h.148v-3.048h-.148a.62.62 0 0 1-.607-.607.61.61 0 0 1 .607-.607h.148v-3.049h-.562A.62.62 0 0 1 10 9.608.61.61 0 0 1 10.607 9h10.626a.62.62 0 0 1 .606.607.61.61 0 0 1-.606.607h-.563v3.063h.148a.62.62 0 0 1 .607.607.61.61 0 0 1-.607.607h-.148v3.063h.148a.62.62 0 0 1 .607.607.61.61 0 0 1-.607.606h-.148zm-6.837-4.884c0 1.155.932 2.087 2.087 2.087a2.084 2.084 0 0 0 2.086-2.087c0-.932-1.228-3.033-1.598-3.655a.55.55 0 0 0-.488-.281.55.55 0 0 0-.489.281c-.37.622-1.598 2.738-1.598 3.655' clip-rule='evenodd'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
  WTI:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><path fill='url(%23b)' d='M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16'/><path fill='%23fff' d='M22.222 17.778c0 3.911-2.8 7.111-6.222 7.111s-6.223-3.2-6.223-7.111S16 5.334 16 5.334s6.222 8.533 6.222 12.444'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><linearGradient id='b' x1='5.954' x2='38.94' y1='5.55' y2='43.438' gradientUnits='userSpaceOnUse'><stop stop-color='%231A1E21'/><stop offset='1' stop-color='%2306060A'/></linearGradient><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
  NATGAS:`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><path fill='%2342A5F5' d='M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16'/><path fill='%23fff' d='M21.216 10.743c0 .148-.475 3.122-1.902 4.343 1.91-6.24-3.307-9.753-3.307-9.753S15.2 9.97 13.63 11.721c-.089-1.996-1.191-3.218-1.191-3.218-.79 3.61-3.55 6.73-3.55 9.069-.007 4.058 3.164 7.317 7.11 7.317 3.94 0 7.112-3.259 7.112-7.317 0-2.925-.8-5.067-1.895-6.827z'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
  COPP:  `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32'><g clip-path='url(%23a)'><path fill='%23C26A44' d='M0 16c0 8.837 7.163 16 16 16s16-7.163 16-16S24.837 0 16 0 0 7.163 0 16'/><path fill='%23fff' stroke='%23fff' stroke-linejoin='round' d='M7.902 22.299h5.437v-5.435H7.902v5.438zm10.758 0h5.436v-5.435H18.66v5.438zm-5.321-8.93h5.32v-5.32h-5.32z'/></g><rect width='31' height='31' x='.5' y='.5' stroke='%23fff' rx='15.5'/><defs><clipPath id='a'><rect width='32' height='32' fill='%23fff' rx='16'/></clipPath></defs></svg>`,
};

// KG stock colors (brand-matched)
const KG_PALETTES = {
  KCEL: ['#0056A2', '#fff'],   // Кыргызтелеком — blue
  BKAI: ['#003980', '#fff'],   // Банк Кыргызстана — navy
  KICB: ['#CC0000', '#fff'],   // KICB — red
  AKMB: ['#1B7A34', '#fff'],   // Айыл Банк — green
  OPTB: ['#D4282A', '#fff'],   // Оптима Банк — crimson
  RSKS: ['#1B3A7A', '#fff'],   // РСК Банк — dark navy
  ELST: ['#00427A', '#F4C400'], // Электрические станции — blue/yellow
  BKKY: ['#1B5E20', '#fff'],   // Бакай Банк — forest green
};

// ──────────────────────────────────────────────────────────────
// Ticker logo — real images with letter fallback
// ──────────────────────────────────────────────────────────────
function TickerLogo({ symbol, size = 40, palette }) {
  const [imgErr, setImgErr] = React.useState(false);
  // Normalize symbol (strip trading pair suffixes)
  const sym = symbol ? symbol.replace(/USDT$|USD$/, '') || symbol : '';
  const br = Math.round(size * 0.28);
  const url = ASSET_IMG_URLS[sym] || ASSET_IMG_URLS[symbol];
  const commSvg = COMMODITY_SVG[sym] || COMMODITY_SVG[symbol];

  // Real image (crypto, CFD stocks, forex flags)
  if (url && !imgErr) {
    const isFlag = ['USD','EUR','GBP','JPY','RUB','CNY','KZT','KGS'].includes(sym);
    const isCrypto = ['BTC','ETH','BNB','SOL','XRP','ADA','DOGE','USDT','USDC'].includes(sym);
    return (
      <div style={{
        width: size, height: size, borderRadius: br, flex: '0 0 auto',
        background: isCrypto ? '#fff' : 'transparent',
        overflow: 'hidden', display: 'grid', placeItems: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.07)',
      }}>
        <img
          src={url}
          onError={() => setImgErr(true)}
          alt={sym}
          style={{
            width: isFlag ? '100%' : isCrypto ? '90%' : '80%',
            height: isFlag ? '100%' : isCrypto ? '90%' : '80%',
            objectFit: isFlag ? 'cover' : 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Commodity SVG icon
  if (commSvg) {
    return <img src={commSvg} alt={sym} style={{ width: size, height: size, borderRadius: br, flex: '0 0 auto', display: 'block' }}/>;
  }

  // KG stocks — styled initials with brand colors
  const kgP = KG_PALETTES[sym] || KG_PALETTES[symbol];
  const fallbackP = palette || kgP || [SC.ink100, SC.ink1000];
  const INITIALS = {
    KCEL:'KT', BKAI:'BK', KICB:'KB', AKMB:'АБ', OPTB:'ОБ', RSKS:'РСК', ELST:'ЭС', BKKY:'ББ',
    GOLD:'Au', SILV:'Ag', XPT:'Pt', XPD:'Pd', OIL:'Oil', WTI:'WTI', BRENT:'Br', NATGAS:'NG', COPP:'Cu',
  };
  const initial = INITIALS[sym] || INITIALS[symbol] || (sym || symbol || '?').slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: br,
      background: fallbackP[0], color: fallbackP[1], flex: '0 0 auto',
      display: 'grid', placeItems: 'center',
      fontFamily: SC.fontDisplay, fontWeight: 800,
      fontSize: initial.length > 2 ? size * 0.32 : size * 0.42,
      letterSpacing: '-0.03em',
    }}>{initial}</div>
  );
}

// ──────────────────────────────────────────────────────────────
// Allocation strip — stacked horizontal bar of portfolio segments
// segments: [{ id, label, pct, color }]
// ──────────────────────────────────────────────────────────────
function AllocationStrip({ segments, height = 12, gap = 3, showLabels = true, labelLang = 'ru' }) {
  return (
    <div>
      <div style={{ display: 'flex', gap, height, borderRadius: 999, overflow: 'hidden' }}>
        {segments.map((s, i) => (
          <div key={s.id} style={{
            flex: s.pct, background: s.color, height,
            borderRadius: 999,
          }}/>
        ))}
      </div>
      {showLabels && (
        <div style={{ display: 'flex', flexWrap: 'nowrap', marginTop: 12 }}>
          {segments.map((s, i, arr) => (
            <div key={s.id} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, paddingRight: i < arr.length - 1 ? 6 : 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: 999, background: s.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, fontWeight: 500, color: SC.ink500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>{s.label}</span>
              <span style={{ fontFamily: SC.fontMono, fontSize: 11, fontWeight: 600, color: SC.ink1000, whiteSpace: 'nowrap', flexShrink: 0 }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Asset row — used in holdings lists
// ──────────────────────────────────────────────────────────────
function AssetRow({ symbol, name, price, priceCcy = '$', change, sparkData, qty, dark = false, last = false, onClick, badge, cols4 = false }) {
  const textCol = dark ? '#fff' : SC.ink1000;
  const subCol = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const border = dark ? 'rgba(255,255,255,0.07)' : SC.ink200;

  // 4-column layout (mobile/phone Портфель): name+icon · qty · price+change · total value
  if (cols4) {
    const hasPrice = typeof price === 'number';
    const tv = (qty != null && hasPrice) ? qty * price : null;
    const qtyStr = qty == null ? '—'
      : (qty % 1 === 0 ? qty : qty < 0.01 ? qty.toFixed(6) : qty < 1 ? qty.toFixed(4) : qty.toFixed(2));
    return (
      <div onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0',
        borderBottom: last ? 'none' : `1px solid ${border}`, cursor: onClick ? 'pointer' : 'default',
      }}>
        <TickerLogo symbol={symbol} size={34}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 14, color: textCol, letterSpacing: '-0.2px' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{symbol}</span>
            {badge && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: 'rgba(12,71,183,0.15)', color: '#0C47B7', padding: '2px 4px', borderRadius: 4, flexShrink: 0 }}>{badge}</span>}
          </div>
          <div style={{ fontSize: 11, color: subCol, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        </div>
        <div style={{ width: 50, textAlign: 'right', fontFamily: SC.fontMono, fontSize: 12, color: subCol }}>{qtyStr}</div>
        <div style={{ width: 80, textAlign: 'right' }}>
          <div style={{ fontFamily: SC.fontMono, fontSize: 12.5, fontWeight: 600, color: textCol }}>
            {hasPrice ? `${priceCcy}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (price || '—')}
          </div>
          <div style={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}><DeltaPill value={change} size="sm" mode="ghost"/></div>
        </div>
        <div style={{ width: 72, textAlign: 'right', fontFamily: SC.fontMono, fontSize: 13, fontWeight: 700, color: textCol }}>
          {tv != null ? `${priceCcy}${tv.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
      borderBottom: last ? 'none' : `1px solid ${border}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <TickerLogo symbol={symbol} size={40}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 15, color: textCol, letterSpacing: '-0.2px' }}>
          {symbol}
          {badge && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'rgba(12,71,183,0.15)', color: '#0C47B7', padding: '2px 5px', borderRadius: 4, flexShrink: 0 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12, color: subCol, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
      </div>
      {sparkData && <div style={{ marginRight: 4 }}><Sparkline data={sparkData} width={56} height={20}/></div>}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, color: textCol, letterSpacing: '-0.2px' }}>
          {typeof price === 'number' ? `${priceCcy}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : price}
        </div>
        {qty != null && qty > 0 && typeof price === 'number' && price > 0 && (
          <div style={{ fontFamily: SC.fontMono, fontSize: 11, color: subCol, marginTop: 1 }}>
            {qty % 1 === 0 ? qty : qty < 0.01 ? qty.toFixed(6) : qty < 1 ? qty.toFixed(4) : qty.toFixed(2)} × {priceCcy}{(qty * price).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        )}
        <div style={{ marginTop: 3 }}><DeltaPill value={change} size="sm" mode="ghost"/></div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pill button — primary / dark / outline / soft
// ──────────────────────────────────────────────────────────────
function Pill({ children, variant = 'primary', size = 'md', arrow = false, full = false, onClick, style = {}, icon }) {
  const sizes = { sm: { h: 36, px: 14, fs: 13 }, md: { h: 48, px: 22, fs: 15 }, lg: { h: 56, px: 28, fs: 17 } };
  const s = sizes[size];
  const variants = {
    primary: { bg: SC.green, color: '#fff' },
    dark:    { bg: SC.ink1000, color: '#fff' },
    outline: { bg: 'transparent', color: SC.ink1000, border: `1.5px solid ${SC.ink1000}` },
    outlineLight: { bg: 'transparent', color: '#fff', border: `1.5px solid rgba(255,255,255,0.3)` },
    soft:    { bg: SC.ink100, color: SC.ink1000 },
    softDark: { bg: 'rgba(255,255,255,0.08)', color: '#fff' },
    ghost:   { bg: 'transparent', color: SC.ink1000 },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600,
      fontFamily: SC.fontDisplay, borderRadius: 999, cursor: 'pointer',
      letterSpacing: '-0.2px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: icon ? 8 : 6,
      width: full ? '100%' : 'auto', border: v.border || 'none',
      transition: 'all 140ms cubic-bezier(.22,1,.36,1)',
      background: v.bg, color: v.color, ...style,
    }}>
      {icon && <Icon name={icon} size={s.fs + 2} color="currentColor"/>}
      {children}
      {arrow && <span style={{ fontWeight: 500, fontSize: s.fs + 1 }}>→</span>}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────
// Zaman S logo glyph — matches design system /assets/logo-s.svg
// ──────────────────────────────────────────────────────────────
function SentiLogo({ size = 32, color = SC.green, fg = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ display: 'block', flex: '0 0 auto' }}>
      <rect width="120" height="120" rx="28" fill={color}/>
      <path d="M 84 30 C 84 14 36 14 36 36 C 36 58 84 62 84 84 C 84 106 36 106 36 90"
        fill="none" stroke={fg} strokeWidth="20" strokeLinecap="round"/>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Zaman horizontal wordmark — S tile + "Zaman" — design system lockup
// ──────────────────────────────────────────────────────────────
function SentiWordmark({ height = 28, color = SC.green, textColor }) {
  const NAME = 'Zaman';
  const vbW = 120 + NAME.length * 40 + 20;
  const width = height * vbW / 100;
  const tc = textColor || SC.ink1000;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${vbW} 100`} fill="none" style={{ display: 'block' }}>
      <rect width="100" height="100" rx="24" fill={color}/>
      <text x="50" y="74" textAnchor="middle" fontFamily="'Manrope','Helvetica Neue',sans-serif" fontSize="60" fontWeight="800" fill="#fff">Z</text>
      <text x="120" y="70" fontFamily="'Manrope','Helvetica Neue',sans-serif" fontSize="60" fontWeight="700" letterSpacing="-1.5" fill={tc}>{NAME}</text>
    </svg>
  );
}

Object.assign(window, {
  SC, TR, t, fmtKGS, fmtUSD, MoneyKGS, Icon, Sparkline, BigChart, CandleChart, PriceChart,
  DeltaPill, TickerLogo, AllocationStrip, AssetRow, Pill, SentiLogo, SentiWordmark,
});
