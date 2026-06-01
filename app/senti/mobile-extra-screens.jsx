// Mobile prototype screens — markets, trade, asset detail, profile.
// Reuses brokerage-atoms + mobile-variations data (PORTFOLIO).

// ─────────────────────────────────────────────────────────────
// Shared Bybit history display helpers (used in Assets + History views)
// ─────────────────────────────────────────────────────────────
const BH_MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BH_MONTHS_RU = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
function bhFmtDate(ts, lang) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2,'0'), m = String(d.getMinutes()).padStart(2,'0');
  return `${d.getDate()} ${(lang==='ru' ? BH_MONTHS_RU : BH_MONTHS_EN)[d.getMonth()]} · ${h}:${m}`;
}
function bhSym(sym) { return (sym||'').replace(/USDT$/,'').replace(/USD$/,'') || sym; }
function bhSideColor(side, dark) {
  return side === 'Buy' ? (dark ? '#0C47B7' : SC.greenDeep) : '#EF4444';
}
function bhStatusColor(st, rt, dark) {
  if (rt === 'open_order') return '#F7A600';
  if (st === 'Filled' || st === 'Success' || st === 'success') return dark ? '#0C47B7' : SC.greenDeep;
  if (st === 'Cancelled' || st === 'Rejected' || st === 'Failed') return '#EF4444';
  return dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
}
function bhStatusLabel(st, rt, lang) {
  if (rt === 'open_order') return lang==='ru' ? 'Активен' : 'Active';
  if (lang === 'en') return st || '';
  return ({Filled:'Исполнено',Cancelled:'Отменено',PartiallyFilled:'Частично',New:'Новый',Rejected:'Отклонено',Success:'Зачислено',Failed:'Ошибка'})[st] || st || '';
}
function bhQtyPrice(r) {
  const sym = bhSym(r.symbol);
  if (r.recordType === 'open_order') {
    const qty = parseFloat(r.leavesQty || r.qty || 0);
    const qtyStr = qty > 0 ? `${qty.toLocaleString('en-US',{maximumFractionDigits:6})} ${sym}` : '';
    const priceStr = r.price && parseFloat(r.price) > 0
      ? `@ $${parseFloat(r.price).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
      : r.orderType || '';
    return [qtyStr, priceStr].filter(Boolean).join(' · ');
  }
  const qty = parseFloat(r.cumExecQty || 0);
  const qtyStr = qty > 0 ? `${qty.toLocaleString('en-US',{maximumFractionDigits:6})} ${sym}` : '';
  const avgStr = r.avgPrice && parseFloat(r.avgPrice) > 0
    ? `@ $${parseFloat(r.avgPrice).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
    : '';
  return [qtyStr, avgStr].filter(Boolean).join(' · ');
}
function bhTotal(r) {
  if (r.recordType === 'open_order') {
    const v = r.price && r.leavesQty
      ? parseFloat(r.price) * parseFloat(r.leavesQty)
      : parseFloat(r.value || 0);
    return v > 0 ? `~$${v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—';
  }
  const v = parseFloat(r.cumExecValue || r.value || 0);
  return v > 0 ? `$${v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—';
}

// ─────────────────────────────────────────────────────────────
// Markets screen — browse by class with search + price list
// ─────────────────────────────────────────────────────────────
const MARKETS_ALL = [
  // CFD
  { symbol: 'AAPL',  name: 'Apple Inc.',  cls: 'cfd',    ccy: '$', price:  189.45,  change:  0.8, spark: [187,188,189,188,189,189,189.45] },
  { symbol: 'TSLA',  name: 'Tesla',       cls: 'cfd',    ccy: '$', price:  245.20,  change: -1.2, spark: [248,247,249,246,245,245,245.2] },
  { symbol: 'NVDA',  name: 'Nvidia',      cls: 'cfd',    ccy: '$', price:  498.12,  change:  2.3, spark: [490,494,491,495,493,497,498] },
  { symbol: 'GOOGL', name: 'Alphabet',    cls: 'cfd',    ccy: '$', price:  174.55,  change:  0.6, spark: [172,173,174,173,174,174,174.55] },
  // Crypto
  { symbol: 'BTC',   name: 'Bitcoin',     cls: 'crypto', ccy: '$', price: 69420.10, change:  0.4, spark: [69100,69300,69200,69500,69300,69400,69420] },
  { symbol: 'ETH',   name: 'Ethereum',    cls: 'crypto', ccy: '$', price:  3520.55, change: -0.8, spark: [3580,3550,3570,3540,3530,3525,3520] },
  { symbol: 'USDT',  name: 'Tether',      cls: 'crypto', ccy: '$', price:     1.00, change:  0.0, spark: [1,1,1,1,1,1,1] },
  // KG (Кыргызская фондовая биржа)
  { symbol: 'KCEL',  name: 'Кыргызтелеком',   cls: 'kg', ccy: 'с', price:   248.00, change:  1.2, spark: [244,245,246,246,247,247.5,248] },
  { symbol: 'BKAI',  name: 'Банк Кыргызстана', cls: 'kg', ccy: 'с', price:  1420.00, change: -0.4, spark: [1430,1425,1424,1422,1420,1420,1420] },
  { symbol: 'KICB',  name: 'KICB',             cls: 'kg', ccy: 'с', price:    76.00, change:  2.1, spark: [73,74,74.5,75,75.5,76,76] },
  { symbol: 'AKMB',  name: 'Айыл Банк',        cls: 'kg', ccy: 'с', price:   852.00, change:  0.3, spark: [848,849,850,851,851,852,852] },
  { symbol: 'OPTB',  name: 'Оптима Банк',      cls: 'kg', ccy: 'с', price:   418.00, change: -0.8, spark: [422,421,420,419,418,418,418] },
  { symbol: 'RSKS',  name: 'РСК Банк',         cls: 'kg', ccy: 'с', price:  1148.00, change:  0.5, spark: [1140,1142,1144,1145,1146,1147,1148] },
  { symbol: 'ELST',  name: 'Электрические станции', cls: 'kg', ccy: 'с', price:  94.00, change: -0.2, spark: [95,94.5,94.5,94,94,94,94] },
  { symbol: 'BKKY',  name: 'Бакай Банк',       cls: 'kg', ccy: 'с', price:   376.00, change:  1.5, spark: [370,371,372,374,374,375,376] },
  // Cash / Currency (Валюта) — KGS exchange rates (live via useKgsRates, static as fallback)
  { symbol: 'USDT',  name: 'USDT / KGS',  cls: 'forex',  ccy: 'с', price:    88.30, change: 0, spark: [88.2,88.2,88.25,88.3,88.3,88.3,88.3] },
  { symbol: 'USD',   name: 'USD / KGS',   cls: 'forex',  ccy: 'с', price:    88.95, change: 0, spark: [89.1,89.05,89.0,88.98,88.96,88.95,88.95] },
  { symbol: 'EUR',   name: 'EUR / KGS',   cls: 'forex',  ccy: 'с', price:    95.20, change: 0, spark: [94.7,94.9,95.0,95.1,95.0,95.15,95.2] },
  { symbol: 'RUB',   name: 'RUB / KGS',   cls: 'forex',  ccy: 'с', price:     0.92, change: 0, spark: [0.91,0.91,0.92,0.92,0.92,0.92,0.92] },
  { symbol: 'CNY',   name: 'CNY / KGS',   cls: 'forex',  ccy: 'с', price:    12.87, change: 0, spark: [12.8,12.82,12.84,12.85,12.86,12.87,12.87] },
  { symbol: 'KZT',   name: 'KZT / KGS',   cls: 'forex',  ccy: 'с', price:     0.185, change: 0, spark: [0.184,0.184,0.185,0.185,0.185,0.185,0.185] },
  // Fx (global pairs)
  { symbol: 'EUR',   name: 'EUR / USD',   cls: 'fx',     ccy: '$', price:     1.0825, change:  0.4, spark: [1.078,1.079,1.081,1.080,1.082,1.083,1.0825] },
  { symbol: 'GBP',   name: 'GBP / USD',   cls: 'fx',     ccy: '$', price:     1.2640, change: -0.2, spark: [1.267,1.266,1.265,1.264,1.263,1.264,1.264] },
  { symbol: 'JPY',   name: 'USD / JPY',   cls: 'fx',     ccy: '¥', price:   156.80, change:  0.6, spark: [155.9,156.1,156.3,156.4,156.7,156.9,156.8] },
  // Commodities (Товары)
  { symbol: 'GOLD',  name: 'Gold',        cls: 'comm',   ccy: '$', price:  2348.40, change:  0.5, spark: [2335,2338,2342,2340,2345,2349,2348] },
  { symbol: 'SILV',  name: 'Silver',      cls: 'comm',   ccy: '$', price:    29.84, change:  1.8, spark: [29.3,29.4,29.6,29.5,29.7,29.9,29.84] },
  { symbol: 'OIL',   name: 'Brent oil',   cls: 'comm',   ccy: '$', price:    83.20, change: -0.7, spark: [83.8,83.6,83.4,83.3,83.2,83.1,83.2] },
  { symbol: 'COPP',  name: 'Copper',      cls: 'comm',   ccy: '$', price:     4.62, change:  0.3, spark: [4.59,4.60,4.61,4.62,4.61,4.62,4.62] },
];

// Mobile live assets — crypto from Bybit spot, CFD/comm from Binance TradFi futures
const MOB_LIVE = {
  crypto: [
    { symbol: 'BTC',  name: 'Bitcoin',   bybit: 'BTCUSDT',  ccy: '$', cls: 'crypto' },
    { symbol: 'ETH',  name: 'Ethereum',  bybit: 'ETHUSDT',  ccy: '$', cls: 'crypto' },
    { symbol: 'BNB',  name: 'BNB',       bybit: 'BNBUSDT',  ccy: '$', cls: 'crypto' },
    { symbol: 'SOL',  name: 'Solana',    bybit: 'SOLUSDT',  ccy: '$', cls: 'crypto' },
    { symbol: 'XRP',  name: 'XRP',       bybit: 'XRPUSDT',  ccy: '$', cls: 'crypto' },
    { symbol: 'ADA',  name: 'Cardano',   bybit: 'ADAUSDT',  ccy: '$', cls: 'crypto' },
    { symbol: 'DOGE', name: 'Dogecoin',  bybit: 'DOGEUSDT', ccy: '$', cls: 'crypto' },
  ],
  cfd: [
    { symbol: 'AAPL',  name: 'Apple Inc.',  binance: 'AAPLUSDT',  ccy: '$', cls: 'cfd' },
    { symbol: 'NVDA',  name: 'Nvidia',      binance: 'NVDAUSDT',  ccy: '$', cls: 'cfd' },
    { symbol: 'TSLA',  name: 'Tesla',       binance: 'TSLAUSDT',  ccy: '$', cls: 'cfd' },
    { symbol: 'GOOGL', name: 'Alphabet',    binance: 'GOOGLUSDT', ccy: '$', cls: 'cfd' },
    { symbol: 'AMZN',  name: 'Amazon',      binance: 'AMZNUSDT',  ccy: '$', cls: 'cfd' },
    { symbol: 'META',  name: 'Meta',        binance: 'METAUSDT',  ccy: '$', cls: 'cfd' },
    { symbol: 'MSFT',  name: 'Microsoft',   binance: 'MSFTUSDT',  ccy: '$', cls: 'cfd' },
    { symbol: 'JPM',   name: 'JPMorgan',    binance: 'JPMUSDT',   ccy: '$', cls: 'cfd' },
    { symbol: 'AMD',   name: 'AMD',         binance: 'AMDUSDT',   ccy: '$', cls: 'cfd' },
  ],
  comm: [
    { symbol: 'XAU',    name: 'Gold',        binance: 'XAUUSDT',    ccy: '$', cls: 'comm' },
    { symbol: 'XAG',    name: 'Silver',      binance: 'XAGUSDT',    ccy: '$', cls: 'comm' },
    { symbol: 'XPT',    name: 'Platinum',    binance: 'XPTUSDT',    ccy: '$', cls: 'comm' },
    { symbol: 'XPD',    name: 'Palladium',   binance: 'XPDUSDT',    ccy: '$', cls: 'comm' },
    { symbol: 'COPPER', name: 'Copper',      binance: 'COPPERUSDT', ccy: '$', cls: 'comm' },
    { symbol: 'WTI',    name: 'WTI Crude',   binance: 'CLUSDT',     ccy: '$', cls: 'comm' },
    { symbol: 'BRENT',  name: 'Brent Crude', binance: 'BZUSDT',     ccy: '$', cls: 'comm' },
    { symbol: 'NATGAS', name: 'Natural Gas', binance: 'NATGASUSDT', ccy: '$', cls: 'comm' },
  ],
};

function MobileLiveRow({ asset, price, change, dark, border, sub, text, onAsset }) {
  const fmtPrice = p => p > 1000
    ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p >= 1
    ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : p.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  const spark = change != null && change >= 0
    ? [100,101,100,102,101,103,102,104]
    : [104,103,102,101,102,100,101,99];
  const h = { ...asset, price: price || 0, change: change || 0, spark };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: border, cursor: 'pointer' }}
      onClick={() => onAsset && onAsset(h)}>
      <TickerLogo symbol={asset.symbol} size={40}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px', color: text }}>{asset.symbol}</div>
        <div style={{ fontSize: 12, color: sub }}>{asset.name}</div>
      </div>
      <Sparkline data={spark} width={52} height={22} color={change >= 0 ? SC.green : '#EF4444'}/>
      <div style={{ textAlign: 'right', minWidth: 84 }}>
        <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, color: text }}>
          {price != null ? `$${fmtPrice(price)}` : <span style={{ color: sub }}>…</span>}
        </div>
        <div style={{ marginTop: 2 }}>
          {change != null ? <DeltaPill value={change} size="sm"/> : null}
        </div>
      </div>
    </div>
  );
}

