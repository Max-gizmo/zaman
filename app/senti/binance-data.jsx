// Binance live data — prices via Cloudflare Worker proxy
// Worker: https://senti-binance.ecoholding-perm.workers.dev
// Account balance (private, signed) + 24h ticker prices (public)

const BINANCE_WORKER = 'https://senti-binance.ecoholding-perm.workers.dev';

// Map our internal symbols to Binance trading pairs
const SYMBOL_MAP = {
  BTC:  'BTCUSDT',
  ETH:  'ETHUSDT',
  USDT: null,         // stablecoin, price always $1
  BNB:  'BNBUSDT',
  SOL:  'SOLUSDT',
  XRP:  'XRPUSDT',
  ADA:  'ADAUSDT',
  DOGE: 'DOGEUSDT',
};

// All crypto symbols we want prices for
const CRYPTO_SYMBOLS = Object.entries(SYMBOL_MAP)
  .filter(([, v]) => v !== null)
  .map(([, v]) => v);

// Futures symbols: stocks + commodities (USDT-M Futures on fapi.binance.com)
const FUTURES_SYMBOLS = {
  // Stocks (CFD)
  AAPL:   { binance: 'AAPLUSDT',   name: 'Apple Inc.',  ccy: '$', cls: 'cfd' },
  NVDA:   { binance: 'NVDAUSDT',   name: 'Nvidia',      ccy: '$', cls: 'cfd' },
  TSLA:   { binance: 'TSLAUSDT',   name: 'Tesla',       ccy: '$', cls: 'cfd' },
  GOOGL:  { binance: 'GOOGLUSDT',  name: 'Alphabet',    ccy: '$', cls: 'cfd' },
  // Commodities
  XAU:    { binance: 'XAUUSDT',    name: 'Gold',        ccy: '$', cls: 'comm' },
  XAG:    { binance: 'XAGUSDT',    name: 'Silver',      ccy: '$', cls: 'comm' },
  COPPER: { binance: 'COPPERUSDT', name: 'Copper',      ccy: '$', cls: 'comm' },
};

// ─────────────────────────────────────────────────────────────
// useBinancePrices — fetches 24h ticker for a list of Binance pairs
// Returns: { prices: { BTCUSDT: { price, change, high, low, volume } }, loading, error }
// ─────────────────────────────────────────────────────────────
function useBinancePrices(symbols = CRYPTO_SYMBOLS, refreshMs = 600000) {
  const [prices, setPrices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const url = `${BINANCE_WORKER}/prices?symbols=${symbols.join(',')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        const map = {};
        data.forEach(t => {
          map[t.symbol] = {
            price:    parseFloat(t.lastPrice),
            change:   parseFloat(t.priceChangePercent),
            high:     parseFloat(t.highPrice),
            low:      parseFloat(t.lowPrice),
            volume:   parseFloat(t.volume),
            prevClose: parseFloat(t.prevClosePrice),
          };
        });
        setPrices(map);
        setLoading(false);
        setError(null);
      } catch (e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }

    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [symbols.join(','), refreshMs]);

  return { prices, loading, error };
}

// ─────────────────────────────────────────────────────────────
// useBinanceFutures — fetches 24h ticker from USDT-M Futures
// Used for: stocks (AAPL/NVDA/TSLA/GOOGL) + commodities (XAU/XAG/COPPER)
// Returns: { prices: { NVDAUSDT: { price, change, high, low, volume } }, loading, error }
// ─────────────────────────────────────────────────────────────
function useBinanceFutures(symbols, refreshMs = 600000) {
  const [prices, setPrices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    if (!symbols || symbols.length === 0) return;
    let alive = true;

    async function load() {
      try {
        const url = `${BINANCE_WORKER}/futures?symbols=${symbols.join(',')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        const map = {};
        data.forEach(t => {
          if (!t.error) {
            map[t.symbol] = {
              price:  parseFloat(t.lastPrice),
              change: parseFloat(t.priceChangePercent),
              high:   parseFloat(t.highPrice),
              low:    parseFloat(t.lowPrice),
              volume: parseFloat(t.volume),
            };
          }
        });
        setPrices(map);
        setLoading(false);
        setError(null);
      } catch (e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }

    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [symbols.join(','), refreshMs]);

  return { prices, loading, error };
}

