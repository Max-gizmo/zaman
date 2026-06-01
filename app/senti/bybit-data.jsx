// Bybit live data — prices via Cloudflare Worker proxy
// Worker: https://senti-bybit.ecoholding-perm.workers.dev
// Account balance (private, signed) + market tickers (public)

const BYBIT_WORKER = 'https://senti-bybit.ecoholding-perm.workers.dev';

// Map our internal symbols to Bybit spot trading pairs
const BYBIT_SYMBOL_MAP = {
  BTC:  'BTCUSDT',
  ETH:  'ETHUSDT',
  USDT: null,         // stablecoin, price always $1
  BNB:  'BNBUSDT',
  SOL:  'SOLUSDT',
  XRP:  'XRPUSDT',
  ADA:  'ADAUSDT',
  DOGE: 'DOGEUSDT',
};

const BYBIT_CRYPTO_SYMBOLS = Object.entries(BYBIT_SYMBOL_MAP)
  .filter(([, v]) => v !== null)
  .map(([, v]) => v);

// Linear (USDT-M) futures: stocks + commodities
// Note: COPPER not available on Bybit linear futures
const BYBIT_FUTURES_SYMBOLS = {
  AAPL:  { bybit: 'AAPLUSDT',  name: 'Apple Inc.',  ccy: '$', cls: 'cfd' },
  NVDA:  { bybit: 'NVDAUSDT',  name: 'Nvidia',      ccy: '$', cls: 'cfd' },
  TSLA:  { bybit: 'TSLAUSDT',  name: 'Tesla',       ccy: '$', cls: 'cfd' },
  GOOGL: { bybit: 'GOOGLUSDT', name: 'Alphabet',    ccy: '$', cls: 'cfd' },
  XAU:   { bybit: 'XAUUSDT',   name: 'Gold',        ccy: '$', cls: 'comm' },
  XAG:   { bybit: 'XAGUSDT',   name: 'Silver',      ccy: '$', cls: 'comm' },
};

// ─────────────────────────────────────────────────────────────
// useBybitPrices — fetches 24h spot tickers
// Returns: { prices: { BTCUSDT: { price, change, high, low, volume } }, loading, error }
// ─────────────────────────────────────────────────────────────
function useBybitPrices(symbols = BYBIT_CRYPTO_SYMBOLS, refreshMs = 600000) {
  const [prices, setPrices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const url = `${BYBIT_WORKER}/prices?symbols=${symbols.join(',')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        const map = {};
        data.forEach(t => {
          if (!t.error) {
            map[t.symbol] = {
              price:     parseFloat(t.lastPrice),
              change:    parseFloat(t.priceChangePercent),
              high:      parseFloat(t.highPrice),
              low:       parseFloat(t.lowPrice),
              volume:    parseFloat(t.volume),
              prevClose: parseFloat(t.prevClosePrice),
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
// useBybitFutures — fetches 24h linear (USDT-M) futures tickers
// Used for: stocks (AAPL/NVDA/TSLA/GOOGL) + commodities (XAU/XAG)
// ─────────────────────────────────────────────────────────────
function useBybitFutures(symbols, refreshMs = 600000) {
  const [prices, setPrices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    if (!symbols || symbols.length === 0) return;
    let alive = true;

    async function load() {
      try {
        const url = `${BYBIT_WORKER}/futures?symbols=${symbols.join(',')}`;
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
// useBybitAccount — fetches signed Unified wallet balances
// Returns: { balances: [{ asset, free, locked, usdValue }], loading, error }
// ─────────────────────────────────────────────────────────────
function useBybitAccount(refreshMs = 600000) {
  const [balances, setBalances] = React.useState([]);
  const [loading, setLoading]  = React.useState(true);
  const [error, setError]      = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${BYBIT_WORKER}/account`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) throw new Error(data.error);
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
// useBybitForex — fetches major forex pairs + KGS rates
// Returns: { prices: { EURUSD: { price, change, ccy, name, group } }, loading, error }
// Source: frankfurter.app (major) + open.er-api.com (KGS/RUB)
// ─────────────────────────────────────────────────────────────
function useBybitForex(refreshMs = 600000) {
  const [prices, setPrices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res  = await fetch(`${BYBIT_WORKER}/forex`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) throw new Error(data.error);
        const map = {};
        (Array.isArray(data) ? data : []).forEach(p => {
          map[p.symbol] = { price: p.price, change: p.change, ccy: p.ccy, name: p.name, group: p.group };
        });
        setPrices(map);
        setLoading(false);
        setError(null);
      } catch(e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }
    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [refreshMs]);

  return { prices, loading, error };
}