function MarketsScreen({ lang = 'ru', onAsset, dark = false }) {
  const [cls, setCls] = React.useState('forex');

  // Bybit: crypto spot
  const bybitSpotSymbols = MOB_LIVE.crypto.map(a => a.bybit);
  const { prices: spotPrices, loading: spotLoading, error: spotError } =
    typeof useBybitPrices === 'function' ? useBybitPrices(bybitSpotSymbols) : { prices: {}, loading: false, error: null };

  // Binance: CFD + commodities (TradFi futures)
  const binanceFutSymbols = [...MOB_LIVE.cfd, ...MOB_LIVE.comm].map(a => a.binance);
  const { prices: binanceFutPrices, loading: binanceFutLoading, error: binanceFutError } =
    typeof useBinanceFutures === 'function' ? useBinanceFutures(binanceFutSymbols) : { prices: {}, loading: false, error: null };

  // KGS rates — once per day
  const { rates: kgsRates, loading: kgsLoading, error: kgsError } =
    typeof useKgsRates === 'function' ? useKgsRates() : { rates: {}, loading: false, error: null };

  const LIVE_TABS = ['crypto', 'cfd', 'comm', 'forex'];
  const isLiveTab   = LIVE_TABS.includes(cls);
  const liveLoading = cls === 'crypto' ? spotLoading : cls === 'forex' ? kgsLoading : binanceFutLoading;
  const liveError   = cls === 'crypto' ? spotError   : cls === 'forex' ? kgsError   : binanceFutError;

  const tabs = [
    { id: 'forex',  label: 'Cash' },
    { id: 'kg',     label: 'KG' },
    { id: 'cfd',    label: 'World' },
    { id: 'comm',   label: 'CFD' },
    { id: 'crypto', label: 'Crypto' },
  ];
  const filtered = MARKETS_ALL.filter(m => m.cls === cls);
  const bg = dark ? SC.ink1000 : SC.paper;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', color: text, overflow: 'hidden' }}>
      <div style={{ padding: '64px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', fontFamily: SC.fontDisplay }}>{t(lang, 'markets')}</h1>
        {isLiveTab && (
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: SC.fontMono,
            color: liveError ? '#EF4444' : liveLoading ? sub : SC.green }}>
            {liveLoading ? '…' : liveError ? 'offline' : '● live'}
          </span>
        )}
      </div>
      {/* Search */}
      <div style={{ padding: '4px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: fieldBg, borderRadius: 14, padding: '10px 14px' }}>
          <Icon name="search" size={16} color={sub}/>
          <span style={{ flex: 1, fontSize: 13, color: sub, fontFamily: SC.fontDisplay }}>
            {lang === 'ru' ? 'Найти AAPL, BTC, XAU…' : 'Search AAPL, BTC, XAU…'}
          </span>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ padding: '0 20px 8px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {tabs.map(tg => (
          <button key={tg.id} onClick={() => setCls(tg.id)} style={{
            background: cls === tg.id ? (dark ? '#fff' : SC.ink1000) : (dark ? 'rgba(255,255,255,0.06)' : SC.ink100),
            color: cls === tg.id ? (dark ? SC.ink1000 : '#fff') : (dark ? 'rgba(255,255,255,0.6)' : SC.ink500),
            border: 'none', cursor: 'pointer',
            padding: '7px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, letterSpacing: '-0.2px',
            fontFamily: SC.fontDisplay, whiteSpace: 'nowrap',
          }}>{tg.label}</button>
        ))}
      </div>
      {/* List */}
      <div style={{ flex: 1, padding: '4px 20px 96px', overflowY: 'auto' }}>
        {/* Crypto — Bybit spot */}
        {cls === 'crypto' && MOB_LIVE.crypto.map((asset, i, arr) => {
          const live = spotPrices[asset.bybit] || {};
          return <MobileLiveRow key={asset.symbol} asset={asset} price={live.price} change={live.change}
            dark={dark} sub={sub} text={text} onAsset={onAsset}
            border={i === arr.length - 1 ? 'none' : border}/>;
        })}
        {/* CFD stocks — Binance TradFi futures */}
        {cls === 'cfd' && MOB_LIVE.cfd.map((asset, i, arr) => {
          const live = binanceFutPrices[asset.binance] || {};
          return <MobileLiveRow key={asset.symbol} asset={asset} price={live.price} change={live.change}
            dark={dark} sub={sub} text={text} onAsset={onAsset}
            border={i === arr.length - 1 ? 'none' : border}/>;
        })}
        {/* Commodities — Binance TradFi futures */}
        {cls === 'comm' && MOB_LIVE.comm.map((asset, i, arr) => {
          const live = binanceFutPrices[asset.binance] || {};
          return <MobileLiveRow key={asset.symbol} asset={asset} price={live.price} change={live.change}
            dark={dark} sub={sub} text={text} onAsset={onAsset}
            border={i === arr.length - 1 ? 'none' : border}/>;
        })}

        {/* Forex (Валюта) — KGS rates, daily refresh */}
        {cls === 'forex' && MARKETS_ALL.filter(m => m.cls === 'forex').map((h, i, arr) => {
          const livePrice = kgsRates[h.symbol];
          const display = { ...h, price: livePrice != null ? livePrice : h.price };
          return <AssetRow key={h.symbol + i} {...display} sparkData={h.spark} priceCcy={h.ccy} dark={dark}
            onClick={() => onAsset && onAsset(display)} last={i === arr.length - 1}/>;
        })}

        {/* KG stocks — static (КФБ) */}
        {cls === 'kg' && MARKETS_ALL.filter(m => m.cls === 'kg').map((h, i, arr) => (
          <AssetRow key={h.symbol + i} {...h} sparkData={h.spark} priceCcy={h.ccy} dark={dark}
            onClick={() => onAsset && onAsset(h)} last={i === arr.length - 1}/>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Asset detail screen — chart + Buy/Sell
// ─────────────────────────────────────────────────────────────
// Period → { interval, limit } for klines
const KLINE_PERIODS = {
  '1H':  { interval: '1m',  limit: 60 },
  '1D':  { interval: '1h',  limit: 24 },
  '7D':  { interval: '4h',  limit: 42 },
  '1M':  { interval: '1d',  limit: 30 },
  '3M':  { interval: '1d',  limit: 90 },
  '1Y':  { interval: '1w',  limit: 52 },
};
const PERIOD_LABELS_RU = { '1H': '1Ч', '1D': '1Д', '7D': '7Д', '1M': '1М', '3M': '3М', '1Y': '1Г' };
const PERIOD_LABELS_EN = { '1H': '1H', '1D': '1D', '7D': '7D', '1M': '1M', '3M': '3M', '1Y': '1Y' };

function AssetDetailScreen({ asset, lang = 'ru', onBack, onTrade, dark = false }) {
  const [period, setPeriod] = React.useState('1D');
  const bg = dark ? SC.ink1000 : SC.paper;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;

  // Live klines — crypto: Bybit spot; cfd/comm: Binance futures
  const COMM_SYM_MAP_M = { XAU: 'XAUUSDT', XAG: 'XAGUSDT', XPT: 'XPTUSDT', XPD: 'XPDUSDT',
    COPPER: 'COPPERUSDT', WTI: 'CLUSDT', BRENT: 'BZUSDT', NATGAS: 'NATGASUSDT' };
  const canLive = asset.cls === 'crypto' || asset.cls === 'cfd' || asset.cls === 'comm';
  const rawSym = asset.symbol.toUpperCase();
  const klSym = canLive
    ? (asset.cls === 'comm' ? (COMM_SYM_MAP_M[rawSym] || rawSym + 'USDT') : rawSym + 'USDT')
    : null;
  const klSrc = asset.cls === 'crypto' ? 'bybit_spot' : 'binance_futures';
  const { interval, limit } = KLINE_PERIODS[period];
  const { klines, loading } = typeof useKlines === 'function'
    ? useKlines(klSym, interval, limit, klSrc)
    : { klines: [], loading: false };

  // Period change %
  const periodChange = klines.length >= 2
    ? ((klines[klines.length - 1].c - klines[0].c) / klines[0].c * 100)
    : asset.change;
  const up = periodChange >= 0;

  const periods = Object.keys(KLINE_PERIODS);
  const pLabels = lang === 'ru' ? PERIOD_LABELS_RU : PERIOD_LABELS_EN;

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', color: text, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '54px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 999, background: fieldBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={18} color={text}/>
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <TickerLogo symbol={asset.symbol} size={32}/>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px' }}>{asset.symbol}</div>
            <div style={{ fontSize: 11, color: sub }}>{asset.name}</div>
          </div>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 999, background: fieldBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="star" size={18} color={text}/>
        </button>
      </div>
      {/* Price */}
      <div style={{ padding: '8px 20px 8px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontFamily: SC.fontMono, fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em' }}>
          {asset.ccy}{asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <DeltaPill value={periodChange} size="md"/>
      </div>
      {/* Chart */}
      <div>
        {/* Period tabs — above chart */}
        <div style={{ padding: '4px 20px 6px', display: 'flex', gap: 2 }}>
          {periods.map(p => (
            <span key={p} onClick={() => setPeriod(p)} style={{
              padding: '5px 10px', borderRadius: 999,
              background: period === p ? (dark ? '#fff' : SC.ink1000) : 'transparent',
              color: period === p ? (dark ? SC.ink1000 : '#fff') : sub,
              fontSize: 11, fontWeight: 600, fontFamily: SC.fontMono, cursor: 'pointer',
            }}>{pLabels[p]}</span>
          ))}
        </div>
        {/* Candle chart with side padding matching screen elements */}
        <div style={{ padding: '0 20px' }}>
          <CandleChart
            data={klines}
            loading={loading}
            height={190}
            dark={dark}
            interval={interval}
            noDataLabel={canLive ? (lang === 'ru' ? 'Загрузка…' : 'Loading…') : (lang === 'ru' ? 'График недоступен' : 'No chart data')}
          />
        </div>
      </div>
      {/* Stats grid — live from klines */}
      {(() => {
        const hi = klines.length ? Math.max(...klines.map(k => k.h)) : null;
        const lo = klines.length ? Math.min(...klines.map(k => k.l)) : null;
        const vol = klines.length ? klines.reduce((s, k) => s + k.v, 0) : null;
        const fmtV = v => v == null ? '—' : v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`;
        const fmtP = v => v == null ? '—' : v >= 10000 ? v.toLocaleString('en-US',{maximumFractionDigits:0}) : v >= 1 ? v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) : v.toPrecision(4);
        const volUsd = vol != null ? vol * (asset.price || 0) : null;
        const periodLabel = pLabels[period] || period;
        const stats = [
          [lang === 'ru' ? `Макс. ${periodLabel}` : `${periodLabel} high`,  hi != null ? `${asset.ccy}${fmtP(hi)}` : '—'],
          [lang === 'ru' ? `Мин. ${periodLabel}`  : `${periodLabel} low`,   lo != null ? `${asset.ccy}${fmtP(lo)}` : '—'],
          [lang === 'ru' ? `Объём ${periodLabel}` : `${periodLabel} vol.`,  fmtV(volUsd)],
          [lang === 'ru' ? 'Изменение'            : 'Change',               klines.length >= 2 ? `${periodChange >= 0 ? '+' : ''}${periodChange.toFixed(2)}%` : '—'],
        ];
        return (
          <div style={{ padding: '8px 20px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 16, borderRadius: 18, background: fieldBg }}>
              {stats.map(([k, v], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: sub, fontWeight: 500, letterSpacing: '-0.1px', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      {/* Educational nudge — newbie audience */}
      <div style={{ padding: '0 20px 0' }}>
        <div style={{
          padding: '12px 14px', borderRadius: 14,
          background: dark ? 'rgba(12,71,183,0.10)' : SC.greenWash,
          border: dark ? 'none' : `1px solid ${SC.greenSoft}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="info" size={18} color={dark ? SC.greenBright : SC.greenDeep}/>
          <div style={{ flex: 1, fontSize: 12, color: dark ? SC.greenBright : SC.greenDeep, lineHeight: 1.4 }}>
            {asset.cls === 'cfd'
              ? (lang === 'ru' ? 'Это CFD. Вы зарабатываете на разнице цен, не владея акцией.' : 'This is a CFD. You profit from price moves without owning the stock.')
              : asset.cls === 'crypto'
              ? (lang === 'ru' ? 'Крипто волатильно. Начинайте с малой суммы.' : 'Crypto is volatile. Start with a small amount.')
              : (lang === 'ru' ? 'Биржа KG. Торги Пн–Пт 10:00–17:00.' : 'KG exchange. Trading Mon–Fri 10:00–17:00.')}
          </div>
          <Icon name="chevR" size={16} color={dark ? SC.greenBright : SC.greenDeep}/>
        </div>
      </div>
      {/* Bottom action bar */}
      <div style={{ flex: 1 }}/>
      <div style={{
        padding: '14px 20px 38px',
        background: bg,
        borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`,
        display: 'flex', gap: 10,
      }}>
        <Pill variant={dark ? 'softDark' : 'soft'} size="lg" full onClick={() => onTrade('sell', asset)}>
          {t(lang, 'sell')}
        </Pill>
        <Pill variant="primary" size="lg" arrow full onClick={() => onTrade('buy', asset)}>
          {t(lang, 'buy')}
        </Pill>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Trade modal (bottom sheet) — buy / sell with numpad
// ─────────────────────────────────────────────────────────────
const TRADE_MIN_USD = 1;

function TradeSheet({ side: initialSide, asset, lang = 'ru', onClose, onSubmit, dark = false, inline = false }) {
  const [side,      setSide]      = React.useState(initialSide || 'buy');
  const [orderType,  setOrderType]  = React.useState('market'); // 'market' | 'limit'
  const [inputMode,  setInputMode]  = React.useState('usdt');   // 'usdt' | 'qty'
  const [amount,     setAmount]     = React.useState('');        // value in selected inputMode
  const [limitPrice, setLimitPrice] = React.useState('');       // for limit orders
  const [submitting, setSubmitting] = React.useState(false);
  const [result,    setResult]    = React.useState(null);      // { ok, orderId, error }

  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const text    = dark ? '#fff' : SC.ink1000;
  const cardBg  = dark ? SC.ink900 : SC.paper;
  const keyBg   = dark ? 'rgba(255,255,255,0.06)' : SC.ink50;
  const sepColor= dark ? 'rgba(255,255,255,0.06)' : SC.ink100;
  const isBuy   = side === 'buy';
  const accentColor = isBuy ? SC.green : '#EF4444';

  // Live price: prefer live from bybit if available
  const bybitSym = (typeof BYBIT_SYMBOL_MAP !== 'undefined' && BYBIT_SYMBOL_MAP[asset.symbol]) || (asset.symbol + 'USDT');
  const { prices: livePrices } = typeof useBybitPrices === 'function' ? useBybitPrices([bybitSym]) : { prices: {} };
  const livePrice = parseFloat(livePrices?.[bybitSym]?.lastPrice || asset.price || 0);
  const displayPrice = livePrice > 0 ? livePrice : (asset.price || 0);

  // Account balances
  const { balances } = typeof useBybitAccount === 'function' ? useBybitAccount() : { balances: [] };
  const usdtBal = React.useMemo(() => {
    const b = balances.find(b => b.asset === 'USDT');
    return b ? parseFloat(b.free || 0) : 0;
  }, [balances]);
  const assetBal = React.useMemo(() => {
    const b = balances.find(b => b.asset === asset.symbol);
    return b ? parseFloat(b.walletBalance || b.free || 0) : 0;
  }, [balances, asset.symbol]);

  const effectivePrice = orderType === 'limit' && parseFloat(limitPrice) > 0 ? parseFloat(limitPrice) : displayPrice;
  const numericInput   = parseFloat(amount) || 0;
  // derive USD amount and qty depending on input mode
  const numericAmount  = inputMode === 'usdt' ? numericInput : numericInput * effectivePrice;
  const qty            = inputMode === 'usdt'
    ? (effectivePrice > 0 ? numericAmount / effectivePrice : 0)
    : numericInput;
  const maxBuy         = usdtBal;
  const maxSell        = assetBal * effectivePrice;

  const canSubmit = numericAmount >= TRADE_MIN_USD && (isBuy ? numericAmount <= maxBuy : numericAmount <= maxSell);
  const overBalance = numericAmount > 0 && (isBuy ? numericAmount > maxBuy : numericAmount > maxSell);

  const onKey = (k) => {
    if (result) return;
    if (k === 'back') setAmount(a => a.slice(0, -1));
    else if (k === '.') { if (!amount.includes('.')) setAmount(a => (a || '0') + '.'); }
    else setAmount(a => (a + k).slice(0, 12));
  };

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      // qty in base asset — floor to avoid exceeding actual balance
      const decimals = qty < 0.001 ? 6 : qty < 1 ? 5 : 4;
      const factor = Math.pow(10, decimals);
      const qtyFloored = Math.floor(qty * factor) / factor;
      // for sell: cap at actual asset balance to prevent "insufficient balance" error
      const qtyCapped = !isBuy ? Math.min(qtyFloored, assetBal) : qtyFloored;
      const qtyStr = qtyCapped.toFixed(decimals);
      const body = {
        symbol: bybitSym,
        side,
        orderType,
        qty: qtyStr,
        category: asset.cls === 'cfd' || asset.cls === 'comm' ? 'linear' : 'spot',
      };
      if (orderType === 'limit' && limitPrice) body.price = limitPrice;
      const r = await fetch(`${BYBIT_WORKER}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      setResult(d.ok ? { ok: true, orderId: d.orderId } : { ok: false, error: d.error });
      if (d.ok && onSubmit) onSubmit(side, asset, numericAmount); // numericAmount always in USD
    } catch(e) {
      setResult({ ok: false, error: e.message });
    }
    setSubmitting(false);
  }

  const numpad = ['1','2','3','4','5','6','7','8','9','.','0','back'];

  const sheet = (
    <div style={{
      background: cardBg, color: text,
      borderTopLeftRadius: inline ? 28 : 36, borderTopRightRadius: inline ? 28 : 36,
      borderBottomLeftRadius: inline ? 28 : 0, borderBottomRightRadius: inline ? 28 : 0,
      padding: '12px 20px 30px',
      display: 'flex', flexDirection: 'column', gap: 0,
      boxShadow: inline ? 'none' : '0 -8px 30px rgba(0,0,0,0.18)',
      maxHeight: inline ? 'none' : '92vh', overflow: 'hidden',
    }}>
      {/* grabber */}
      {!inline && <div style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.2)' : SC.ink200, marginBottom: 10 }}/>}

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <TickerLogo symbol={asset.symbol} size={34}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>{asset.symbol}/{asset.cls === 'cfd' || asset.cls === 'comm' ? 'USDT' : 'USDT'}</div>
          <div style={{ fontSize: 12, color: sub, marginTop: 1 }}>{asset.name}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, background: keyBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="minus" size={16} color={text}/>
        </button>
      </div>

      {/* buy / sell toggle */}
      <div style={{ display: 'flex', background: keyBg, borderRadius: 12, padding: 3, gap: 3, marginBottom: 14 }}>
        {['buy','sell'].map(s => (
          <button key={s} onClick={() => { setSide(s); setAmount(''); setResult(null); setInputMode('usdt'); }} style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: side === s ? accentColor : 'transparent',
            color: side === s ? '#fff' : sub,
            fontSize: 13, fontWeight: 700, fontFamily: SC.fontDisplay,
            transition: 'background 0.15s, color 0.15s',
          }}>
            {s === 'buy' ? (lang === 'ru' ? 'Купить' : 'Buy') : (lang === 'ru' ? 'Продать' : 'Sell')}
          </button>
        ))}
      </div>

      {/* price + order type row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: keyBg, borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lang === 'ru' ? 'Цена' : 'Price'}</div>
          <div style={{ fontFamily: SC.fontMono, fontWeight: 700, fontSize: 14, marginTop: 1 }}>
            {displayPrice > 0 ? `$${displayPrice.toLocaleString('en-US', { maximumFractionDigits: displayPrice < 1 ? 5 : 2 })}` : '—'}
          </div>
        </div>
        {/* order type selector */}
        <div style={{ display: 'flex', background: keyBg, borderRadius: 10, padding: 3, gap: 3 }}>
          {['market','limit'].map(ot => (
            <button key={ot} onClick={() => { setOrderType(ot); setLimitPrice(''); }} style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: orderType === ot ? (dark ? 'rgba(255,255,255,0.15)' : '#fff') : 'transparent',
              color: orderType === ot ? text : sub,
              fontSize: 12, fontWeight: 600, fontFamily: SC.fontDisplay,
              boxShadow: orderType === ot ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
              {ot === 'market' ? (lang === 'ru' ? 'Рыночный' : 'Market') : (lang === 'ru' ? 'Лимитный' : 'Limit')}
            </button>
          ))}
        </div>
      </div>

      {/* limit price input */}
      {orderType === 'limit' && (
        <div style={{ background: keyBg, borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{lang === 'ru' ? 'Лимитная цена ($)' : 'Limit price ($)'}</div>
          <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
            placeholder={displayPrice > 0 ? displayPrice.toFixed(2) : '0.00'}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: SC.fontMono, fontSize: 16, fontWeight: 700, color: text, padding: 0 }}
          />
        </div>
      )}

      {/* balances */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: keyBg, borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>USDT</div>
          <div style={{ fontFamily: SC.fontMono, fontWeight: 700, fontSize: 13, marginTop: 1 }}>{usdtBal.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, background: keyBg, borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{asset.symbol}</div>
          <div style={{ fontFamily: SC.fontMono, fontWeight: 700, fontSize: 13, marginTop: 1 }}>{assetBal > 0 ? (assetBal < 0.001 ? assetBal.toFixed(6) : assetBal < 0.01 ? assetBal.toFixed(6) : assetBal < 1 ? assetBal.toFixed(5) : assetBal.toFixed(4)) : '0'}</div>
        </div>
        <div style={{ flex: 1, background: keyBg, borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lang === 'ru' ? 'Макс.' : 'Max'} {isBuy ? lang === 'ru' ? 'покупка' : 'buy' : lang === 'ru' ? 'продажа' : 'sell'}</div>
          <div style={{ fontFamily: SC.fontMono, fontWeight: 700, fontSize: 13, marginTop: 1, color: accentColor }}>
            ${(isBuy ? maxBuy : maxSell).toFixed(2)}
          </div>
        </div>
      </div>

      {/* amount display + mode toggle */}
      <div style={{ borderTop: `1px solid ${sepColor}`, borderBottom: `1px solid ${sepColor}`, marginBottom: 10 }}>
        {/* mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '6px 0 2px' }}>
          {['usdt', 'qty'].map(m => (
            <button key={m} onClick={() => { setInputMode(m); setAmount(''); }} style={{
              padding: '4px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: inputMode === m ? (dark ? 'rgba(255,255,255,0.15)' : SC.ink1000) : 'transparent',
              color: inputMode === m ? (dark ? text : '#fff') : sub,
              fontSize: 11, fontWeight: 700, fontFamily: SC.fontDisplay, letterSpacing: '0.02em',
            }}>
              {m === 'usdt' ? 'USDT' : asset.symbol}
            </button>
          ))}
        </div>
        {/* value */}
        <div style={{ textAlign: 'center', padding: '2px 0 6px' }}>
          <div style={{ fontFamily: SC.fontMono, fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', color: overBalance ? '#EF4444' : text, lineHeight: 1.1 }}>
            {inputMode === 'usdt'
              ? <><span style={{ opacity: 0.4, fontSize: 26, marginRight: 3 }}>$</span>{amount || '0'}</>
              : <>{amount || '0'}<span style={{ opacity: 0.4, fontSize: 22, marginLeft: 6 }}>{asset.symbol}</span></>
            }
          </div>
          <div style={{ fontSize: 11, color: overBalance ? '#EF4444' : sub, fontFamily: SC.fontMono, marginTop: 3 }}>
            {overBalance
              ? (lang === 'ru' ? 'Недостаточно средств' : 'Insufficient balance')
              : inputMode === 'usdt'
                ? (numericAmount > 0
                    ? `≈ ${qty < 0.0001 ? qty.toExponential(4) : qty.toFixed(qty < 1 ? 6 : 4)} ${asset.symbol}`
                    : (lang === 'ru' ? `Мин. $${TRADE_MIN_USD}` : `Min $${TRADE_MIN_USD}`))
                : (numericAmount > 0
                    ? `≈ $${numericAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                    : (lang === 'ru' ? `Введите кол-во` : `Enter quantity`))
            }
          </div>
        </div>
      </div>

      {/* result banner */}
      {result && (
        <div style={{
          margin: '4px 0 8px', padding: '10px 14px', borderRadius: 12,
          background: result.ok ? 'rgba(12,71,183,0.12)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${result.ok ? 'rgba(12,71,183,0.3)' : 'rgba(239,68,68,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name={result.ok ? 'check' : 'info'} size={16} color={result.ok ? SC.green : '#EF4444'} strokeWidth={2.5}/>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: result.ok ? (dark ? SC.greenBright : SC.greenDeep) : '#EF4444', lineHeight: 1.4 }}>
            {result.ok
              ? `${lang === 'ru' ? 'Ордер размещён' : 'Order placed'} · ID ${result.orderId}`
              : result.error}
          </div>
          {result.ok && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: sub, fontFamily: SC.fontDisplay }}>✕</button>}
        </div>
      )}

      {/* numpad */}
      {!result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 10 }}>
          {numpad.map(k => (
            <button key={k} onClick={() => onKey(k)} style={{
              background: 'transparent', color: text, border: 'none', cursor: 'pointer',
              padding: '11px 0', fontFamily: SC.fontMono, fontSize: 22, fontWeight: 500,
              borderRadius: 10,
            }}>
              {k === 'back' ? '⌫' : k}
            </button>
          ))}
        </div>
      )}

      {/* CTA */}
      <button onClick={result?.ok ? onClose : handleSubmit}
        disabled={!result?.ok && (!canSubmit || submitting)}
        style={{
          width: '100%', padding: '14px', borderRadius: 16, border: 'none',
          cursor: (canSubmit && !submitting) || result?.ok ? 'pointer' : 'not-allowed',
          background: result?.ok ? SC.green : canSubmit ? accentColor : (dark ? 'rgba(255,255,255,0.08)' : SC.ink100),
          color: canSubmit || result?.ok ? '#fff' : sub,
          fontSize: 15, fontWeight: 700, fontFamily: SC.fontDisplay, letterSpacing: '-0.2px',
          transition: 'background 0.15s',
        }}>
        {submitting
          ? (lang === 'ru' ? 'Отправка…' : 'Sending…')
          : result?.ok
            ? (lang === 'ru' ? 'Закрыть' : 'Close')
            : `${isBuy ? (lang === 'ru' ? 'Купить' : 'Buy') : (lang === 'ru' ? 'Продать' : 'Sell')} ${canSubmit ? `${qty.toFixed(qty < 1 ? 5 : 4)} ${asset.symbol} · $${numericAmount.toFixed(2)}` : `(мин. $${TRADE_MIN_USD})`}`
        }
      </button>
    </div>
  );

  if (inline) return sheet;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        {sheet}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QuickTradeSheet — asset picker for Быстрая сделка
// Shows only Bybit crypto with live prices, then opens TradeSheet
// ─────────────────────────────────────────────────────────────
function QuickTradeSheet({ lang = 'ru', dark = false, defaultSide = 'buy', onClose, onPick, inline = false }) {
  const bybitSymbols = MOB_LIVE.crypto.map(a => a.bybit);
  const { prices, loading } = typeof useBybitPrices === 'function'
    ? useBybitPrices(bybitSymbols)
    : { prices: {}, loading: false };

  const sub    = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const text   = dark ? '#fff' : SC.ink1000;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const rowBg  = dark ? 'rgba(255,255,255,0.04)' : SC.ink50;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink100}`;

  const content = (
    <div style={{
      background: cardBg, color: text,
      borderTopLeftRadius: inline ? 28 : 36, borderTopRightRadius: inline ? 28 : 36,
      borderBottomLeftRadius: inline ? 28 : 0, borderBottomRightRadius: inline ? 28 : 0,
      padding: '12px 20px 34px',
      boxShadow: inline ? 'none' : '0 -8px 30px rgba(0,0,0,0.18)',
      maxHeight: '85%', display: 'flex', flexDirection: 'column',
    }}>
        {/* grabber */}
        <div style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.2)' : SC.ink200, marginBottom: 16 }}/>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px' }}>
                {lang === 'ru' ? 'Быстрая сделка' : 'Quick Trade'}
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: defaultSide === 'buy' ? SC.green : SC.ink1000,
                color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{defaultSide === 'buy' ? (lang === 'ru' ? 'Покупка' : 'Buy') : (lang === 'ru' ? 'Продажа' : 'Sell')}</span>
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: loading ? sub : SC.green, display: 'inline-block',
                boxShadow: loading ? 'none' : `0 0 5px ${SC.green}`,
                animation: loading ? 'none' : 'binance-pulse 2s ease-in-out infinite' }}/>
              {loading ? (lang === 'ru' ? 'Загрузка…' : 'Loading…') : 'Bybit live'}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="chevD" size={18} color={text}/>
          </button>
        </div>
        {/* crypto list */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOB_LIVE.crypto.map(asset => {
            const live = prices[asset.bybit] || {};
            const price = live.price;
            const change = live.change;
            return (
              <button key={asset.symbol}
                onClick={() => onPick({ ...asset, price: price || asset.price || 0, change: change || 0,
                  spark: change >= 0 ? [100,101,102,101,103,102,104,105] : [105,104,103,102,101,100,101,99] })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 20,
                  background: rowBg, border, cursor: 'pointer', textAlign: 'left', color: text,
                }}>
                <TickerLogo symbol={asset.symbol} size={40}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{asset.symbol}</div>
                  <div style={{ fontSize: 12, color: sub }}>{asset.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600 }}>
                    {price != null
                      ? `$${price > 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`
                      : <span style={{ color: sub }}>…</span>}
                  </div>
                  {change != null && <DeltaPill value={change} size="sm"/>}
                </div>
                <Icon name="chevR" size={14} color={sub}/>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: sub, textAlign: 'center', letterSpacing: '-0.1px' }}>
          {lang === 'ru' ? `Минимальная сумма сделки — $${TRADE_MIN_USD}` : `Minimum trade amount — $${TRADE_MIN_USD}`}
        </div>
      </div>
  );

  if (inline) return content;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        {content}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Trade confirmation toast
// ─────────────────────────────────────────────────────────────
function TradeToast({ message, dark = false }) {
  return (
    <div style={{
      position: 'absolute', left: 20, right: 20, bottom: 110, zIndex: 60,
      padding: '14px 16px', borderRadius: 18,
      background: SC.green, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 12px 30px -8px rgba(12,71,183,0.5)',
      animation: 'toast-in 0.4s cubic-bezier(.22,1,.36,1)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.22)', display: 'grid', placeItems: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
      </div>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px' }}>{message}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Menu screen — main hub for everything beyond the trading flow
// ─────────────────────────────────────────────────────────────
function MenuScreen({ lang = 'ru', dark = false, onProfile = () => {} }) {
  const bg = dark ? SC.ink1000 : SC.paper;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;

  const groups = lang === 'ru' ? [
    {
      title: 'Финансы',
      items: [
        { icon: 'wallet',   label: 'Счета и карты',        meta: '2 счёта' },
        { icon: 'qr',       label: 'Реквизиты для пополнения' },
        { icon: 'layers',   label: 'Налоги и выписки',     meta: '2026' },
      ],
    },
    {
      title: 'Обучение и помощь',
      items: [
        { icon: 'book',     label: 'Обучение',             meta: '5 уроков' },
        { icon: 'sparkles', label: 'Инвестиционные идеи',  meta: 'NEW' },
        { icon: 'info',     label: 'Поддержка' },
      ],
    },
    {
      title: 'Безопасность',
      items: [
        { icon: 'fingerprint', label: 'Вход и пароль' },
        { icon: 'bell',        label: 'Уведомления' },
        { icon: 'settings',    label: 'Настройки' },
      ],
    },
  ] : [
    {
      title: 'Finance',
      items: [
        { icon: 'wallet',   label: 'Accounts & cards',   meta: '2 accounts' },
        { icon: 'qr',       label: 'Top-up details' },
        { icon: 'layers',   label: 'Tax & statements',   meta: '2026' },
      ],
    },
    {
      title: 'Learn & help',
      items: [
        { icon: 'book',     label: 'Learn',              meta: '5 lessons' },
        { icon: 'sparkles', label: 'Investment ideas',   meta: 'NEW' },
        { icon: 'info',     label: 'Support' },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: 'fingerprint', label: 'Sign-in & password' },
        { icon: 'bell',        label: 'Notifications' },
        { icon: 'settings',    label: 'Settings' },
      ],
    },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, color: text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '64px 20px 14px' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', fontFamily: SC.fontDisplay }}>{t(lang, 'menu')}</h1>
      </div>
      {/* Profile card — tap to open Profile */}
      <div style={{ padding: '4px 20px 20px' }}>
        <button onClick={onProfile} style={{
          padding: 18, borderRadius: 24,
          background: dark ? SC.ink900 : SC.greenWash,
          border: dark ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${SC.greenSoft}`,
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          width: '100%', textAlign: 'left', color: 'inherit',
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft, color: dark ? SC.greenBright : SC.greenDeep, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, fontFamily: SC.fontDisplay }}>{clientInitial(lang)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.2px' }}>{clientName(lang)}</div>
            <div style={{ fontSize: 12, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{clientMeta(lang)}</div>
          </div>
          <Icon name="chevR" size={20} color={sub}/>
        </button>
      </div>
      {/* Groups */}
      <div style={{ flex: 1, padding: '0 20px 96px', overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.title} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 4px 8px' }}>{g.title}</div>
            <div style={{ background: fieldBg, borderRadius: 18, overflow: 'hidden' }}>
              {g.items.map((it, i, arr) => (
                <div key={it.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderBottom: i === arr.length - 1 ? 'none' : (dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`),
                  cursor: 'pointer',
                }}>
                  <Icon name={it.icon} size={20} color={text}/>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, letterSpacing: '-0.2px' }}>{it.label}</span>
                  {it.meta && (
                    <span style={{
                      fontSize: it.meta === 'NEW' ? 10 : 12,
                      fontWeight: it.meta === 'NEW' ? 700 : 600,
                      color: it.meta === 'NEW' ? SC.ink1000 : sub,
                      background: it.meta === 'NEW' ? SC.lime : 'transparent',
                      padding: it.meta === 'NEW' ? '2px 7px' : 0,
                      borderRadius: it.meta === 'NEW' ? 999 : 0,
                      letterSpacing: it.meta === 'NEW' ? '0.04em' : 'normal',
                      fontFamily: it.meta === 'NEW' ? SC.fontDisplay : SC.fontMono,
                    }}>{it.meta}</span>
                  )}
                  <Icon name="chevR" size={16} color={sub}/>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Logout */}
        <button style={{
          width: '100%', padding: '14px 16px', borderRadius: 18,
          background: fieldBg, color: SC.danger, border: 'none', cursor: 'pointer',
          fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 14, letterSpacing: '-0.2px',
        }}>{lang === 'ru' ? 'Выйти' : 'Sign out'}</button>
        <div style={{ marginTop: 18, textAlign: 'center', color: sub, fontSize: 11, fontFamily: SC.fontMono }}>
          Zaman · v1.0.0 · 2026
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile screen — opens from header avatar tap; full personal info
// ─────────────────────────────────────────────────────────────
function menuGroups(lang) {
  return lang === 'ru' ? [
    { title: 'Финансы', items: [
      { icon: 'wallet',   label: 'Счета и карты',             meta: '2 счёта' },
      { icon: 'qr',       label: 'Реквизиты для пополнения' },
      { icon: 'layers',   label: 'Налоги и выписки',          meta: '2026' },
    ]},
    { title: 'Обучение и помощь', items: [
      { icon: 'book',     label: 'Обучение',                  meta: '5 уроков' },
      { icon: 'sparkles', label: 'Инвестиционные идеи',       meta: 'NEW' },
      { icon: 'info',     label: 'Поддержка' },
    ]},
    { title: 'Безопасность', items: [
      { icon: 'fingerprint', label: 'Вход и пароль' },
      { icon: 'bell',        label: 'Уведомления' },
      { icon: 'settings',    label: 'Настройки' },
    ]},
  ] : [
    { title: 'Finance', items: [
      { icon: 'wallet',   label: 'Accounts & cards',          meta: '2 accounts' },
      { icon: 'qr',       label: 'Top-up details' },
      { icon: 'layers',   label: 'Tax & statements',          meta: '2026' },
    ]},
    { title: 'Learn & help', items: [
      { icon: 'book',     label: 'Learn',                     meta: '5 lessons' },
      { icon: 'sparkles', label: 'Investment ideas',          meta: 'NEW' },
      { icon: 'info',     label: 'Support' },
    ]},
    { title: 'Security', items: [
      { icon: 'fingerprint', label: 'Sign-in & password' },
      { icon: 'bell',        label: 'Notifications' },
      { icon: 'settings',    label: 'Settings' },
    ]},
  ];
}

function ProfileScreen({ lang = 'ru', dark = false, onBack = () => {}, onLogout = () => {} }) {
  const bg = dark ? SC.ink1000 : SC.paper;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const c = (typeof window !== 'undefined' && window.SENTI_CLIENT) || null;
  const genderRu = { male: 'Мужской', female: 'Женский' };
  const realRows = c ? (lang === 'ru' ? [
    { label: 'Клиент ID',   value: c.id },
    { label: 'Имя',         value: c.profile?.name || '—' },
    { label: 'Дата рожд.',  value: c.profile?.dob || '—' },
    { label: 'Пол',         value: genderRu[c.profile?.gender] || '—' },
    { label: 'Email',       value: c.email + (c.emailVerified ? ' ✓' : ' (не подтв.)') },
    { label: 'Телефон',     value: c.profile?.phone || '—' },
    { label: 'Верификация', value: c.kycStatus === 'verified' ? 'Пройдена' : 'Не пройдена' },
  ] : [
    { label: 'Client ID',   value: c.id },
    { label: 'Name',        value: c.profile?.name || '—' },
    { label: 'Birth date',  value: c.profile?.dob || '—' },
    { label: 'Gender',      value: c.profile?.gender || '—' },
    { label: 'Email',       value: c.email + (c.emailVerified ? ' ✓' : ' (unverified)') },
    { label: 'Phone',       value: c.profile?.phone || '—' },
    { label: 'Verification',value: c.kycStatus === 'verified' ? 'Done' : 'Pending' },
  ]) : null;
  const rows = realRows || (lang === 'ru' ? [
    { label: 'ФИО',         value: 'Калыкова Айгуль Маратовна' },
    { label: 'Дата рожд.',  value: '14.06.1996' },
    { label: 'Гражданство', value: 'Кыргызская Республика' },
    { label: 'Паспорт',     value: 'AN 1840 ···· 8841' },
    { label: 'ИНН',         value: '20406199600541' },
    { label: 'Email',       value: 'a.kalykova@mail.kg' },
    { label: 'Телефон',     value: '+996 ··· 22 41' },
    { label: 'Адрес',       value: 'г. Бишкек, Чуйский пр-т, 162' },
  ] : [
    { label: 'Full name',    value: 'Kalykova Aigul Maratovna' },
    { label: 'Date of birth',value: '14.06.1996' },
    { label: 'Citizenship',  value: 'Kyrgyz Republic' },
    { label: 'Passport',     value: 'AN 1840 ···· 8841' },
    { label: 'Tax ID',       value: '20406199600541' },
    { label: 'Email',        value: 'a.kalykova@mail.kg' },
    { label: 'Phone',        value: '+996 ··· 22 41' },
    { label: 'Address',      value: 'Bishkek, Chuy prospect, 162' },
  ]);
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, color: text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 999, background: fieldBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={18} color={text}/>
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', fontFamily: SC.fontDisplay }}>{t(lang, 'profile')}</h1>
      </div>
      {/* Hero — avatar + KYC status */}
      <div style={{ padding: '4px 20px 18px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft, color: dark ? SC.greenBright : SC.greenDeep, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 36, fontFamily: SC.fontDisplay, margin: '8px auto 14px', position: 'relative' }}>
          {c ? clientInitial(lang) : 'А'}
          {(!c || clientKycVerified()) && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 999, background: SC.green, border: `3px solid ${bg}`, display: 'grid', placeItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
            </div>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>{c ? clientName(lang) : (lang === 'ru' ? 'Айгуль Калыкова' : 'Aigul Kalykova')}</div>
        <div style={{ fontSize: 12, color: sub, marginTop: 4, fontFamily: SC.fontMono }}>{c ? ('ID ' + clientId()) : ('ID 7841 · ' + (lang === 'ru' ? 'с 12 марта 2024' : 'since Mar 12, 2024'))}</div>
        {clientKycVerified() || !c ? (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft, color: dark ? SC.greenBright : SC.greenDeep, fontSize: 12, fontWeight: 600, letterSpacing: '-0.1px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
            {lang === 'ru' ? 'KYC подтверждён' : 'KYC verified'}
          </div>
        ) : (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: dark ? 'rgba(229,165,10,0.18)' : '#FBF0D9', color: '#B7791F', fontSize: 12, fontWeight: 600, letterSpacing: '-0.1px' }}>
            {lang === 'ru' ? 'Верификация не пройдена' : 'Verification pending'}
          </div>
        )}
      </div>
      {/* Info table */}
      <div style={{ flex: 1, padding: '0 20px 96px', overflowY: 'auto' }}>
        <div style={{ background: fieldBg, borderRadius: 18, overflow: 'hidden' }}>
          {rows.map((r, i, arr) => (
            <div key={r.label} style={{
              display: 'flex', alignItems: 'center', padding: '13px 16px', gap: 12,
              borderBottom: i === arr.length - 1 ? 'none' : (dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`),
            }}>
              <span style={{ flex: '0 0 110px', fontSize: 12, color: sub, fontWeight: 500 }}>{r.label}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: text, fontFamily: r.label.toLowerCase().includes('паспорт') || r.label.toLowerCase().includes('passport') || r.label.toLowerCase().includes('инн') || r.label.toLowerCase().includes('tax') || r.label.toLowerCase().includes('phone') || r.label.toLowerCase().includes('телефон') ? SC.fontMono : SC.fontDisplay, letterSpacing: '-0.1px' }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <Pill variant={dark ? 'softDark' : 'soft'} size="md" full>{lang === 'ru' ? 'Изменить' : 'Edit'}</Pill>
          <Pill variant="primary" size="md" full arrow>{lang === 'ru' ? 'Документы' : 'Documents'}</Pill>
        </div>

        {/* ── Menu groups (Finance / Learn / Security) ─────── */}
        {menuGroups(lang).map(g => (
          <div key={g.title} style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 4px 8px' }}>{g.title}</div>
            <div style={{ background: fieldBg, borderRadius: 18, overflow: 'hidden' }}>
              {g.items.map((it, i, arr) => (
                <div key={it.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderBottom: i === arr.length - 1 ? 'none' : (dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`),
                  cursor: 'pointer',
                }}>
                  <Icon name={it.icon} size={20} color={text}/>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, letterSpacing: '-0.2px' }}>{it.label}</span>
                  {it.meta && (
                    <span style={{
                      fontSize: it.meta === 'NEW' ? 10 : 12, fontWeight: it.meta === 'NEW' ? 700 : 600,
                      color: it.meta === 'NEW' ? SC.ink1000 : sub,
                      background: it.meta === 'NEW' ? SC.lime : 'transparent',
                      padding: it.meta === 'NEW' ? '2px 7px' : 0, borderRadius: it.meta === 'NEW' ? 999 : 0,
                      letterSpacing: it.meta === 'NEW' ? '0.04em' : 'normal',
                      fontFamily: it.meta === 'NEW' ? SC.fontDisplay : SC.fontMono,
                    }}>{it.meta}</span>
                  )}
                  <Icon name="chevR" size={16} color={sub}/>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button onClick={onLogout} style={{
          width: '100%', marginTop: 22, padding: '14px 16px', borderRadius: 18,
          background: fieldBg, color: SC.danger, border: 'none', cursor: 'pointer',
          fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 14, letterSpacing: '-0.2px',
        }}>{lang === 'ru' ? 'Выйти' : 'Sign out'}</button>
        <div style={{ marginTop: 14, textAlign: 'center', color: sub, fontSize: 11, fontFamily: SC.fontMono }}>
          Zaman · v1.0.0 · 2026
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile Assets view — 3 tabs: Портфель / Приказы / Сделки
// ─────────────────────────────────────────────────────────────
const MOBILE_ORDERS_RU = [
  { id: 1, side: 'buy',  symbol: 'AAPL', name: 'Apple Inc.',  price:  185.00, ccy: '$', qty: 5, status: 'Активен', date: 'Сегодня · 09:14', type: 'Лимитный' },
  { id: 2, side: 'sell', symbol: 'TSLA', name: 'Tesla',       price:  260.00, ccy: '$', qty: 3, status: 'Активен', date: 'Сегодня · 08:42', type: 'Стоп' },
  { id: 3, side: 'buy',  symbol: 'KCEL', name: 'Кыргызтелеком',price:  240.00, ccy: 'с', qty:100, status: 'Активен', date: 'Вчера · 16:00',  type: 'Лимитный' },
];
const MOBILE_ORDERS_EN = [
  { id: 1, side: 'buy',  symbol: 'AAPL', name: 'Apple Inc.',  price: 185.00, ccy: '$', qty: 5,   status: 'Active', date: 'Today · 09:14', type: 'Limit' },
  { id: 2, side: 'sell', symbol: 'TSLA', name: 'Tesla',       price: 260.00, ccy: '$', qty: 3,   status: 'Active', date: 'Today · 08:42', type: 'Stop' },
  { id: 3, side: 'buy',  symbol: 'KCEL', name: 'Kyrgyztelecom', price: 240.00, ccy: 'с', qty: 100, status: 'Active', date: 'Yesterday · 16:00', type: 'Limit' },
];

const MOBILE_TRADES_RU = [
  { id: 1, side: 'buy',  symbol: 'NVDA', name: 'Nvidia',       price: 498.12, ccy: '$', qty: 0.04,  total:   4980.20, date: '14 мая · 14:32' },
  { id: 2, side: 'sell', symbol: 'TSLA', name: 'Tesla',        price: 245.20, ccy: '$', qty: 0.6,   total:   1471.20, date: '12 мая · 18:04' },
  { id: 3, side: 'buy',  symbol: 'BTC',  name: 'Bitcoin',      price: 69420,  ccy: '$', qty: 0.001, total:     69.42, date: '08 мая · 12:18' },
  { id: 4, side: 'buy',  symbol: 'KCEL', name: 'Кыргызтелеком', price:  244.00, ccy: 'с', qty: 50,    total:  12200.00, date: '02 мая · 10:08' },
];
const MOBILE_TRADES_EN = MOBILE_TRADES_RU.map(t => ({ ...t, date: t.date.replace('мая', 'May').replace('14 ', 'May 14, ').replace('12 ', 'May 12, ').replace('08 ', 'May 8, ').replace('02 ', 'May 2, ') }));

function MobileAssetsView({ lang = 'ru', dark = false, onAsset = () => {} }) {
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
  const { orders: allRecords, refetch: refetchHistory } = typeof useBybitHistory === 'function' ? useBybitHistory() : { orders: [], refetch: () => {} };
  const openOrders   = React.useMemo(() => allRecords.filter(r => r.recordType === 'open_order'), [allRecords]);
  const closedTrades = React.useMemo(() => allRecords.filter(r => r.recordType === 'order'), [allRecords]);
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const [cancellingId, setCancellingId] = React.useState(null);
  const cancelOrder = React.useCallback(async (o) => {
    if (cancellingId) return;
    const confirmed = window.confirm(
      lang === 'ru'
        ? `Вы хотите отменить ордер?\n${o.side === 'Buy' ? 'Покупка' : 'Продажа'} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}`
        : `Cancel this order?\n${o.side} ${bhSym(o.symbol)} · ${bhQtyPrice(o)}`
    );
    if (!confirmed) return;
    setCancellingId(o.id);
    try {
      const r = await fetch(`${BYBIT_WORKER}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: o.id, symbol: o.symbol, category: o.category || 'spot' }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Error');
      refetchHistory();
    } catch(e) {
      alert(lang === 'ru' ? `Ошибка отмены: ${e.message}` : `Cancel error: ${e.message}`);
    } finally {
      setCancellingId(null);
    }
  }, [cancellingId, lang, refetchHistory]);
  const bg = dark ? SC.ink1000 : SC.paper;
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const tabs = [
    { id: 'portfolio', label: t(lang, 'portfolioTab') },
    { id: 'orders',    label: t(lang, 'orders') },
    { id: 'trades',    label: t(lang, 'trades') },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, color: text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '64px 20px 8px' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', fontFamily: SC.fontDisplay }}>{t(lang, 'assets')}</h1>
      </div>
      {/* Tabs (segment) */}
      <div style={{ padding: '12px 20px 8px' }}>
        <div style={{ display: 'flex', background: fieldBg, borderRadius: 12, padding: 3, gap: 0 }}>
          {tabs.map(tg => (
            <button key={tg.id} onClick={() => setTab(tg.id)} style={{
              flex: 1, background: tab === tg.id ? (dark ? '#fff' : SC.ink1000) : 'transparent',
              color: tab === tg.id ? (dark ? SC.ink1000 : '#fff') : sub,
              border: 'none', cursor: 'pointer',
              padding: '8px 0', borderRadius: 10,
              fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.2px',
            }}>{tg.label}</button>
          ))}
        </div>
      </div>

      {/* Summary card (depends on tab) */}
      <div style={{ padding: '6px 20px 6px' }}>
        {tab === 'portfolio' && (
          <div style={{ padding: '14px 16px', borderRadius: 16, background: fieldBg, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t(lang, 'totalBalance')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                <MoneyKGS value={stats.totalKgs} size={28} weight={600} color={text}/>
                <DeltaPill value={stats.dayChangePct} size="sm"/>
              </div>
            </div>
            {/* Allocation strip + legend */}
            <div>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{t(lang, 'allocation')}</div>
              <AllocationStrip segments={stats.allocation[lang]} height={6} showLabels={false}/>
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 0, marginTop: 10, justifyContent: 'space-between' }}>
                {stats.allocation[lang].map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: s.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 11, color: sub, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 52 }}>{s.label}</span>
                    <span style={{ fontFamily: SC.fontMono, fontSize: 11, fontWeight: 600, color: text, whiteSpace: 'nowrap' }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'orders' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: fieldBg }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'Активные' : 'Active'}</div>
              <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, color: text, letterSpacing: '-0.03em', marginTop: 2 }}>{openOrders.length}</div>
            </div>
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: fieldBg }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'За неделю' : 'This week'}</div>
              <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, color: text, letterSpacing: '-0.03em', marginTop: 2 }}>{allRecords.filter(r => r.time > weekAgo && r.recordType === 'order').length}</div>
            </div>
          </div>
        )}
        {tab === 'trades' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: fieldBg }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'Всего сделок' : 'Total trades'}</div>
              <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, color: text, letterSpacing: '-0.03em', marginTop: 2 }}>{closedTrades.length}</div>
            </div>
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: fieldBg }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'За неделю' : 'This week'}</div>
              <div style={{ fontFamily: SC.fontMono, fontSize: 22, fontWeight: 700, color: text, letterSpacing: '-0.03em', marginTop: 2 }}>{closedTrades.filter(r => r.time > weekAgo).length}</div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, padding: '8px 20px 96px', overflowY: 'auto' }}>
        {tab === 'portfolio' && (<>
          {liveHoldings.map((h, i, arr) => (
            <AssetRow key={h.symbol} {...h} sparkData={h.spark} priceCcy={h.ccy} last={i === arr.length - 1 && bybitHoldings.length === 0} dark={dark}
              onClick={() => onAsset(h)}/>
          ))}
          {bybitHoldings.map((h, i, arr) => (
            <AssetRow key={'bybit-' + h.symbol} {...h} priceCcy="$" last={i === arr.length - 1} dark={dark} badge="bybit live"/>
          ))}
        </>)}
        {tab === 'orders' && (
          openOrders.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: sub, fontSize: 14 }}>{lang === 'ru' ? 'Нет активных приказов' : 'No open orders'}</div>
            : openOrders.map((o, i, arr) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i === arr.length - 1 ? 'none' : border }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: o.side === 'Buy' ? SC.greenSoft : '#FBE0E0', color: o.side === 'Buy' ? SC.greenDeep : '#8E1F1F', display: 'grid', placeItems: 'center' }}>
                  <Icon name={o.side === 'Buy' ? 'arrUp' : 'arrDn'} size={18} color="currentColor" strokeWidth={2.2}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>
                    {o.side === 'Buy' ? (lang === 'ru' ? 'Покупка' : 'Buy') : (lang === 'ru' ? 'Продажа' : 'Sell')} · {bhSym(o.symbol)}
                  </div>
                  <div style={{ fontSize: 12, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{bhQtyPrice(o)} · {bhFmtDate(o.time, lang)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: text }}>{bhTotal(o)}</div>
                  <div style={{ fontSize: 11, color: '#F7A600', fontWeight: 600, marginTop: 2 }}>● {bhStatusLabel(o.status, o.recordType, lang)}</div>
                </div>
                <button onClick={() => cancelOrder(o)} disabled={cancellingId === o.id} style={{
                  width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
                  color: '#EF4444', display: 'grid', placeItems: 'center',
                  opacity: cancellingId === o.id ? 0.5 : 1,
                }}>
                  {cancellingId === o.id ? '…' : <Icon name="close" size={14} color="#EF4444" strokeWidth={2.5}/>}
                </button>
              </div>
            ))
        )}
        {tab === 'trades' && (
          closedTrades.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: sub, fontSize: 14 }}>{lang === 'ru' ? 'Нет исполненных сделок' : 'No trades yet'}</div>
            : closedTrades.map((tr, i, arr) => (
              <div key={tr.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i === arr.length - 1 ? 'none' : border }}>
                <TickerLogo symbol={bhSym(tr.symbol)} size={40}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>
                    <span style={{ color: bhSideColor(tr.side, dark), marginRight: 4 }}>
                      {tr.side === 'Buy' ? (lang === 'ru' ? 'Купил' : 'Bought') : (lang === 'ru' ? 'Продал' : 'Sold')}
                    </span>
                    {bhSym(tr.symbol)}
                  </div>
                  <div style={{ fontSize: 12, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{bhQtyPrice(tr)} · {bhFmtDate(tr.time, lang)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, color: text }}>{bhTotal(tr)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: bhStatusColor(tr.status, tr.recordType, dark) }}>
                    {bhStatusLabel(tr.status, tr.recordType, lang)}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Mobile home — News + Investment ideas block (replaces Assets list)
// ──────────────────────────────────────────────────────────────
function NewsThumb({ kind, dark = false }) {
  const sets = {
    crypto: {
      bg: 'linear-gradient(135deg, #F7931A 0%, #FFC56C 100%)',
      glyph: '₿',
    },
    apple: {
      bg: 'linear-gradient(135deg, #0E1413 0%, #2A3331 100%)',
      glyph: '\uF8FF', // apple-ish; falls back to letter A
    },
    kg: {
      bg: 'linear-gradient(135deg, #052E80 0%, #0C47B7 100%)',
      glyph: 'KG',
    },
    market: {
      bg: 'linear-gradient(135deg, #2A6FDB 0%, #6FC2FF 100%)',
      glyph: '↗',
    },
  };
  const s = sets[kind] || sets.market;
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: s.bg, flex: '0 0 auto',
      display: 'grid', placeItems: 'center', overflow: 'hidden',
      position: 'relative',
      boxShadow: dark ? 'inset 0 0 0 1px rgba(255,255,255,0.06)' : 'inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        position: 'absolute', bottom: -6, right: -8,
        fontFamily: SC.fontDisplay, fontWeight: 800, fontSize: 56,
        color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.05em', lineHeight: 0.9,
      }}>{s.glyph}</div>
      <div style={{
        position: 'absolute', top: 8, left: 8, width: 8, height: 8, borderRadius: 999,
        background: 'rgba(255,255,255,0.55)',
      }}/>
    </div>
  );
}

const MOBILE_NEWS_RU = [
  { tag: 'Товары', title: 'Золото удержало $4 514/унц. на фоне иранских переговоров', meta: 'Kitco News · 29 мая', img: 'market' },
  { tag: 'Акции',  title: 'Dell +32,76% — крупнейший рост за 10 лет',                 meta: 'Yahoo Finance · 29 мая', img: 'apple' },
];
const MOBILE_NEWS_EN = MOBILE_NEWS_RU;
const MOBILE_IDEAS_RU = [
  { tag: 'Акции США', title: 'Nvidia: ИИ-суперцикл', upside: '+35–50%', dark: true,  basket: ['NVDA','MSFT','AMD'] },
  { tag: 'Крипто',    title: 'BTC откат к $70k',      upside: '+60–70%', dark: true,  basket: ['BTC','ETH'] },
];
const MOBILE_IDEAS_EN = MOBILE_IDEAS_RU;

// Full data for dedicated screens (shared with web)
const ALL_NEWS = [
  {
    tag: 'Товары', cls: 'comm',
    gradient: 'linear-gradient(135deg, #1a2010 0%, #2a3518 100%)',
    title: 'Золото удержало $4 514/унц. на фоне иранских переговоров',
    body: 'Золото устояло у ключевой поддержки $4 514/унц. после сообщений о прогрессе в переговорах США–Иран. Данные по заказам на товары длительного пользования (+7,9% в апреле) поддержали котировки. С начала 2026 года золото выросло на 45%.',
    source: 'Kitco News', date: '29 мая 2026',
  },
  {
    tag: 'Товары', cls: 'comm',
    gradient: 'linear-gradient(135deg, #1a1410 0%, #2e1e14 100%)',
    title: 'Нефть WTI упала до $87,36 — трейдеры фиксируют прибыль',
    body: 'Нефть WTI потеряла 1,73% на фоне сообщений о возможном 60-дневном продлении ирано-американских переговоров. Недельное падение запасов в США составило рекордные 7,9 млн барр. — сигнал нарастающего дефицита. Аналитики не исключают $160/барр. при срыве сделки.',
    source: 'OilPrice.com', date: '29 мая 2026',
  },
  {
    tag: 'Крипто', cls: 'crypto',
    gradient: 'linear-gradient(135deg, #141830 0%, #1e2245 100%)',
    title: 'Биткоин вышел из топ-10 мировых активов — капитализация ниже $1,5 трлн',
    body: 'BTC впервые покинул десятку крупнейших активов мира. Спотовые биткоин-ETF зафиксировали рекордную 9-дневную полосу оттоков на $2,84 млрд. Крупные «киты» приостановили покупки. BTC торгуется на уровне $73 645 (+0,99% за сутки).',
    source: 'CoinTelegraph', date: '30 мая 2026',
  },
  {
    tag: 'Крипто', cls: 'crypto',
    gradient: 'linear-gradient(135deg, #101828 0%, #182038 100%)',
    title: 'Stellar XLM взлетел на 50%+ после партнёрства с DTCC',
    body: 'Токен Stellar (XLM) вырос более чем на 50% после объявления о партнёрстве с DTCC — главной расчётной инфраструктурой американского рынка ценных бумаг объёмом $100+ трлн в год. Paxos стал первым блокчейн-нативным клиринговым агентством от регуляторов США.',
    source: 'CoinTelegraph', date: '28 мая 2026',
  },
  {
    tag: 'Акции', cls: 'cfd',
    gradient: 'linear-gradient(135deg, #101428 0%, #161c38 100%)',
    title: 'Microsoft +5,45%: рекордный рост Azure AI превзошёл все прогнозы',
    body: 'Акции Microsoft (MSFT) достигли $450,24 после раскрытия опережающих прогнозы данных Azure AI. Это развеяло сомнения об окупаемости ИИ-инвестиций. Palo Alto Networks и CrowdStrike также выросли на ~9%.',
    source: 'Yahoo Finance', date: '29 мая 2026',
  },
  {
    tag: 'Акции', cls: 'cfd',
    gradient: 'linear-gradient(135deg, #0e1820 0%, #142430 100%)',
    title: 'Dell +32,76% — крупнейший однодневный рост за десятилетие',
    body: 'Dell Technologies показал рост на 32,76% после квартального отчёта, в котором выручка от серверов для ИИ многократно превзошла ожидания. Компания фиксирует взрывной рост заказов со стороны Microsoft, Amazon и Google.',
    source: 'Yahoo Finance', date: '29 мая 2026',
  },
];

const ALL_IDEAS = [
  {
    tag: 'Товары', cls: 'comm',
    color: 'linear-gradient(135deg, #1a2010 0%, #243018 100%)',
    accent: '#A3C96E',
    title: 'Золото: суперцикл продолжается',
    body: 'Золото выросло на 45% с начала 2026 года. Rockefeller International прогнозирует $5 500/унц. к 2027 году. Центральные банки ведут один из крупнейших циклов покупок в современной истории. Дедолларизация и геополитика — структурные драйверы.',
    upside: '+20–35%', period: '12–18 мес', risk: 'Умеренный', riskColor: '#F7A600',
    target: 'Цель: $5 200–6 000/унц.',
  },
  {
    tag: 'Товары', cls: 'comm',
    color: 'linear-gradient(135deg, #1e1408 0%, #2e1e0e 100%)',
    accent: '#E8824A',
    title: 'Нефть WTI: асимметричная ставка',
    body: 'Запасы нефти в США падают на 7,9 млн барр. в неделю. При срыве ирано-американских переговоров аналитики допускают рост WTI до $120–160/барр. Текущая коррекция к $87 создаёт зону асимметричного риска/доходности.',
    upside: '+15–40%', period: '1–3 мес', risk: 'Высокий', riskColor: SC.danger,
    target: 'Цель: $100–160/барр.',
  },
  {
    tag: 'Крипто', cls: 'crypto',
    color: 'linear-gradient(135deg, #0e1428 0%, #161e3e 100%)',
    accent: '#7B9FE8',
    title: 'Биткоин: покупка на откате к $70 000',
    body: 'Около $500 млн в лимитных ордерах сконцентрированы у $70 000. Fidelity фиксирует признаки того, что ряд государств начинает добавлять BTC в резервы. Исторически 9-дневные полосы оттоков из ETF предшествовали крупным разворотам.',
    upside: '+60–70%', period: '6–12 мес', risk: 'Высокий', riskColor: SC.danger,
    target: 'Цель: $115 000–120 000',
  },
  {
    tag: 'Крипто', cls: 'crypto',
    color: 'linear-gradient(135deg, #101030 0%, #181840 100%)',
    accent: '#9B8FE8',
    title: 'Ethereum: контрарная ставка',
    body: 'ETH упал на 57% от пиков 2025 года и торгуется у $2 013. Корпоративные казначейства наращивают позиции рекордными темпами. Стандарт ERC-7943 для токенизации реальных активов вышел на финальную стадию утверждения.',
    upside: '+40–80%', period: '9–18 мес', risk: 'Высокий', riskColor: SC.danger,
    target: 'Цель: $3 500–4 000',
  },
  {
    tag: 'Акции', cls: 'cfd',
    color: 'linear-gradient(135deg, #0a1020 0%, #101830 100%)',
    accent: SC.lime,
    title: 'Nvidia: ИИ-инфраструктурный мегатренд',
    body: 'Рост Dell на 32% подтвердил, что спрос на GPU со стороны гиперскейлеров ускоряется. Nvidia — единственный поставщик передовых GPU класса H100/B200. Спрос Microsoft, Amazon, Google продолжает расти.',
    upside: '+35–50%', period: '9–15 мес', risk: 'Умеренный', riskColor: '#F7A600',
    target: 'Цель: $280–320',
  },
  {
    tag: 'Акции', cls: 'cfd',
    color: 'linear-gradient(135deg, #081420 0%, #0e1e30 100%)',
    accent: SC.greenBright,
    title: 'Microsoft: «голубая фишка» ИИ-эры',
    body: 'Azure AI демонстрирует ускорение выручки. Microsoft монетизирует ИИ через несколько каналов: Azure, Copilot, GitHub, Bing. При P/E ниже исторических пиков — привлекательнее чистых ИИ-спекуляций.',
    upside: '+20–30%', period: '12 мес', risk: 'Умеренно-низкий', riskColor: SC.green,
    target: 'Цель: $540–585',
  },
];

// ─────────────────────────────────────────────────────────────
// Mobile News screen — full list of 6 news items
// ─────────────────────────────────────────────────────────────
function MobileNewsScreen({ lang = 'ru', dark = false, onBack = () => {} }) {
  const bg      = dark ? SC.ink1000 : SC.paper;
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const border  = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  const [filter, setFilter] = React.useState('all');
  const tabs = [
    { id: 'all',    label: 'Все' },
    { id: 'comm',   label: 'Товары' },
    { id: 'crypto', label: 'Крипто' },
    { id: 'cfd',    label: 'Акции' },
  ];
  const items = filter === 'all' ? ALL_NEWS : ALL_NEWS.filter(n => n.cls === filter);
  const tagColors = { comm: '#C26A44', crypto: '#7B9FE8', cfd: SC.greenDeep };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: bg, color: text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '54px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 999, background: fieldBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={18} color={text}/>
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', fontFamily: SC.fontDisplay }}>Новости рынка</h1>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 14px', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '7px 14px', borderRadius: 999, flexShrink: 0,
            background: filter === t.id ? (dark ? '#fff' : SC.ink1000) : fieldBg,
            color: filter === t.id ? (dark ? SC.ink1000 : '#fff') : sub,
            border: 'none', cursor: 'pointer',
            fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 12, letterSpacing: '-0.1px',
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((n, i) => (
          <div key={i} style={{ background: dark ? SC.ink900 : SC.ink50, borderRadius: 20, border, overflow: 'hidden' }}>
            <div style={{ height: 100, background: n.gradient, position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: 'rgba(0,0,0,0.45)' }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: tagColors[n.cls] || SC.green }}/>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{n.tag}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 9, color: 'rgba(255,255,255,0.55)', fontFamily: SC.fontMono }}>{n.date}</div>
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: text, letterSpacing: '-0.2px', lineHeight: 1.3, marginBottom: 8 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: sub, lineHeight: 1.5, marginBottom: 10 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{n.source}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile Ideas screen — full list of 6 investment ideas
// ─────────────────────────────────────────────────────────────
function MobileIdeasScreen({ lang = 'ru', dark = false, onBack = () => {} }) {
  const bg      = dark ? SC.ink1000 : SC.paper;
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;

  const [filter, setFilter] = React.useState('all');
  const tabs = [
    { id: 'all',    label: 'Все' },
    { id: 'comm',   label: 'Товары' },
    { id: 'crypto', label: 'Крипто' },
    { id: 'cfd',    label: 'Акции' },
  ];
  const items = filter === 'all' ? ALL_IDEAS : ALL_IDEAS.filter(n => n.cls === filter);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: bg, color: text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '54px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 999, background: fieldBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={18} color={text}/>
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', fontFamily: SC.fontDisplay }}>Инвестиционные идеи</h1>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 14px', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '7px 14px', borderRadius: 999, flexShrink: 0,
            background: filter === t.id ? (dark ? '#fff' : SC.ink1000) : fieldBg,
            color: filter === t.id ? (dark ? SC.ink1000 : '#fff') : sub,
            border: 'none', cursor: 'pointer',
            fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 12, letterSpacing: '-0.1px',
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((idea, i) => (
          <div key={i} style={{ background: idea.color, borderRadius: 20, overflow: 'hidden', padding: '18px 18px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.10)', marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: idea.accent }}/>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{idea.tag}</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 8 }}>{idea.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 14 }}>{idea.body}</div>
            <div style={{ margin: '0 -18px', padding: '12px 18px 14px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: idea.accent, fontFamily: SC.fontMono }}>{idea.upside}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{idea.period} · {idea.target}</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: idea.riskColor }}>
                {idea.risk}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeIdeasNews({ lang = 'ru', dark = false, accent = 'green', onNav = () => {} }) {
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const ideas = lang === 'ru' ? MOBILE_IDEAS_RU : MOBILE_IDEAS_EN;
  const news = lang === 'ru' ? MOBILE_NEWS_RU : MOBILE_NEWS_EN;
  return (
    <div style={{ padding: '14px 20px 100px' }}>
      {/* Ideas — 2 cards in a row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>{t(lang, 'investIdeas')}</span>
        <button onClick={() => onNav('ideas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, fontSize: 13, fontWeight: 500, fontFamily: SC.fontDisplay }}>{t(lang, 'seeAll')} →</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {ideas.map((idea, i) => (
          <div key={i} onClick={() => onNav('ideas')} style={{
            flex: 1,
            background: idea.dark ? SC.ink1000 : (dark ? 'rgba(255,255,255,0.06)' : SC.greenWash),
            color: idea.dark ? '#fff' : text,
            border: !idea.dark && !dark ? `1px solid ${SC.greenSoft}` : 'none',
            borderRadius: 16, padding: 10, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer',
          }}>
            <span style={{
              display: 'inline-block', alignSelf: 'flex-start',
              padding: '2px 7px', borderRadius: 999,
              background: idea.dark ? SC.lime : (dark ? 'rgba(255,255,255,0.1)' : '#fff'),
              color: idea.dark ? SC.ink1000 : (dark ? '#fff' : SC.greenDeep),
              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{idea.tag}</span>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px', lineHeight: 1.15, marginTop: 2 }}>{idea.title}</div>
            <div style={{ flex: 1 }}/>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: SC.fontMono, fontSize: 16, fontWeight: 700, color: idea.dark ? SC.greenBright : SC.greenDeep, letterSpacing: '-0.03em' }}>{idea.upside}</span>
              <div style={{ display: 'flex' }}>
                {idea.basket.slice(0, 3).map((sym, j) => (
                  <div key={sym} style={{ marginLeft: j === 0 ? 0 : -8, border: `2px solid ${idea.dark ? SC.ink1000 : (dark ? SC.ink900 : '#fff')}`, borderRadius: 8 }}>
                    <TickerLogo symbol={sym} size={22}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* News */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>{t(lang, 'news')}</span>
        <button onClick={() => onNav('news')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, fontSize: 13, fontWeight: 500, fontFamily: SC.fontDisplay }}>{t(lang, 'seeAll')} →</button>
      </div>
      {news.slice(0, 1).map((n, i, arr) => (
        <div key={i} onClick={() => onNav('news')} style={{
          padding: '8px 0',
          borderBottom: i === arr.length - 1 ? 'none' : border,
          display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
        }}>
          {/* Thumbnail */}
          <NewsThumb kind={n.img} dark={dark}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100, color: sub, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{n.tag}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: text, letterSpacing: '-0.1px', lineHeight: 1.25 }}>{n.title}</div>
            <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{n.meta}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HistoryScreen — live Bybit orders + deposits + withdrawals (mobile)
// ─────────────────────────────────────────────────────────────
function HistoryScreen({ lang = 'ru', dark = false }) {
  const bg      = dark ? SC.ink1000 : SC.paper;
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const border  = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  const [tab, setTab] = React.useState('all');

  const { orders: allRecords, loading, error, refetch: refetchHistory } = typeof useBybitHistory === 'function'
    ? useBybitHistory(3600000)
    : { orders: [], loading: false, error: null, refetch: () => {} };

  const tabs = lang === 'ru'
    ? [{ id: 'all', label: 'Все' }, { id: 'open', label: 'Активные' }, { id: 'order', label: 'Ордера' }, { id: 'transfer', label: 'Переводы' }]
    : [{ id: 'all', label: 'All' }, { id: 'open', label: 'Open' }, { id: 'order', label: 'Filled' }, { id: 'transfer', label: 'Transfers' }];

  const [cancellingId, setCancellingId] = React.useState(null);
  const cancelOrder = React.useCallback(async (r) => {
    if (cancellingId) return;
    const sym = r.symbol.replace(/USDT$/, '');
    const confirmed = window.confirm(
      lang === 'ru'
        ? `Вы хотите отменить ордер?\n${r.side === 'Buy' ? 'Покупка' : 'Продажа'} ${sym}`
        : `Cancel this order?\n${r.side} ${sym}`
    );
    if (!confirmed) return;
    setCancellingId(r.id);
    try {
      const res = await fetch(`${BYBIT_WORKER}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: r.id, symbol: r.symbol, category: r.category || 'spot' }),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Error');
      refetchHistory();
    } catch(e) {
      alert(lang === 'ru' ? `Ошибка отмены: ${e.message}` : `Cancel error: ${e.message}`);
    } finally {
      setCancellingId(null);
    }
  }, [cancellingId, lang, refetchHistory]);

  const records = allRecords.filter(r => {
    if (tab === 'open')     return r.recordType === 'open_order';
    if (tab === 'order')    return r.recordType === 'order';
    if (tab === 'transfer') return r.recordType === 'deposit' || r.recordType === 'withdrawal';
    return true;
  });

  const MONTHS_RU = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtDate(ts) {
    const d = new Date(ts);
    const months = lang === 'ru' ? MONTHS_RU : MONTHS_EN;
    const h = String(d.getHours()).padStart(2,'0');
    const m = String(d.getMinutes()).padStart(2,'0');
    return `${d.getDate()} ${months[d.getMonth()]} · ${h}:${m}`;
  }
  function fmtSym(sym) { return sym.replace(/USDT$/, ''); }
  function fmtStatus(status, recordType) {
    if (recordType === 'open_order' && status === 'New') return lang === 'ru' ? 'Активен' : 'Active';
    if (lang === 'en') return status;
    const map = {
      Filled: 'Исполнено', Cancelled: 'Отменено', PartiallyFilled: 'Частично',
      New: 'Новый', Rejected: 'Отклонено',
      Success: 'Зачислено', Pending: 'Ожидание', Processing: 'Обработка', Failed: 'Ошибка',
      success: 'Выведено', pending: 'Ожидание',
    };
    return map[status] || status;
  }
  function statusColor(st, recordType) {
    if (recordType === 'open_order') return '#F7A600';
    if (st === 'Filled' || st === 'Success' || st === 'success') return SC.greenDeep;
    if (st === 'Cancelled' || st === 'Rejected' || st === 'Failed') return '#EF4444';
    return sub;
  }
  function typeInfo(r) {
    if (r.recordType === 'deposit')    return { label: lang === 'ru' ? 'Пополнение' : 'Deposit',  icon: '↓', color: SC.greenDeep, bg: dark ? 'rgba(12,71,183,0.15)' : SC.greenWash };
    if (r.recordType === 'withdrawal') return { label: lang === 'ru' ? 'Вывод' : 'Withdrawal',    icon: '↑', color: '#EF4444',   bg: dark ? 'rgba(239,68,68,0.12)' : '#FEF2F2' };
    if (r.recordType === 'open_order') {
      const isBuy = r.side === 'Buy';
      return {
        label: lang === 'ru' ? (isBuy ? 'Лимит ↑' : 'Лимит ↓') : (isBuy ? 'Limit Buy' : 'Limit Sell'),
        icon: isBuy ? '↑' : '↓', color: '#F7A600',
        bg: dark ? 'rgba(247,166,0,0.15)' : '#FFF7E6',
      };
    }
    if (r.side === 'Buy')  return { label: lang === 'ru' ? 'Покупка' : 'Buy',   icon: '↑', color: SC.greenDeep, bg: dark ? 'rgba(12,71,183,0.15)' : SC.greenWash };
    return { label: lang === 'ru' ? 'Продажа' : 'Sell', icon: '↓', color: '#EF4444', bg: dark ? 'rgba(239,68,68,0.12)' : '#FEF2F2' };
  }
  function fmtAmount(r) {
    const isTransfer  = r.recordType === 'deposit' || r.recordType === 'withdrawal';
    const isOpenOrder = r.recordType === 'open_order';
    if (isOpenOrder && r.price && r.leavesQty) {
      const v = parseFloat(r.price) * parseFloat(r.leavesQty);
      return `~$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const n = parseFloat(r.cumExecValue);
    if (!n) return '—';
    if (isTransfer) {
      const stables = ['USDT','USDC','BUSD','DAI'];
      if (stables.includes(r.symbol))
        return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return `${n.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${r.symbol}`;
    }
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function fmtSub(r) {
    const isTransfer  = r.recordType === 'deposit' || r.recordType === 'withdrawal';
    const isOpenOrder = r.recordType === 'open_order';
    if (isTransfer) {
      const parts = [];
      if (r.chain) parts.push(r.chain);
      if (parseFloat(r.cumExecFee) > 0) parts.push(`fee: ${r.cumExecFee} ${r.symbol}`);
      return parts.join(' · ') || r.orderType;
    }
    const sym = fmtSym(r.symbol);
    const cat = r.category === 'linear' ? ' · Futures' : '';
    if (isOpenOrder) {
      const leaves = parseFloat(r.leavesQty || r.qty);
      const qtyStr = leaves > 0 ? `${leaves.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${sym}` : '';
      const priceStr = r.price ? `@ $${parseFloat(r.price).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '';
      return [qtyStr, priceStr, r.orderType + cat].filter(Boolean).join(' · ');
    }
    const qty = parseFloat(r.cumExecQty);
    const qtyStr = qty > 0 ? `${qty.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${sym}` : '';
    return [qtyStr, r.orderType + cat].filter(Boolean).join(' · ');
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, color: text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '64px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em', fontFamily: SC.fontDisplay }}>
          {lang === 'ru' ? 'История' : 'History'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999,
          background: dark ? 'rgba(247,166,0,0.12)' : '#FFF7E6' }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: '#F7A600',
            boxShadow: !loading && !error ? '0 0 5px #F7A600' : 'none' }}/>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#C47E00', letterSpacing: '0.04em', fontFamily: SC.fontMono }}>
            Bybit {loading ? '…' : error ? 'err' : 'live'}
          </span>
        </div>
      </div>

      {/* Segment tabs */}
      <div style={{ padding: '10px 20px 6px' }}>
        <div style={{ display: 'flex', background: fieldBg, borderRadius: 12, padding: 3 }}>
          {tabs.map(tg => (
            <button key={tg.id} onClick={() => setTab(tg.id)} style={{
              flex: 1, background: tab === tg.id ? (dark ? '#fff' : SC.ink1000) : 'transparent',
              color: tab === tg.id ? (dark ? SC.ink1000 : '#fff') : sub,
              border: 'none', cursor: 'pointer', padding: '8px 0', borderRadius: 10,
              fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 12, letterSpacing: '-0.1px',
            }}>{tg.label}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 96px' }}>
        {loading && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: sub, fontSize: 13 }}>
            {lang === 'ru' ? 'Загрузка…' : 'Loading…'}
          </div>
        )}
        {error && (
          <div style={{ margin: '12px 20px', padding: 16, borderRadius: 16, background: fieldBg, color: '#EF4444', fontSize: 12 }}>
            {error}
          </div>
        )}
        {!loading && !error && records.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: sub, fontSize: 13 }}>
            {lang === 'ru' ? 'Нет записей' : 'No records'}
          </div>
        )}
        {records.map((r, i, arr) => {
          const ti  = typeInfo(r);
          const sym = (r.recordType === 'deposit' || r.recordType === 'withdrawal') ? r.symbol : fmtSym(r.symbol);
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 20px',
              borderBottom: i === arr.length - 1 ? 'none' : border,
            }}>
              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 12, background: ti.bg,
                display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, color: ti.color, fontWeight: 700 }}>{ti.icon}</span>
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: text, fontFamily: SC.fontDisplay }}>{ti.label}</span>
                  <span style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{sym}</span>
                </div>
                <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{fmtDate(r.time)}</div>
                <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fmtSub(r)}
                </div>
              </div>
              {/* Right: amount + status */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: SC.fontMono, color: ti.color }}>
                  {fmtAmount(r)}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, marginTop: 3, color: statusColor(r.status, r.recordType) }}>
                  ● {fmtStatus(r.status, r.recordType)}
                </div>
              </div>
              {/* Cancel button — only for open orders */}
              {r.recordType === 'open_order' && (
                <button onClick={() => cancelOrder(r)} disabled={cancellingId === r.id} style={{
                  width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
                  color: '#EF4444', display: 'grid', placeItems: 'center',
                  opacity: cancellingId === r.id ? 0.5 : 1,
                }}>
                  {cancellingId === r.id ? '…' : <Icon name="close" size={14} color="#EF4444" strokeWidth={2.5}/>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NotificationsScreen — trading + system notifications
// ─────────────────────────────────────────────────────────────
function NotificationsScreen({ lang = 'ru', dark = false, onBack = () => {} }) {
  const bg      = dark ? SC.ink1000 : SC.paper;
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const border  = dark ? 'rgba(255,255,255,0.08)' : SC.ink200;
  const fieldBg = dark ? 'rgba(255,255,255,0.07)' : SC.ink50;

  const [tab, setTab]     = React.useState('trading');
  const [notifs, setNotifs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const r = await fetch(`${BYBIT_WORKER}/notifications`);
      if (r.ok) { const d = await r.json(); setNotifs(Array.isArray(d) ? d : []); }
    } catch(_) {}
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await fetch(`${BYBIT_WORKER}/notifications/${id}/read`, { method: 'POST' });
      setNotifs(prev => prev.map(n => String(n.id) === String(id) ? { ...n, read: true } : n));
    } catch(_) {}
  };

  const markAll = async () => {
    try {
      await fetch(`${BYBIT_WORKER}/notifications/read-all`, { method: 'POST' });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch(_) {}
  };

  const tradingTypes = new Set(['order_fill','deposit','withdrawal','order']);
  const filtered = tab === 'system'
    ? notifs.filter(n => n.type === 'system')
    : notifs.filter(n => n.type !== 'system');
  const unreadTotal = notifs.filter(n => !n.read).length;

  const NOTIF_ICONS = { order_fill: '✅', deposit: '💰', withdrawal: '📤', system: '📢' };
  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    const diff = now - d;
    if (diff < 3600000) return Math.floor(diff / 60000) + (lang === 'ru' ? ' мин' : ' min');
    if (diff < 86400000) return Math.floor(diff / 3600000) + (lang === 'ru' ? ' ч' : 'h');
    return d.getDate() + ' ' + (lang === 'ru'
      ? ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()]
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]);
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13,
    background: active ? (dark ? '#fff' : SC.ink1000) : 'transparent',
    color: active ? (dark ? SC.ink1000 : '#fff') : sub,
    transition: 'all 0.15s',
  });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${border}` }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, marginLeft: -6 }}>
          <Icon name="arrLeft" size={22} color={text}/>
        </button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 18, color: text, letterSpacing: '-0.3px' }}>
          {lang === 'ru' ? 'Уведомления' : 'Notifications'}
          {unreadTotal > 0 && <span style={{ marginLeft: 8, fontSize: 12, background: SC.green, color: '#fff', borderRadius: 99, padding: '2px 7px', fontWeight: 700 }}>{unreadTotal}</span>}
        </div>
        {unreadTotal > 0 && (
          <button onClick={markAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: SC.green, fontWeight: 600, fontFamily: SC.fontDisplay }}>
            {lang === 'ru' ? 'Прочитать все' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 4, background: bg }}>
        <div style={{ flex: 1, display: 'flex', background: dark ? 'rgba(255,255,255,0.07)' : SC.ink100, borderRadius: 10, padding: 3 }}>
          <button style={tabStyle(tab === 'trading')} onClick={() => setTab('trading')}>
            📈 {lang === 'ru' ? 'Торговые' : 'Trading'}
          </button>
          <button style={tabStyle(tab === 'system')} onClick={() => setTab('system')}>
            ⚙️ {lang === 'ru' ? 'Системные' : 'System'}
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${border}`, borderTop: `3px solid ${SC.green}`, borderRadius: '50%', animation: 'spin360 0.7s linear infinite' }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: sub, fontSize: 14 }}>
            {tab === 'system'
              ? (lang === 'ru' ? 'Нет системных уведомлений' : 'No system notifications')
              : (lang === 'ru' ? 'Нет торговых уведомлений' : 'No trading notifications')
            }
          </div>
        ) : filtered.map(n => {
          const isUnread = !n.read;
          return (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px',
              borderBottom: `1px solid ${border}`, cursor: isUnread ? 'pointer' : 'default',
              background: isUnread ? (dark ? 'rgba(12,71,183,0.05)' : 'rgba(12,71,183,0.04)') : 'transparent',
            }}>
              <div style={{ fontSize: 22, width: 36, height: 36, display: 'grid', placeItems: 'center', flexShrink: 0,
                borderRadius: 10, background: n.type === 'system' ? 'rgba(99,102,241,0.12)' : (dark ? 'rgba(255,255,255,0.07)' : SC.ink100) }}>
                {NOTIF_ICONS[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: text, letterSpacing: '-0.1px' }}>{n.title}</span>
                  {isUnread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: SC.green, flexShrink: 0, display: 'inline-block' }}/>}
                </div>
                {n.message && <div style={{ fontSize: 13, color: sub, marginBottom: 4, lineHeight: 1.4 }}>{n.message}</div>}
                <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{fmtTime(n.created_at)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ChatScreen — real-time support chat (user side)
// ─────────────────────────────────────────────────────────────
function ChatScreen({ lang = 'ru', dark = false, onBack = () => {} }) {
  const bg    = dark ? SC.ink1000 : SC.paper;
  const text  = dark ? '#fff' : SC.ink1000;
  const sub   = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
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
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${border}` }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: fieldBg, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="arrLeft" size={18} color={text}/>
        </button>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: SC.greenSoft, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="sparkles" size={18} color={SC.greenDeep}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{lang === 'ru' ? 'Поддержка Zaman' : 'Zaman Support'}</div>
          <div style={{ fontSize: 11, color: SC.green, fontWeight: 500 }}>● {lang === 'ru' ? 'Онлайн' : 'Online'}</div>
        </div>
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
            <div style={{ fontSize: 12, color: sub, lineHeight: 1.6 }}>
              {lang === 'ru' ? 'Мы отвечаем в рабочее время. Опишите ваш вопрос — и мы поможем.' : 'We reply during business hours. Describe your question and we will help.'}
            </div>
          </div>
        )}
        {messages.map(m => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isUser ? SC.green : (dark ? 'rgba(255,255,255,0.09)' : SC.ink100),
                color: isUser ? '#fff' : text,
                fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
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

      {/* Input bar */}
      <div style={{ padding: '10px 16px 32px', borderTop: `1px solid ${border}`, display: 'flex', gap: 10, alignItems: 'flex-end', background: bg }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={lang === 'ru' ? 'Сообщение…' : 'Message…'}
          rows={1}
          style={{
            flex: 1, resize: 'none', background: fieldBg, border: `1px solid ${border}`,
            borderRadius: 14, padding: '10px 14px', color: text, fontSize: 14, outline: 'none',
            fontFamily: SC.fontDisplay, lineHeight: 1.5,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: 14, background: input.trim() ? SC.green : (dark ? 'rgba(255,255,255,0.08)' : SC.ink100),
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <Icon name="arrUp" size={20} color={input.trim() ? '#fff' : sub} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  MARKETS_ALL, MarketsScreen, AssetDetailScreen, TradeSheet, QuickTradeSheet, TradeToast,
  ProfileScreen, MenuScreen, MobileAssetsView, HistoryScreen, HomeIdeasNews,
  MOBILE_NEWS_RU, MOBILE_NEWS_EN, MOBILE_IDEAS_RU, MOBILE_IDEAS_EN,
  ALL_NEWS, ALL_IDEAS,
  MobileNewsScreen, MobileIdeasScreen,
  ChatScreen, NotificationsScreen,
});