// ─────────────────────────────────────────────────────────────
// useBinanceAccount — fetches signed account balances
// Returns: { balances: [{ asset, free, locked }], loading, error }
// ─────────────────────────────────────────────────────────────
function useBinanceAccount(refreshMs = 600000) {
  const [balances, setBalances] = React.useState([]);
  const [loading, setLoading]  = React.useState(true);
  const [error, setError]      = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${BINANCE_WORKER}/account`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setBalances(Array.isArray(data) ? data : []);
        setLoading(false);
        setError(null);
      } catch (e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }

    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [refreshMs]);

  return { balances, loading, error };
}

// ─────────────────────────────────────────────────────────────
// BinanceStatusBadge — small "live" indicator shown next to crypto data
// ─────────────────────────────────────────────────────────────
function BinanceStatusBadge({ loading, error, dark = false }) {
  const ok = !loading && !error;
  const color = loading ? SC.ink400 : error ? '#EF4444' : SC.green;
  const label = loading ? '…' : error ? 'offline' : 'live';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 999,
      background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
      color: dark ? 'rgba(255,255,255,0.6)' : SC.ink500,
      fontFamily: SC.fontMono,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color,
        boxShadow: ok ? `0 0 6px ${color}` : 'none',
        animation: ok ? 'binance-pulse 2s ease-in-out infinite' : 'none',
      }}/>
      Binance {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// BinanceAccountCard — compact account balance widget
// ─────────────────────────────────────────────────────────────
function BinanceAccountCard({ lang = 'ru', dark = false }) {
  const { balances, loading, error } = useBinanceAccount();
  const text = dark ? '#fff' : SC.ink1000;
  const sub  = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const bg   = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${SC.ink200}`;

  return (
    <div style={{ background: bg, borderRadius: 20, padding: '16px 20px', border }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Binance logo mark */}
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#F0B90B', display: 'grid', placeItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1E1E1E">
              <path d="M12 2L7.5 6.5 12 11l4.5-4.5L12 2zM2 12l4.5-4.5L11 12l-4.5 4.5L2 12zm10 0l4.5-4.5L21 12l-4.5 4.5L12 12zm0 5l4.5 4.5L12 22l-4.5-4.5L12 17z"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>
            {lang === 'ru' ? 'Binance Spot' : 'Binance Spot'}
          </span>
        </div>
        <BinanceStatusBadge loading={loading} error={error} dark={dark}/>
      </div>

      {/* Balance content */}
      {loading && (
        <div style={{ fontSize: 12, color: sub, fontFamily: SC.fontMono }}>
          {lang === 'ru' ? 'Загрузка…' : 'Loading…'}
        </div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: '#EF4444' }}>{error}</div>
      )}
      {!loading && !error && balances.length === 0 && (
        <div style={{ fontSize: 12, color: sub, letterSpacing: '-0.1px' }}>
          {lang === 'ru' ? 'Аккаунт подключён · Активов нет' : 'Account connected · No assets'}
        </div>
      )}
      {!loading && !error && balances.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {balances.map(b => (
            <div key={b.asset} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TickerLogo symbol={b.asset} size={28}/>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: text }}>{b.asset}</span>
              <span style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: text }}>
                {parseFloat(b.free).toLocaleString('en-US', { maximumFractionDigits: 6 })}
              </span>
              {parseFloat(b.locked) > 0 && (
                <span style={{ fontFamily: SC.fontMono, fontSize: 11, color: sub }}>
                  +{parseFloat(b.locked).toLocaleString('en-US', { maximumFractionDigits: 6 })} locked
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// CSS animation for pulsing dot
(function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes binance-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(1.5); }
    }
  `;
  document.head.appendChild(style);
})();

Object.assign(window, {
  BINANCE_WORKER, SYMBOL_MAP, CRYPTO_SYMBOLS, FUTURES_SYMBOLS,
  useBinancePrices, useBinanceFutures, useBinanceAccount,
  BinanceStatusBadge, BinanceAccountCard,
});