// ─────────────────────────────────────────────────────────────
// useBybitIndices — fetches world market indices via stooq.com
// Returns: { prices: { SPX: { price, change, name, region } }, loading, error }
// ─────────────────────────────────────────────────────────────
function useBybitIndices(refreshMs = 600000) {
  const [prices, setPrices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res  = await fetch(`${BYBIT_WORKER}/indices`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) throw new Error(data.error);
        const map = {};
        (Array.isArray(data) ? data : []).forEach(idx => {
          if (!idx.error) {
            map[idx.symbol] = { price: idx.price, change: idx.change, name: idx.name, region: idx.region };
          }
        });
        setPrices(map);
        setLoading(false);
        setError(null);
      } catch(e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }
    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [refreshMs]);

  return { prices, loading, error };
}

// ─────────────────────────────────────────────────────────────
// useBybitHistory — fetches signed spot order history (last 50)
// Returns: { orders: [...], loading, error }
// ─────────────────────────────────────────────────────────────
function useBybitHistory(refreshMs = 3600000) {
  const [orders, setOrders]   = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);
  const [tick, setTick]       = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res  = await fetch(`${BYBIT_WORKER}/history`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) throw new Error(data.error);
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
        setError(null);
      } catch(e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }
    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [refreshMs, tick]);

  const refetch = React.useCallback(() => setTick(t => t + 1), []);
  return { orders, loading, error, refetch };
}

// ─────────────────────────────────────────────────────────────
// BybitStatusBadge — small "live" indicator
// ─────────────────────────────────────────────────────────────
function BybitStatusBadge({ loading, error, dark = false }) {
  const ok    = !loading && !error;
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
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: color,
        boxShadow: ok ? `0 0 6px ${color}` : 'none',
        animation: ok ? 'binance-pulse 2s ease-in-out infinite' : 'none',
      }}/>
      Bybit {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// BybitAccountCard — compact Bybit balance widget
// ─────────────────────────────────────────────────────────────
function BybitAccountCard({ lang = 'ru', dark = false }) {
  const { balances, loading, error } = useBybitAccount();
  const text   = dark ? '#fff' : SC.ink1000;
  const sub    = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const bg     = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${SC.ink200}`;

  return (
    <div style={{ background: bg, borderRadius: 20, padding: '16px 20px', border }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Bybit logo */}
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#F7A600', display: 'grid', placeItems: 'center' }}>
            <svg width="14" height="10" viewBox="0 0 28 20" fill="#1A1A2E">
              <rect x="0"  y="0"  width="8" height="8" rx="1"/>
              <rect x="10" y="0"  width="8" height="8" rx="1"/>
              <rect x="20" y="0"  width="8" height="8" rx="1"/>
              <rect x="0"  y="12" width="8" height="8" rx="1"/>
              <rect x="10" y="12" width="8" height="8" rx="1"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>
            Bybit Unified
          </span>
        </div>
        <BybitStatusBadge loading={loading} error={error} dark={dark}/>
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
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: text }}>
                  {parseFloat(b.free).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                </div>
                {parseFloat(b.usdValue) > 0 && (
                  <div style={{ fontFamily: SC.fontMono, fontSize: 10, color: sub }}>
                    ≈ ${parseFloat(b.usdValue).toFixed(2)}
                  </div>
                )}
              </div>
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

// ─────────────────────────────────────────────────────────────
// useKgsRates — fetches KGS exchange rates once per day
// Returns: { rates: { USD: 88.95, EUR: 95.20, RUB: 0.92, CNY: 12.87, KZT: 0.185 }, loading, error }
// ─────────────────────────────────────────────────────────────
function useKgsRates(refreshMs = 86400000) {
  const [rates, setRates]   = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res  = await fetch(`${BYBIT_WORKER}/kgs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) throw new Error(data.error);
        const map = {};
        (Array.isArray(data) ? data : []).forEach(p => { map[p.symbol] = p.price; });
        setRates(map);
        setLoading(false);
        setError(null);
      } catch(e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }
    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [refreshMs]);

  return { rates, loading, error };
}

// ─────────────────────────────────────────────────────────────
// usePortfolio — fetches holdings from KV backend and enriches
// with live Bybit spot/futures prices
// Returns: { holdings: [{symbol,name,cls,price,ccy,change,qty,spark}], loading, error }
// ─────────────────────────────────────────────────────────────
function usePortfolio(refreshMs = 3600000) {
  const [holdings, setHoldings] = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${BYBIT_WORKER}/portfolio`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = await res.json();
        if (!alive) return;
        if (!Array.isArray(items) || items.length === 0) {
          setHoldings([]); setLoading(false); setError(null); return;
        }

        // Collect symbols needing live prices
        const cryptoSyms = [...new Set(
          items.filter(i => i.category === 'crypto' && !i.manualPrice)
               .map(i => i.symbol.toUpperCase() + 'USDT')
        )];
        const futureSyms = [...new Set(
          items.filter(i => i.category === 'stocks' && !i.manualPrice)
               .map(i => i.symbol.toUpperCase() + 'USDT')
        )];

        const priceMap = {};
        let accountCoins = [];   // Bybit Unified Wallet balances (same source the dashboard adds)
        const fetches = [];
        fetches.push(
          fetch(`${BYBIT_WORKER}/account`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) accountCoins = data; })
            .catch(() => {})
        );
        if (cryptoSyms.length) fetches.push(
          fetch(`${BYBIT_WORKER}/prices?symbols=${cryptoSyms.join(',')}`)
            .then(r => r.json())
            .then(data => data.forEach(p => { if (!p.error) priceMap[p.symbol] = { price: parseFloat(p.lastPrice), change: parseFloat(p.priceChangePercent) }; }))
            .catch(() => {})
        );
        if (futureSyms.length) fetches.push(
          fetch(`${BYBIT_WORKER}/futures?symbols=${futureSyms.join(',')}`)
            .then(r => r.json())
            .then(data => data.forEach(p => { if (!p.error) priceMap[p.symbol] = { price: parseFloat(p.lastPrice), change: parseFloat(p.priceChangePercent) }; }))
            .catch(() => {})
        );
        await Promise.all(fetches);
        if (!alive) return;

        const enriched = items.map(item => {
          const sym = item.symbol.toUpperCase();
          const bybitSym = sym + 'USDT';
          let price = 0, change = 0;
          if (item.manualPrice != null && item.manualPrice !== '') {
            price = parseFloat(item.manualPrice); change = 0;
          } else if (priceMap[bybitSym]) {
            price = priceMap[bybitSym].price; change = priceMap[bybitSym].change;
          } else if (sym === 'USD' || sym === 'USDT' || sym === 'USDC') {
            price = 1; change = 0;
          }
          const clsMap = { crypto: 'crypto', stocks: 'cfd', kg: 'kg', fiat: 'cash', other: 'other' };
          return {
            id:     item.id,
            symbol: sym,
            name:   item.name || sym,
            cls:    clsMap[item.category] || 'other',
            price,
            ccy:    '$',
            change,
            qty:    parseFloat(item.amount) || 0,
            spark:  [],
            note:   item.note || '',
            category: item.category,
            manualPrice: item.manualPrice,
          };
        });

        // Append the Bybit Unified Wallet balances so the total matches the
        // admin dashboard (which sums managed portfolio + Bybit Unified).
        const STABLE = ['USD', 'USDT', 'USDC', 'BUSD'];
        const accountHoldings = accountCoins
          .map(c => {
            const qty = parseFloat(c.walletBalance || 0);
            const usd = parseFloat(c.usdValue || 0);
            if (!(usd > 0)) return null;
            const sym = (c.asset || '').toUpperCase();
            return {
              id: 'bybit-' + sym,
              symbol: sym,
              name: sym,
              cls: STABLE.includes(sym) ? 'cash' : 'crypto',
              price: qty > 0 ? usd / qty : 0,
              ccy: '$',
              change: 0,
              qty,
              spark: [],
              note: 'Bybit Unified',
              category: STABLE.includes(sym) ? 'fiat' : 'crypto',
              source: 'bybit',
            };
          })
          .filter(Boolean);

        setHoldings([...enriched, ...accountHoldings]);
        setLoading(false);
        setError(null);
      } catch(e) {
        if (alive) { setError(e.message); setLoading(false); }
      }
    }
    load();
    const timer = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(timer); };
  }, [refreshMs]);

  return { holdings, loading, error };
}

// ─────────────────────────────────────────────────────────────
// computePortfolioStats — derive balance, day change, allocation from live holdings
// usdKgsRate: live rate from useKgsRates().rates['USD'], fallback 88.95
// ─────────────────────────────────────────────────────────────
function computePortfolioStats(holdings, usdKgsRate) {
  const rate = usdKgsRate || 88.95;
  const totalUsd    = holdings.reduce((s, h) => s + (h.qty || 0) * (h.price || 0), 0);
  const dayChangeUsd = holdings.reduce((s, h) => s + (h.qty || 0) * (h.price || 0) * ((h.change || 0) / 100), 0);
  const groups = {};
  holdings.forEach(h => {
    const g = h.cls === 'crypto' ? 'crypto' : h.cls === 'cfd' ? 'cfd' : h.cls === 'kg' ? 'kg' : 'cash';
    groups[g] = (groups[g] || 0) + (h.qty || 0) * (h.price || 0);
  });
  const colors   = { kg: '#0C47B7', cfd: '#052E80', crypto: '#5C8BEE', cash: '#C7CFCC' };
  const labelsRu = { kg: 'KG рынок', cfd: 'CFD', crypto: 'Крипто', cash: 'Валюта' };
  const labelsEn = { kg: 'KG рынок', cfd: 'CFD', crypto: 'Crypto',  cash: 'Валюта' };
  const mkSegs = lbls => totalUsd > 0
    ? Object.entries(groups).filter(([, v]) => v > 0)
        .map(([id, v]) => ({ id, label: lbls[id] || id, pct: Math.round(v / totalUsd * 100), color: colors[id] }))
    : [];
  return {
    totalKgs:     totalUsd * rate,
    dayChangeKgs: dayChangeUsd * rate,
    dayChangePct: totalUsd > 0 ? dayChangeUsd / totalUsd * 100 : 0,
    allocation:   { ru: mkSegs(labelsRu), en: mkSegs(labelsEn) },
    classCount:   Object.keys(groups).filter(k => groups[k] > 0).length,
  };
}

// ─────────────────────────────────────────────────────────────
// useKlines — fetch OHLCV kline data
// source:
//   'bybit_spot'       → senti-bybit /klines?source=bybit_spot  (crypto spot, e.g. BTCUSDT)
//   'binance_futures'  → senti-binance /klines                   (stocks & commodities)
// ─────────────────────────────────────────────────────────────
const BINANCE_WORKER = 'https://senti-binance.ecoholding-perm.workers.dev';

function useKlines(symbol, interval, limit, source) {
  const [klines, setKlines] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!symbol) { setKlines([]); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setKlines([]);
    const src = source || 'bybit_spot';
    const url = src === 'binance_futures'
      ? `${BINANCE_WORKER}/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`
      : `${BYBIT_WORKER}/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}&source=${src}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { if (alive) { setKlines(Array.isArray(d) ? d : []); setLoading(false); } })
      .catch(() => { if (alive) { setKlines([]); setLoading(false); } });
    return () => { alive = false; };
  }, [symbol, interval, limit, source]);
  return { klines, loading };
}

Object.assign(window, {
  BYBIT_WORKER, BYBIT_SYMBOL_MAP, BYBIT_CRYPTO_SYMBOLS, BYBIT_FUTURES_SYMBOLS,
  useBybitPrices, useBybitFutures, useBybitAccount, useBybitForex, useBybitIndices,
  useKgsRates, useBybitHistory, usePortfolio, BybitStatusBadge, BybitAccountCard,
  computePortfolioStats, useKlines,
});
