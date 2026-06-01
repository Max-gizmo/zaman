// Web prototype extra screens — Markets table view, Asset detail, Exchange, History

// Live asset definitions — crypto from Bybit spot, CFD/comm from Binance TradFi futures
const LIVE_ASSETS = {
  // Crypto spot — Bybit
  crypto: [
    { symbol: 'BTC',  name: 'Bitcoin',   bybit: 'BTCUSDT',  ccy: '$', cls: 'crypto', src: 'Bybit' },
    { symbol: 'ETH',  name: 'Ethereum',  bybit: 'ETHUSDT',  ccy: '$', cls: 'crypto', src: 'Bybit' },
    { symbol: 'BNB',  name: 'BNB',       bybit: 'BNBUSDT',  ccy: '$', cls: 'crypto', src: 'Bybit' },
    { symbol: 'SOL',  name: 'Solana',    bybit: 'SOLUSDT',  ccy: '$', cls: 'crypto', src: 'Bybit' },
    { symbol: 'XRP',  name: 'XRP',       bybit: 'XRPUSDT',  ccy: '$', cls: 'crypto', src: 'Bybit' },
    { symbol: 'ADA',  name: 'Cardano',   bybit: 'ADAUSDT',  ccy: '$', cls: 'crypto', src: 'Bybit' },
    { symbol: 'DOGE', name: 'Dogecoin',  bybit: 'DOGEUSDT', ccy: '$', cls: 'crypto', src: 'Bybit' },
  ],
  // CFD stocks — Binance TradFi futures (TRADIFI_PERPETUAL)
  cfd: [
    { symbol: 'AAPL',  name: 'Apple Inc.',  binance: 'AAPLUSDT',  ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'NVDA',  name: 'Nvidia',      binance: 'NVDAUSDT',  ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'TSLA',  name: 'Tesla',       binance: 'TSLAUSDT',  ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'GOOGL', name: 'Alphabet',    binance: 'GOOGLUSDT', ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'AMZN',  name: 'Amazon',      binance: 'AMZNUSDT',  ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'META',  name: 'Meta',        binance: 'METAUSDT',  ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'MSFT',  name: 'Microsoft',   binance: 'MSFTUSDT',  ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'JPM',   name: 'JPMorgan',    binance: 'JPMUSDT',   ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'WMT',   name: 'Walmart',     binance: 'WMTUSDT',   ccy: '$', cls: 'cfd', src: 'Binance' },
    { symbol: 'AMD',   name: 'AMD',         binance: 'AMDUSDT',   ccy: '$', cls: 'cfd', src: 'Binance' },
  ],
  // Commodities — Binance TradFi futures (TRADIFI_PERPETUAL)
  comm: [
    { symbol: 'XAU',    name: 'Gold',         binance: 'XAUUSDT',    ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'XAG',    name: 'Silver',       binance: 'XAGUSDT',    ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'XPT',    name: 'Platinum',     binance: 'XPTUSDT',    ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'XPD',    name: 'Palladium',    binance: 'XPDUSDT',    ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'COPPER', name: 'Copper',       binance: 'COPPERUSDT', ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'WTI',    name: 'WTI Crude',    binance: 'CLUSDT',     ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'BRENT',  name: 'Brent Crude',  binance: 'BZUSDT',     ccy: '$', cls: 'comm', src: 'Binance' },
    { symbol: 'NATGAS', name: 'Natural Gas',  binance: 'NATGASUSDT', ccy: '$', cls: 'comm', src: 'Binance' },
  ],
};

// Shared live row — works for all live asset types
function LiveAssetRow({ asset, price, change, volume, dark, border, sub, lang, onAsset }) {
  const text = dark ? '#fff' : SC.ink1000;
  const src = asset.src || 'Live';
  const fmtPrice = p => p > 10000
    ? p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : p > 1000
    ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p >= 1
    ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : p.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });

  return (
    <div onClick={() => onAsset && onAsset({ ...asset, price: price || 0, change: change || 0,
        spark: change >= 0 ? [100,101,100,102,103,102,104] : [104,103,102,101,102,100,99] })}
      style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 0.8fr', gap: 12,
        padding: '14px 4px', alignItems: 'center', borderBottom: border, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TickerLogo symbol={asset.symbol} size={36}/>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px', color: text }}>{asset.symbol}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4,
              background: dark ? 'rgba(255,255,255,0.07)' : SC.ink100,
              color: sub, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{src}</span>
          </div>
          <div style={{ fontSize: 12, color: sub }}>{asset.name}</div>
        </div>
      </div>
      <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, textAlign: 'right', color: text }}>
        {price != null ? `$${fmtPrice(price)}` : <span style={{ color: sub }}>…</span>}
      </div>
      <div style={{ textAlign: 'right' }}>
        {change != null ? <DeltaPill value={change}/> : <span style={{ color: sub, fontSize: 12 }}>…</span>}
      </div>
      <div style={{ fontFamily: SC.fontMono, fontSize: 13, color: sub, textAlign: 'right' }}>
        {volume && price ? `$${(volume * price / 1e6).toFixed(0)}M` : '—'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {change != null
          ? <Sparkline data={change >= 0
              ? [100,101,100,102,101,103,102,104]
              : [104,103,102,101,102,100,101,99]}
              width={80} height={28} color={change >= 0 ? SC.green : '#EF4444'}/>
          : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Pill variant={dark ? 'softDark' : 'soft'} size="sm">{t(lang, 'buy')} →</Pill>
      </div>
    </div>
  );
}

function WebMarketsView({ lang = 'ru', dark = false, onAsset }) {
  const [cls, setCls] = React.useState('crypto');

  // Bybit: crypto spot prices
  const bybitSpotSymbols = LIVE_ASSETS.crypto.map(a => a.bybit);
  const { prices: spotPrices, loading: spotLoading, error: spotError } =
    typeof useBybitPrices === 'function' ? useBybitPrices(bybitSpotSymbols) : { prices: {}, loading: false, error: null };

  // Binance: CFD stocks + commodities (TradFi futures)
  const binanceFutSymbols = [...LIVE_ASSETS.cfd, ...LIVE_ASSETS.comm].map(a => a.binance);
  const { prices: binanceFutPrices, loading: binanceFutLoading, error: binanceFutError } =
    typeof useBinanceFutures === 'function' ? useBinanceFutures(binanceFutSymbols) : { prices: {}, loading: false, error: null };

  // KGS rates — once per day
  const { rates: kgsRates, loading: kgsLoading, error: kgsError } =
    typeof useKgsRates === 'function' ? useKgsRates() : { rates: {}, loading: false, error: null };

  const LIVE_TABS = ['crypto', 'cfd', 'comm', 'forex'];
  const isLiveTab = LIVE_TABS.includes(cls);
  const liveLoading = cls === 'crypto' ? spotLoading : cls === 'forex' ? kgsLoading : binanceFutLoading;
  const liveError   = cls === 'crypto' ? spotError   : cls === 'forex' ? kgsError   : binanceFutError;
  const srcLabel    = cls === 'crypto' ? 'Bybit' : cls === 'forex' ? 'live' : 'Binance';

  const tabs = [
    { id: 'crypto', label: lang === 'ru' ? 'Крипто' : 'Crypto' },
    { id: 'cfd',    label: 'CFD' },
    { id: 'comm',   label: lang === 'ru' ? 'Товары' : 'Comm.' },
    { id: 'forex',  label: lang === 'ru' ? 'Валюта' : 'Currency' },
    { id: 'kg',     label: 'KG' },
  ];
  const filtered = MARKETS_ALL.filter(m => m.cls === cls);
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  return (
    <div style={{ padding: '24px 32px 32px', height: '100%', overflow: 'auto', color: text, fontFamily: SC.fontDisplay }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>{t(lang, 'markets')}</h1>
        {isLiveTab && liveLoading === false && !liveError && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999,
            background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: dark ? 'rgba(255,255,255,0.6)' : SC.ink500, fontFamily: SC.fontMono }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: SC.green,
              boxShadow: `0 0 6px ${SC.green}`, animation: 'binance-pulse 2s ease-in-out infinite' }}/>
            {srcLabel} live
          </span>
        )}
        {isLiveTab && liveLoading && (
          <span style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>…</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map(tg => (
          <button key={tg.id} onClick={() => setCls(tg.id)} style={{
            background: cls === tg.id ? (dark ? '#fff' : SC.ink1000) : (dark ? 'rgba(255,255,255,0.06)' : SC.ink100),
            color: cls === tg.id ? (dark ? SC.ink1000 : '#fff') : sub,
            border: 'none', cursor: 'pointer',
            padding: '8px 16px', borderRadius: 999,
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px', fontFamily: SC.fontDisplay,
          }}>{tg.label}</button>
        ))}
      </div>
      <div style={{ background: cardBg, borderRadius: 24, border, padding: '8px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 0.8fr', gap: 12,
          padding: '14px 4px', fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', borderBottom: border }}>
          <span>{lang === 'ru' ? 'Актив' : 'Asset'}</span>
          <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Цена' : 'Price'}</span>
          <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'За сегодня' : 'Today'}</span>
          <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Объём' : 'Volume'}</span>
          <span style={{ textAlign: 'center' }}>{lang === 'ru' ? 'Тренд' : 'Trend'}</span>
          <span></span>
        </div>

        {/* Crypto — Bybit spot */}
        {cls === 'crypto' && LIVE_ASSETS.crypto.map((asset, i, arr) => {
          const live = spotPrices[asset.bybit] || {};
          return <LiveAssetRow key={asset.symbol} asset={asset} lang={lang} dark={dark} sub={sub}
            price={live.price} change={live.change} volume={live.volume} onAsset={onAsset}
            border={i === arr.length - 1 ? 'none' : border}/>;
        })}
        {/* CFD stocks — Binance TradFi futures */}
        {cls === 'cfd' && LIVE_ASSETS.cfd.map((asset, i, arr) => {
          const live = binanceFutPrices[asset.binance] || {};
          return <LiveAssetRow key={asset.symbol} asset={asset} lang={lang} dark={dark} sub={sub}
            price={live.price} change={live.change} volume={live.volume} onAsset={onAsset}
            border={i === arr.length - 1 ? 'none' : border}/>;
        })}
        {/* Commodities — Binance TradFi futures */}
        {cls === 'comm' && LIVE_ASSETS.comm.map((asset, i, arr) => {
          const live = binanceFutPrices[asset.binance] || {};
          return <LiveAssetRow key={asset.symbol} asset={asset} lang={lang} dark={dark} sub={sub}
            price={live.price} change={live.change} volume={live.volume} onAsset={onAsset}
            border={i === arr.length - 1 ? 'none' : border}/>;
        })}

        {/* Forex (Валюта) — KGS rates, daily refresh */}
        {cls === 'forex' && MARKETS_ALL.filter(m => m.cls === 'forex').map((h, i, arr) => {
          const livePrice = kgsRates[h.symbol];
          const display = { ...h, price: livePrice != null ? livePrice : h.price };
          return (
          <div key={h.symbol + i} onClick={() => onAsset && onAsset(display)} style={{
            display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 0.8fr', gap: 12,
            padding: '14px 4px', alignItems: 'center',
            borderBottom: i === arr.length - 1 ? 'none' : border, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TickerLogo symbol={h.symbol} size={36}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{h.symbol}</div>
                <div style={{ fontSize: 12, color: sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{h.name}</div>
              </div>
            </div>
            <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
              {display.ccy}{display.price.toLocaleString('en-US', { minimumFractionDigits: display.price < 1 ? 4 : 2, maximumFractionDigits: display.price < 1 ? 4 : 3 })}
            </div>
            <div style={{ textAlign: 'right' }}><DeltaPill value={display.change}/></div>
            <div style={{ fontFamily: SC.fontMono, fontSize: 13, color: sub, textAlign: 'right' }}>—</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Sparkline data={h.spark} width={80} height={28}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pill variant={dark ? 'softDark' : 'soft'} size="sm">{t(lang, 'buy')} →</Pill>
            </div>
          </div>
          );
        })}

        {/* KG stocks — static (КФБ) */}
        {cls === 'kg' && MARKETS_ALL.filter(m => m.cls === 'kg').map((h, i, arr) => (
          <div key={h.symbol + i} onClick={() => onAsset && onAsset(h)} style={{
            display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 0.8fr', gap: 12,
            padding: '14px 4px', alignItems: 'center',
            borderBottom: i === arr.length - 1 ? 'none' : border, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TickerLogo symbol={h.symbol} size={36}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{h.symbol}</div>
                <div style={{ fontSize: 12, color: sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{h.name}</div>
              </div>
            </div>
            <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
              {h.ccy}{h.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ textAlign: 'right' }}><DeltaPill value={h.change}/></div>
            <div style={{ fontFamily: SC.fontMono, fontSize: 13, color: sub, textAlign: 'right' }}>42K</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Sparkline data={h.spark} width={80} height={28}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pill variant={dark ? 'softDark' : 'soft'} size="sm">{t(lang, 'buy')} →</Pill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Asset detail page (web)
// ─────────────────────────────────────────────────────────────
function WebAssetDetail({ asset, lang = 'ru', dark = false, onBack, onTrade }) {
  const [tradeSide, setTradeSide] = React.useState('buy');
  const [tradeAmt,  setTradeAmt]  = React.useState('');
  const [period, setPeriod] = React.useState('1D');

  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  const numericAmt = parseFloat(tradeAmt || '0') || 0;
  const tooLow = numericAmt > 0 && numericAmt < 5;
  const canSubmit = numericAmt >= 5;
  const qty = asset.price > 0 ? numericAmt / asset.price : 0;
  const isBuy = tradeSide === 'buy';

  // Live klines — crypto: Bybit spot; cfd/comm: Binance futures
  // COMM_SYM_MAP: symbol used on Binance futures for commodities
  const COMM_SYM_MAP = { XAU: 'XAUUSDT', XAG: 'XAGUSDT', XPT: 'XPTUSDT', XPD: 'XPDUSDT',
    COPPER: 'COPPERUSDT', WTI: 'CLUSDT', BRENT: 'BZUSDT', NATGAS: 'NATGASUSDT' };
  const canLive = asset.cls === 'crypto' || asset.cls === 'cfd' || asset.cls === 'comm';
  const rawSym = asset.symbol.toUpperCase();
  const klSym = canLive
    ? (asset.cls === 'comm' ? (COMM_SYM_MAP[rawSym] || rawSym + 'USDT') : rawSym + 'USDT')
    : null;
  const klSrc = asset.cls === 'crypto' ? 'bybit_spot' : 'binance_futures';
  const { interval, limit } = (typeof KLINE_PERIODS !== 'undefined' ? KLINE_PERIODS : {
    '1H':{ interval:'1m', limit:60 }, '1D':{ interval:'1h', limit:24 },
    '7D':{ interval:'4h', limit:42 }, '1M':{ interval:'1d', limit:30 },
    '3M':{ interval:'1d', limit:90 }, '1Y':{ interval:'1w', limit:52 },
  })[period];
  const { klines, loading } = typeof useKlines === 'function'
    ? useKlines(klSym, interval, limit, klSrc)
    : { klines: [], loading: false };

  const periodChange = klines.length >= 2
    ? ((klines[klines.length - 1].c - klines[0].c) / klines[0].c * 100)
    : asset.change;
  const up = periodChange >= 0;

  const periods = ['1H','1D','7D','1M','3M','1Y'];
  const pLabels = lang === 'ru'
    ? { '1H':'1Ч', '1D':'1Д', '7D':'7Д', '1M':'1М', '3M':'3М', '1Y':'1Г' }
    : { '1H':'1H', '1D':'1D', '7D':'7D', '1M':'1M', '3M':'3M', '1Y':'1Y' };

  return (
    <div style={{ padding: '24px 32px 32px', height: '100%', overflow: 'auto', color: text, fontFamily: SC.fontDisplay }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, fontSize: 13, fontWeight: 500, marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SC.fontDisplay }}>
        <Icon name="chevL" size={14} color={sub}/> {t(lang, 'markets')}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* main */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <TickerLogo symbol={asset.symbol} size={56}/>
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>{asset.symbol}</div>
              <div style={{ fontSize: 14, color: sub }}>{asset.name}</div>
            </div>
            <div style={{ flex: 1 }}/>
            <button style={{ width: 38, height: 38, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Icon name="star" size={18} color={sub}/>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 16 }}>
            <span style={{ fontFamily: SC.fontMono, fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em' }}>
              {asset.ccy}{asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <DeltaPill value={periodChange} size="md"/>
          </div>
          {/* chart */}
          <div style={{ marginTop: 20, background: cardBg, borderRadius: 24, border, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 4, marginBottom: 12 }}>
              {periods.map(p => (
                <span key={p} onClick={() => setPeriod(p)} style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: period === p ? (dark ? '#fff' : SC.ink1000) : 'transparent',
                  color: period === p ? (dark ? SC.ink1000 : '#fff') : sub,
                  fontSize: 11, fontWeight: 600, fontFamily: SC.fontMono, cursor: 'pointer',
                }}>{pLabels[p]}</span>
              ))}
            </div>
            <CandleChart
              data={klines}
              loading={loading}
              height={280}
              dark={dark}
              interval={interval}
              noDataLabel={canLive ? (lang === 'ru' ? 'Загрузка…' : 'Loading…') : (lang === 'ru' ? 'График недоступен' : 'No chart data')}
            />
          </div>
          {/* Stats — live from klines */}
          {(() => {
            const hi = klines.length ? Math.max(...klines.map(k => k.h)) : null;
            const lo = klines.length ? Math.min(...klines.map(k => k.l)) : null;
            const vol = klines.length ? klines.reduce((s, k) => s + k.v, 0) : null;
            const fmtV = v => v == null ? '—' : v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`;
            const fmtP = v => v == null ? '—' : v >= 10000 ? v.toLocaleString('en-US',{maximumFractionDigits:0}) : v >= 1 ? v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) : v.toPrecision(4);
            const volUsd = vol != null ? vol * (asset.price || 0) : null;
            const pL = pLabels[period] || period;
            const stats = [
              [lang === 'ru' ? `Макс. ${pL}` : `${pL} high`,  hi != null ? `${asset.ccy}${fmtP(hi)}` : '—'],
              [lang === 'ru' ? `Мин. ${pL}`  : `${pL} low`,   lo != null ? `${asset.ccy}${fmtP(lo)}` : '—'],
              [lang === 'ru' ? `Объём ${pL}` : `${pL} vol.`,  fmtV(volUsd)],
              [lang === 'ru' ? 'Изменение'   : 'Change',      klines.length >= 2 ? `${periodChange >= 0 ? '+' : ''}${periodChange.toFixed(2)}%` : '—'],
            ];
            return (
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {stats.map(([k, v], i) => (
                  <div key={i} style={{ background: cardBg, borderRadius: 18, border, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: sub, fontWeight: 500, letterSpacing: '-0.1px', marginBottom: 6 }}>{k}</div>
                    <div style={{ fontFamily: SC.fontMono, fontSize: 15, fontWeight: 600, color: text }}>{v}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        {/* trade panel */}
        <aside>
          <div style={{ background: cardBg, borderRadius: 24, border, padding: 20, position: 'sticky', top: 0 }}>
            {/* Buy / Sell toggle */}
            <div style={{ display: 'flex', background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100, borderRadius: 12, padding: 3, marginBottom: 18 }}>
              <button onClick={() => setTradeSide('buy')} style={{
                flex: 1, background: isBuy ? SC.green : 'transparent', color: isBuy ? '#fff' : sub,
                border: 'none', cursor: 'pointer', padding: '10px 0', borderRadius: 10,
                fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.2px',
                transition: 'background 0.15s, color 0.15s',
              }}>{t(lang, 'buy')}</button>
              <button onClick={() => setTradeSide('sell')} style={{
                flex: 1, background: !isBuy ? SC.ink1000 : 'transparent', color: !isBuy ? '#fff' : sub,
                border: 'none', cursor: 'pointer', padding: '10px 0', borderRadius: 10,
                fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.2px',
                transition: 'background 0.15s, color 0.15s',
              }}>{t(lang, 'sell')}</button>
            </div>
            {/* Amount input */}
            <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {lang === 'ru' ? 'Сумма, USD' : 'Amount, USD'}
            </div>
            <div style={{
              background: dark ? 'rgba(255,255,255,0.05)' : SC.ink50, borderRadius: 14,
              padding: '14px 16px', display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8,
              border: tooLow ? '1.5px solid #EF4444' : '1.5px solid transparent',
            }}>
              <span style={{ fontFamily: SC.fontMono, fontSize: 22, color: sub }}>$</span>
              <input
                type="number" min="0" step="0.01"
                value={tradeAmt}
                onChange={e => setTradeAmt(e.target.value)}
                placeholder="0"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: SC.fontMono, fontSize: 24, fontWeight: 700,
                  color: tooLow ? '#EF4444' : text, letterSpacing: '-0.03em',
                  width: '100%',
                }}
              />
              {numericAmt > 0 && (
                <span style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, whiteSpace: 'nowrap' }}>
                  ≈ {qty < 0.0001 ? qty.toExponential(3) : qty.toFixed(qty < 1 ? 6 : 4)} {asset.symbol}
                </span>
              )}
            </div>
            {tooLow && (
              <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 8 }}>
                {lang === 'ru' ? 'Минимальная сумма — $5' : 'Minimum amount — $5'}
              </div>
            )}
            {/* Quick chips */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[5, 10, 25, 100].map(v => (
                <button key={v} onClick={() => setTradeAmt(String(v))} style={{
                  flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8,
                  background: numericAmt === v ? (isBuy ? SC.green : SC.ink1000) : (dark ? 'rgba(255,255,255,0.05)' : SC.ink100),
                  color: numericAmt === v ? '#fff' : text,
                  fontFamily: SC.fontMono, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: 'none', transition: 'background 0.15s',
                }}>${v}</button>
              ))}
            </div>
            {/* Summary */}
            <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : SC.ink50, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              {[
                [lang === 'ru' ? 'Комиссия Zaman' : 'Zaman fee', numericAmt > 0 ? `$${(numericAmt * 0.0025).toFixed(4)}` : '—'],
                [lang === 'ru' ? 'Курс ' + asset.symbol : asset.symbol + ' price', `$${asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`],
                [isBuy ? (lang === 'ru' ? 'Получите' : 'You get') : (lang === 'ru' ? 'Продаёте' : 'You sell'),
                  canSubmit ? `${qty < 0.0001 ? qty.toExponential(3) : qty.toFixed(6)} ${asset.symbol}` : '—'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: sub }}>{k}</span>
                  <span style={{ fontFamily: SC.fontMono, fontWeight: 600, color: text }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ opacity: canSubmit ? 1 : 0.45, transition: 'opacity 0.2s' }}>
              <Pill variant={isBuy ? 'primary' : 'dark'} size="lg" arrow full
                onClick={() => canSubmit && onTrade && onTrade(tradeSide, asset)}>
                {isBuy ? t(lang, 'buy') : t(lang, 'sell')} {canSubmit ? `$${numericAmt}` : `(min $5)`}
              </Pill>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Web exchange screen — KGS swap
// ─────────────────────────────────────────────────────────────
function WebExchange({ lang = 'ru', dark = false }) {
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  return (
    <div style={{ padding: '24px 32px 32px', height: '100%', overflow: 'auto', color: text, fontFamily: SC.fontDisplay }}>
      <h1 style={{ margin: '4px 0 6px', fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>{t(lang, 'exchange')}</h1>
      <div style={{ fontSize: 14, color: sub, marginBottom: 26 }}>
        {lang === 'ru' ? 'Без комиссии до 100 000 с / мес.' : 'Fee-free up to 100,000 KGS / month.'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 28 }}>
        <div style={{ background: cardBg, borderRadius: 24, border, padding: 24 }}>
          {/* From */}
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {lang === 'ru' ? 'Отдаёте' : 'You send'}
          </div>
          <div style={{ background: fieldBg, borderRadius: 18, padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <TickerLogo symbol="KGS" size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SC.fontMono, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>50 000</div>
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{lang === 'ru' ? 'Баланс: 87 421 с' : 'Balance: 87,421 KGS'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : '#fff', fontWeight: 600, fontSize: 13 }}>
              KGS <Icon name="chevD" size={14} color={text}/>
            </div>
          </div>
          {/* Swap icon */}
          <div style={{ display: 'grid', placeItems: 'center', margin: '4px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: SC.green, display: 'grid', placeItems: 'center', boxShadow: '0 6px 14px -2px rgba(12,71,183,0.45)' }}>
              <Icon name="swap" size={18} color="#fff"/>
            </div>
          </div>
          {/* To */}
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8, marginTop: 6 }}>
            {lang === 'ru' ? 'Получаете' : 'You get'}
          </div>
          <div style={{ background: fieldBg, borderRadius: 18, padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <TickerLogo symbol="USD" size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SC.fontMono, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>561,86</div>
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{lang === 'ru' ? 'Курс 88,95 с/$' : 'Rate 88.95 KGS/$'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : '#fff', fontWeight: 600, fontSize: 13 }}>
              USD <Icon name="chevD" size={14} color={text}/>
            </div>
          </div>
          <Pill variant="primary" size="lg" arrow full>{lang === 'ru' ? 'Обменять' : 'Exchange'}</Pill>
        </div>
        {/* Rates panel */}
        <div>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            {lang === 'ru' ? 'Курсы на сегодня' : 'Today\u2019s rates'}
          </div>
          <div style={{ background: cardBg, borderRadius: 24, border, overflow: 'hidden' }}>
            {[
              { from: 'USD', to: 'KGS', rate: 88.95,  change: -0.1, spark: [89.1,89.05,89.0,88.98,88.96,88.95,88.95] },
              { from: 'EUR', to: 'KGS', rate: 95.20,  change:  0.3, spark: [94.7,94.9,95.0,95.1,95.0,95.15,95.2] },
              { from: 'RUB', to: 'KGS', rate:  0.92,  change:  0.2, spark: [0.91,0.91,0.92,0.92,0.92,0.92,0.92] },
              { from: 'KZT', to: 'KGS', rate:  0.18,  change: -0.1, spark: [0.181,0.18,0.18,0.18,0.18,0.18,0.18] },
              { from: 'BTC', to: 'KGS', rate: 6178350, change: 0.4, spark: [69100,69300,69200,69500,69300,69400,69420] },
            ].map((r, i, arr) => (
              <div key={r.from} style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12,
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i === arr.length - 1 ? 'none' : border,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TickerLogo symbol={r.from} size={32}/>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{r.from} / {r.to}</div>
                </div>
                <div style={{ fontFamily: SC.fontMono, fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
                  {r.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ textAlign: 'right' }}><DeltaPill value={r.change}/></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={r.spark} width={80} height={26}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// History screen — live Bybit orders + deposits + withdrawals
// ─────────────────────────────────────────────────────────────
function WebHistory({ lang = 'ru', dark = false }) {
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg  = dark ? SC.ink900 : SC.paper;
  const border  = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;

  const [tab, setTab] = React.useState('all');

  const { orders: allRecords, loading, error } = typeof useBybitHistory === 'function'
    ? useBybitHistory(3600000)
    : { orders: [], loading: false, error: null };

  const tabs = lang === 'ru'
    ? [{ id: 'all', label: 'Все' }, { id: 'open', label: 'Активные' }, { id: 'order', label: 'Исполненные' }, { id: 'transfer', label: 'Переводы' }]
    : [{ id: 'all', label: 'All' }, { id: 'open', label: 'Open' }, { id: 'order', label: 'Filled' }, { id: 'transfer', label: 'Transfers' }];

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
  function fmtAmount(val, coin) {
    const n = parseFloat(val);
    if (!n) return '—';
    const stables = ['USDT','USDC','BUSD','DAI'];
    if (stables.includes(coin)) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${coin}`;
  }
  function fmtValue(val) {
    const n = parseFloat(val);
    if (!n) return '—';
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function fmtQty(qty, sym) {
    const n = parseFloat(qty);
    if (!n) return '—';
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${fmtSym(sym)}`;
  }
  function fmtPrice(p) {
    const n = parseFloat(p);
    if (!n) return '—';
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
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

  // Per-record type label + icon
  function typeInfo(r) {
    if (r.recordType === 'deposit')    return { label: lang === 'ru' ? 'Пополнение' : 'Deposit',  icon: '↓', color: SC.greenDeep, bg: dark ? 'rgba(12,71,183,0.18)' : SC.greenWash };
    if (r.recordType === 'withdrawal') return { label: lang === 'ru' ? 'Вывод' : 'Withdrawal',    icon: '↑', color: '#EF4444',   bg: dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2' };
    if (r.recordType === 'open_order') {
      const isBuy = r.side === 'Buy';
      return {
        label: lang === 'ru' ? (isBuy ? 'Лимит ↑' : 'Лимит ↓') : (isBuy ? 'Limit Buy' : 'Limit Sell'),
        icon: isBuy ? '↑' : '↓', color: '#F7A600',
        bg: dark ? 'rgba(247,166,0,0.15)' : '#FFF7E6',
      };
    }
    if (r.side === 'Buy')  return { label: lang === 'ru' ? 'Покупка' : 'Buy',   icon: '↑', color: SC.greenDeep, bg: dark ? 'rgba(12,71,183,0.18)' : SC.greenWash };
    return { label: lang === 'ru' ? 'Продажа' : 'Sell', icon: '↓', color: '#EF4444', bg: dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2' };
  }

  function renderRow(r, i, arr) {
    const ti  = typeInfo(r);
    const isTransfer  = r.recordType === 'deposit' || r.recordType === 'withdrawal';
    const isOpenOrder = r.recordType === 'open_order';
    const sym = isTransfer ? r.symbol : fmtSym(r.symbol);
    const subText = isTransfer
      ? (r.chain || r.orderType)
      : r.orderType + (r.category === 'linear' ? ' · Futures' : '');

    // For open orders: show limit price × remaining qty as "planned" value
    const openOrderValue = isOpenOrder && r.price && r.leavesQty
      ? parseFloat(r.price) * parseFloat(r.leavesQty)
      : null;

    return (
      <div key={r.id} style={{
        display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1fr 1.2fr 1fr 1fr 0.9fr', gap: 12,
        padding: '13px 4px', alignItems: 'center',
        borderBottom: i === arr.length - 1 ? 'none' : border,
        background: isOpenOrder ? (dark ? 'rgba(247,166,0,0.04)' : 'rgba(247,166,0,0.03)') : 'transparent',
      }}>
        {/* Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: ti.bg, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ti.color }}>{ti.icon}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px' }}>{ti.label}</span>
        </div>
        {/* Asset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TickerLogo symbol={sym} size={26}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{sym}</div>
            <div style={{ fontSize: 10, color: sub, fontFamily: SC.fontMono }}>{subText}</div>
          </div>
        </div>
        {/* Value */}
        <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', fontFamily: SC.fontMono, color: ti.color }}>
          {isTransfer
            ? fmtAmount(r.cumExecValue, r.symbol)
            : isOpenOrder
              ? (openOrderValue ? `~$${openOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—')
              : fmtValue(r.cumExecValue)}
        </span>
        {/* Quantity / fee */}
        <span style={{ fontSize: 12, fontFamily: SC.fontMono, color: sub, textAlign: 'right' }}>
          {isTransfer
            ? (parseFloat(r.cumExecFee) > 0 ? `fee: ${r.cumExecFee} ${r.symbol}` : '—')
            : isOpenOrder
              ? fmtQty(r.leavesQty || r.qty, r.symbol)
              : fmtQty(r.cumExecQty, r.symbol)}
        </span>
        {/* Limit price (open orders) / avg price (filled) / chain (transfers) */}
        <span style={{ fontSize: 12, fontFamily: SC.fontMono, color: sub, textAlign: 'right' }}>
          {isTransfer ? '—' : fmtPrice(isOpenOrder ? r.price : r.avgPrice)}
        </span>
        {/* Date */}
        <span style={{ fontSize: 12, color: sub, fontFamily: SC.fontMono }}>{fmtDate(r.time)}</span>
        {/* Status */}
        <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'right', color: statusColor(r.status, r.recordType) }}>
          ● {fmtStatus(r.status, r.recordType)}
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 32px', height: '100%', overflow: 'auto', color: text, fontFamily: SC.fontDisplay }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>{t(lang, 'history')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999,
          background: dark ? 'rgba(247,166,0,0.12)' : '#FFF7E6', border: '1px solid rgba(247,166,0,0.3)' }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: '#F7A600',
            boxShadow: !loading && !error ? '0 0 6px #F7A600' : 'none',
            animation: !loading && !error ? 'binance-pulse 2s ease-in-out infinite' : 'none' }}/>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#C47E00', letterSpacing: '0.04em', fontFamily: SC.fontMono }}>
            Bybit {loading ? '…' : error ? 'offline' : 'live'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {tabs.map(tg => (
          <button key={tg.id} onClick={() => setTab(tg.id)} style={{
            padding: '7px 18px', borderRadius: 999,
            background: tab === tg.id ? SC.ink1000 : fieldBg,
            color: tab === tg.id ? '#fff' : sub,
            border: 'none', cursor: 'pointer',
            fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.2px',
          }}>{tg.label}
          {tab === 'all' && tg.id === 'all' && allRecords.length > 0 && (
            <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '0 6px', fontSize: 11 }}>
              {allRecords.length}
            </span>
          )}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ background: cardBg, borderRadius: 24, border, padding: '32px 24px', textAlign: 'center', color: sub }}>
          {lang === 'ru' ? 'Загрузка истории…' : 'Loading history…'}
        </div>
      )}
      {error && (
        <div style={{ background: cardBg, borderRadius: 24, border, padding: '24px', color: '#EF4444', fontSize: 13 }}>
          {lang === 'ru' ? 'Ошибка загрузки: ' : 'Load error: '}{error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <div style={{ background: cardBg, borderRadius: 24, border, padding: '32px 24px', textAlign: 'center', color: sub }}>
          {lang === 'ru' ? 'Нет записей' : 'No records'}
        </div>
      )}
      {!loading && !error && records.length > 0 && (
        <div style={{ background: cardBg, borderRadius: 24, border, padding: '8px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1fr 1.2fr 1fr 1fr 0.9fr', gap: 12,
            padding: '14px 4px', fontSize: 11, color: sub, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: border }}>
            <span>{lang === 'ru' ? 'Тип' : 'Type'}</span>
            <span>{lang === 'ru' ? 'Актив' : 'Asset'}</span>
            <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Сумма' : 'Amount'}</span>
            <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Кол-во / комиссия' : 'Qty / fee'}</span>
            <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Ср. цена' : 'Avg price'}</span>
            <span>{lang === 'ru' ? 'Дата' : 'Date'}</span>
            <span style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Статус' : 'Status'}</span>
          </div>
          {records.map((r, i, arr) => renderRow(r, i, arr))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Withdraw screen (web) — choose source account, amount, destination
// ─────────────────────────────────────────────────────────────
function WebWithdraw({ lang = 'ru', dark = false }) {
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  return (
    <div style={{ padding: '24px 32px 32px', height: '100%', overflow: 'auto', color: text, fontFamily: SC.fontDisplay }}>
      <h1 style={{ margin: '4px 0 6px', fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>{t(lang, 'withdraw')}</h1>
      <div style={{ fontSize: 14, color: sub, marginBottom: 26 }}>
        {lang === 'ru' ? 'Выведите средства на карту или банковский счёт.' : 'Withdraw to a card or bank account.'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 28 }}>
        <div style={{ background: cardBg, borderRadius: 24, border, padding: 24 }}>
          {/* Source */}
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {lang === 'ru' ? 'Со счёта' : 'From account'}
          </div>
          <div style={{ background: fieldBg, borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <TickerLogo symbol="KGS" size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{lang === 'ru' ? 'Основной счёт · KGS' : 'Main account · KGS'}</div>
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{lang === 'ru' ? 'Доступно: 87 421 с' : 'Available: 87,421 KGS'}</div>
            </div>
            <Icon name="chevD" size={16} color={sub}/>
          </div>
          {/* Amount */}
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {lang === 'ru' ? 'Сумма' : 'Amount'}
          </div>
          <div style={{ background: fieldBg, borderRadius: 18, padding: '16px 18px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: SC.fontMono, fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>25 000</span>
              <span style={{ fontFamily: SC.fontMono, fontSize: 18, color: sub }}>с</span>
            </div>
            <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 4 }}>
              {lang === 'ru' ? '≈ 281,06 $ по курсу 88,95' : '≈ $281.06 at 88.95'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[10000, 25000, 50000, 87421].map((v, i) => (
              <span key={v} style={{
                flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 8,
                background: i === 1 ? (dark ? '#fff' : SC.ink1000) : fieldBg,
                color: i === 1 ? (dark ? SC.ink1000 : '#fff') : text,
                fontFamily: SC.fontMono, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>{i === 3 ? (lang === 'ru' ? 'Всё' : 'Max') : (v / 1000) + 'k'}</span>
            ))}
          </div>
          {/* Destination */}
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {lang === 'ru' ? 'Куда' : 'To'}
          </div>
          <div style={{ background: fieldBg, borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: SC.ink1000, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, fontFamily: SC.fontDisplay }}>V</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Visa ··· 4291</div>
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono, marginTop: 2 }}>{lang === 'ru' ? 'Зачисление за 10 минут' : 'Arrives in 10 minutes'}</div>
            </div>
            <Icon name="chevD" size={16} color={sub}/>
          </div>
          {/* Summary */}
          <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : SC.ink50, borderRadius: 14, padding: 14, marginBottom: 16 }}>
            {[
              [lang === 'ru' ? 'К выводу'         : 'You withdraw', '25 000,00 с'],
              [lang === 'ru' ? 'Комиссия Zaman'   : 'Zaman fee',   '0 с'],
              [lang === 'ru' ? 'На карту'         : 'To card',     '25 000,00 с'],
            ].map(([k, v], i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '4px 0', fontSize: 13, borderTop: i === arr.length - 1 ? (dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`) : 'none', marginTop: i === arr.length - 1 ? 6 : 0, paddingTop: i === arr.length - 1 ? 10 : 4 }}>
                <span style={{ color: i === arr.length - 1 ? text : sub, fontWeight: i === arr.length - 1 ? 600 : 500, whiteSpace: 'nowrap' }}>{k}</span>
                <span style={{ fontFamily: SC.fontMono, fontWeight: 600, color: text, whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
          <Pill variant="primary" size="lg" arrow full icon="upload">{t(lang, 'withdrawLong')}</Pill>
        </div>
        {/* Saved methods */}
        <div>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            {lang === 'ru' ? 'Способы вывода' : 'Withdrawal methods'}
          </div>
          <div style={{ background: cardBg, borderRadius: 24, border, padding: '6px 18px' }}>
            {[
              { brand: 'V', label: 'Visa ··· 4291', eta: lang === 'ru' ? '10 минут · без комиссии' : '10 min · no fee',  on: true },
              { brand: 'M', label: 'Mastercard ··· 8814', eta: lang === 'ru' ? '15 минут · без комиссии' : '15 min · no fee' },
              { brand: 'Б', label: lang === 'ru' ? 'Банк KICB ··· 7710' : 'KICB bank ··· 7710', eta: lang === 'ru' ? '1 рабочий день' : '1 business day' },
              { brand: '+', label: lang === 'ru' ? 'Добавить способ' : 'Add method', eta: lang === 'ru' ? 'Карта или счёт' : 'Card or account', add: true },
            ].map((m, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                borderBottom: i === arr.length - 1 ? 'none' : border, cursor: 'pointer',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: m.add ? 'transparent' : SC.ink1000,
                  border: m.add ? `1.5px dashed ${sub}` : 'none',
                  color: '#fff', display: 'grid', placeItems: 'center',
                  fontWeight: 700, fontSize: 14, fontFamily: SC.fontDisplay,
                }}>{m.add ? <Icon name="plus" size={16} color={sub}/> : m.brand}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>{m.eta}</div>
                </div>
                {m.on && (
                  <div style={{ width: 18, height: 18, borderRadius: 999, background: SC.green, display: 'grid', placeItems: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: dark ? 'rgba(12,71,183,0.10)' : SC.greenWash, border: dark ? 'none' : `1px solid ${SC.greenSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="info" size={16} color={dark ? SC.greenBright : SC.greenDeep}/>
            <span style={{ flex: 1, fontSize: 12, color: dark ? SC.greenBright : SC.greenDeep, lineHeight: 1.4 }}>
              {lang === 'ru'
                ? 'Zaman не берёт комиссию за вывод на карту KG.'
                : 'Zaman charges no fee for withdrawal to KG cards.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Investment ideas (Home) — newbie-friendly idea cards + movers
// ─────────────────────────────────────────────────────────────
const IDEAS_RU = [
  { tag: 'AI · CFD',     featured: true,  title: 'Инфраструктура ИИ', sub: 'Корзина: NVDA · AMD · GOOGL. Чипы и облака для ИИ.', upside: '+12%', period: '30 дней', risk: 'Средний', accent: SC.lime, color: SC.ink1000 },
  { tag: 'KG · акции',                    title: 'Дивиденды KG',      sub: 'KCEL и KICB платят дивиденды дважды в год.',           upside: '+6%',  period: '6 мес',  risk: 'Низкий',  color: SC.greenWash, accent: SC.greenDeep },
  { tag: 'Крипто',                        title: 'Голубые фишки крипты', sub: 'BTC и ETH — лидеры рынка.',                          upside: '+18%', period: '90 дней', risk: 'Высокий', color: SC.ink100, accent: SC.greenDeep, dark: false },
  { tag: 'Валюта',                        title: 'Защита от инфляции',sub: 'Часть капитала в USD — стабильный курс.',              upside: '+3%',  period: '1 год',   risk: 'Низкий',  color: SC.paper, accent: SC.ink1000, border: true },
];
const IDEAS_EN = [
  { tag: 'AI · CFD',     featured: true,  title: 'AI infrastructure', sub: 'Basket: NVDA, AMD, GOOGL. Chips and clouds for AI.',  upside: '+12%', period: '30 days', risk: 'Medium', accent: SC.lime, color: SC.ink1000 },
  { tag: 'KG · stocks',                   title: 'KG dividends',      sub: 'KCEL and KICB pay dividends twice a year.',           upside: '+6%',  period: '6 mo',    risk: 'Low',    color: SC.greenWash, accent: SC.greenDeep },
  { tag: 'Crypto',                        title: 'Crypto blue chips', sub: 'BTC and ETH lead the market.',                        upside: '+18%', period: '90 days', risk: 'High',   color: SC.ink100, accent: SC.greenDeep, dark: false },
  { tag: 'Forex',                         title: 'Inflation hedge',   sub: 'Park part of your capital in USD — stable rate.',     upside: '+3%',  period: '1 yr',    risk: 'Low',    color: SC.paper, accent: SC.ink1000, border: true },
];

function WebInvestmentIdeas({ lang = 'ru', dark = false, onNav = () => {}, onTrade = () => {}, onTopUp = () => {} }) {
  const text = dark ? '#fff' : SC.ink1000;
  const sub = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const ideas = lang === 'ru' ? IDEAS_RU : IDEAS_EN;
  const rest = ideas.slice(1);
  const news = lang === 'ru' ? WEB_NEWS_RU : WEB_NEWS_EN;
  const { holdings: liveHoldings } = typeof usePortfolio === 'function' ? usePortfolio() : { holdings: [] };
  const { rates: kgsRates } = typeof useKgsRates === 'function' ? useKgsRates() : { rates: {} };
  const stats = typeof computePortfolioStats === 'function'
    ? computePortfolioStats(liveHoldings, kgsRates['USD'])
    : { totalKgs: PORTFOLIO.balance, dayChangePct: PORTFOLIO.dayChangePct, dayChangeKgs: PORTFOLIO.dayChange };

  return (
    <div style={{ padding: '24px 32px 32px', height: '100%', overflow: 'auto', color: text, fontFamily: SC.fontDisplay }}>
      {/* Balance hero */}
      <section style={{
        background: dark ? 'linear-gradient(135deg, #161D1B 0%, #0E1413 100%)' : SC.greenWash,
        color: dark ? '#fff' : SC.ink1000,
        borderRadius: 28, padding: '24px 28px',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.greenSoft}`,
        display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'center',
        position: 'relative', overflow: 'hidden', marginBottom: 22,
      }}>
        {dark && <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(12,71,183,0.18), rgba(12,71,183,0) 70%)' }}/>}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.55)' : SC.greenDeep, fontWeight: 500, letterSpacing: dark ? '0.06em' : 'normal', textTransform: dark ? 'uppercase' : 'none' }}>{t(lang, 'totalBalance')}</span>
            <Icon name="eye" size={14} color={dark ? 'rgba(255,255,255,0.45)' : SC.greenDeep}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <MoneyKGS value={stats.totalKgs} size={64} weight={600} color={dark ? '#fff' : SC.ink1000}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            {dark ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 999, background: stats.dayChangePct >= 0 ? 'rgba(12,71,183,0.22)' : 'rgba(239,68,68,0.22)', color: stats.dayChangePct >= 0 ? SC.greenBright : '#EF4444', fontFamily: SC.fontMono, fontWeight: 600, fontSize: 13 }}>
                <Icon name={stats.dayChangePct >= 0 ? 'arrUp' : 'arrDn'} size={12} color={stats.dayChangePct >= 0 ? SC.greenBright : '#EF4444'} strokeWidth={2.4}/>
                {stats.dayChangePct >= 0 ? '+' : ''}{stats.dayChangePct.toFixed(2)}%
              </span>
            ) : (
              <DeltaPill value={stats.dayChangePct} size="md"/>
            )}
            <span style={{ fontFamily: SC.fontMono, fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : SC.ink500 }}>
              {fmtKGS(stats.dayChangeKgs, { sign: true })} {t(lang, 'soms')} · {t(lang, 'todayChange')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Pill variant={dark ? 'primary' : 'dark'} size="md" icon="plus" onClick={() => onTrade('buy')}>{t(lang, 'buy')}</Pill>
            <Pill variant={dark ? 'softDark' : 'outline'} size="md" onClick={() => onTrade('sell')}>{t(lang, 'sell')}</Pill>
            <Pill variant={dark ? 'softDark' : 'outline'} size="md" icon="upload">{t(lang, 'withdraw')}</Pill>
            <Pill variant={dark ? 'softDark' : 'outline'} size="md" icon="download" onClick={onTopUp}>{t(lang, 'topUp')}</Pill>
          </div>
        </div>
        {/* Bar chart */}
        {(() => {
          const periods = lang === 'ru' ? ['1Д','7Д','1М','3М','1Г'] : ['1D','7D','1M','3M','1Y'];
          const activeIdx = 2;
          const data = PORTFOLIO.series1m;
          const barColor = dark ? SC.greenBright : SC.greenDeep;
          const barDim = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
          const min = Math.min(...data);
          const max = Math.max(...data);
          const range = max - min || 1;
          const chartH = 140;
          const n = data.length;
          const gap = 4;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {periods.map((p, i) => (
                  <span key={p} style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: i === activeIdx ? (dark ? '#fff' : SC.ink1000) : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                    color: i === activeIdx ? (dark ? SC.ink1000 : '#fff') : (dark ? 'rgba(255,255,255,0.55)' : SC.ink500),
                    fontSize: 11, fontWeight: 600, fontFamily: SC.fontMono, cursor: 'pointer',
                  }}>{p}</span>
                ))}
              </div>
              <svg width="100%" height={chartH} viewBox={`0 0 ${n * 20} ${chartH}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
                {data.map((v, i) => {
                  const barH = Math.max(4, ((v - min) / range) * (chartH - 8));
                  const x = i * 20 + gap / 2;
                  const w = 20 - gap;
                  const y = chartH - barH;
                  const isActive = i === n - 1;
                  return (
                    <rect key={i} x={x} y={y} width={w} height={barH}
                      fill={isActive ? barColor : barDim}
                      rx={3} ry={3}/>
                  );
                })}
              </svg>
            </div>
          );
        })()}
      </section>

      {/* 4-row aligned grid: ideas/structure on rows 1-2, news on rows 3-4 */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gridTemplateRows: 'auto auto auto auto', gap: '0 20px', alignItems: 'stretch' }}>

        {/* Row 1 labels */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {lang === 'ru' ? 'Инвестиционные идеи' : 'Investment ideas'}
          </div>
          <button onClick={() => onNav('ideas')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: dark ? SC.greenBright : SC.greenDeep, fontFamily: SC.fontDisplay, letterSpacing: '-0.1px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {lang === 'ru' ? 'Все идеи' : 'All ideas'} <Icon name="chevR" size={12} color={dark ? SC.greenBright : SC.greenDeep}/>
          </button>
        </div>
        <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: 12 }}>
          {lang === 'ru' ? 'Структура портфеля' : 'Portfolio structure'}
        </div>

        {/* Row 2: idea cards (left) | structure card (right, same height) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignContent: 'stretch' }}>
          {rest.map((idea, i) => (
            <div key={i} onClick={() => onNav('ideas')} style={{
              background: idea.color, color: idea.dark ? '#fff' : SC.ink1000,
              border: idea.border ? `1px solid ${SC.ink200}` : 'none',
              borderRadius: 22, padding: 18,
              display: 'flex', flexDirection: 'column', cursor: 'pointer',
            }}>
              <div style={{ display: 'inline-block', alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 999, background: idea.dark ? 'rgba(255,255,255,0.12)' : (idea.color === SC.greenWash ? '#fff' : SC.ink200), color: idea.dark ? '#fff' : SC.ink500, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{idea.tag}</div>
              <h3 style={{ margin: '12px 0 6px', fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15 }}>{idea.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: idea.dark ? 'rgba(255,255,255,0.6)' : SC.ink500, lineHeight: 1.4, flex: 1 }}>{idea.sub}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: idea.dark ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${SC.ink200}` }}>
                <span style={{ fontFamily: SC.fontMono, fontSize: 18, fontWeight: 700, color: idea.dark ? SC.greenBright : SC.greenDeep, letterSpacing: '-0.03em' }}>{idea.upside}</span>
                <span style={{ fontSize: 11, color: idea.dark ? 'rgba(255,255,255,0.5)' : SC.ink500 }}>{idea.period} · {idea.risk}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: cardBg, borderRadius: 22, border, padding: '20px 20px 18px', display: 'flex', flexDirection: 'column' }}>
          <AllocationStrip segments={stats.allocation[lang]} height={10} showLabels={false}/>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {stats.allocation[lang].map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: s.color, flexShrink: 0 }}/>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: text }}>{s.label}</span>
                <span style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 700, color: text }}>{s.pct}%</span>
              </div>
            ))}
            {stats.allocation[lang].length === 0 && (
              <div style={{ color: sub, fontSize: 13 }}>{lang === 'ru' ? 'Загрузка…' : 'Loading…'}</div>
            )}
          </div>
        </div>

        {/* Row 3 labels */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 12px' }}>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {lang === 'ru' ? 'Новости рынка' : 'Market news'}
          </div>
          <button onClick={() => onNav('news')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: dark ? SC.greenBright : SC.greenDeep, fontFamily: SC.fontDisplay, letterSpacing: '-0.1px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {lang === 'ru' ? 'Все новости' : 'All news'} <Icon name="chevR" size={12} color={dark ? SC.greenBright : SC.greenDeep}/>
          </button>
        </div>
        <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '20px 0 12px' }}>
          {lang === 'ru' ? 'Новости Zaman' : 'Zaman News'}
        </div>

        {/* Row 4: market news 2×2 (left) | Zaman news list (right, same height) */}
        {(() => {
          const imgGradients = [
            'linear-gradient(135deg, #1a2010 0%, #2a3518 100%)',
            'linear-gradient(135deg, #141830 0%, #1e2245 100%)',
            'linear-gradient(135deg, #1a1410 0%, #2e1e14 100%)',
            'linear-gradient(135deg, #0e1820 0%, #142430 100%)',
          ];
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, alignContent: 'stretch' }}>
              {news.map((n, i) => (
                <div key={i} onClick={() => onNav('news')} style={{ background: cardBg, border, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                  {/* Image placeholder */}
                  <div style={{ height: 90, background: imgGradients[i % imgGradients.length], position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)' }}/>
                    <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'inline-block', padding: '2px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{n.tag}</div>
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: text, letterSpacing: '-0.2px', lineHeight: 1.35, flex: 1 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{n.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{ background: cardBg, borderRadius: 22, border, padding: '6px 18px', alignSelf: 'stretch' }}>
          {news.map((n, i, arr) => (
            <div key={i} style={{
              padding: '14px 0',
              borderBottom: i === arr.length - 1 ? 'none' : border,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : SC.ink100, color: sub, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{n.tag}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: text, letterSpacing: '-0.2px', lineHeight: 1.35, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{n.meta}</div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LiveCryptoPrices — compact widget for home screen right rail
// ─────────────────────────────────────────────────────────────
const LIVE_CRYPTO_LIST = [
  { symbol: 'BTC',  name: 'Bitcoin',  binance: 'BTCUSDT' },
  { symbol: 'ETH',  name: 'Ethereum', binance: 'ETHUSDT' },
  { symbol: 'BNB',  name: 'BNB',      binance: 'BNBUSDT' },
  { symbol: 'SOL',  name: 'Solana',   binance: 'SOLUSDT' },
];

function LiveCryptoPrices({ lang = 'ru', dark = false }) {
  const { prices, loading, error } = useBinancePrices(LIVE_CRYPTO_LIST.map(a => a.binance));
  const text = dark ? '#fff' : SC.ink1000;
  const sub  = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {lang === 'ru' ? 'Крипто · Binance' : 'Crypto · Binance'}
        </div>
        {typeof BinanceStatusBadge === 'function' && (
          <BinanceStatusBadge loading={loading} error={error} dark={dark}/>
        )}
      </div>
      <div style={{ background: cardBg, borderRadius: 22, border, padding: '6px 18px' }}>
        {LIVE_CRYPTO_LIST.map((asset, i) => {
          const live = prices[asset.binance];
          const price  = live ? live.price  : null;
          const change = live ? live.change : null;
          return (
            <div key={asset.symbol} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              borderBottom: i === LIVE_CRYPTO_LIST.length - 1 ? 'none' : border,
            }}>
              <TickerLogo symbol={asset.symbol} size={32}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>{asset.symbol}</div>
                <div style={{ fontSize: 11, color: sub }}>{asset.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: SC.fontMono, fontSize: 13, fontWeight: 600, color: text }}>
                  {price !== null
                    ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: price > 100 ? 2 : 4 })}`
                    : <span style={{ color: sub }}>…</span>}
                </div>
                <div style={{ marginTop: 2 }}>
                  {change !== null ? <DeltaPill value={change} size="sm"/> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// News screen — 6 real news items, filterable by category
// ─────────────────────────────────────────────────────────────
function WebNewsScreen({ lang = 'ru', dark = false }) {
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg  = dark ? SC.ink900 : SC.paper;
  const border  = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : SC.ink50;

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
    <div style={{ padding: '28px 36px 40px', height: '100%', overflow: 'auto', fontFamily: SC.fontDisplay }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', color: text }}>
          Новости рынка
        </h1>
        <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>29–30 мая 2026</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '7px 18px', borderRadius: 999,
            background: filter === t.id ? (dark ? '#fff' : SC.ink1000) : fieldBg,
            color: filter === t.id ? (dark ? SC.ink1000 : '#fff') : sub,
            border: 'none', cursor: 'pointer',
            fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.1px',
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {items.map((n, i) => (
          <div key={i} style={{ background: cardBg, borderRadius: 22, border, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div style={{ height: 120, background: n.gradient, position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.04) 10px, rgba(255,255,255,0.04) 20px)' }}/>
              <div style={{ position: 'absolute', bottom: 12, left: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: tagColors[n.cls] || SC.green }}/>
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{n.tag}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: SC.fontMono }}>{n.date}</div>
            </div>
            <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: text, letterSpacing: '-0.3px', lineHeight: 1.3 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: sub, lineHeight: 1.55, flex: 1 }}>{n.body}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, borderTop: border }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: fieldBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="info" size={11} color={sub}/>
                </div>
                <span style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{n.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Investment Ideas screen — 6 ideas, filterable by category
// ─────────────────────────────────────────────────────────────
function WebIdeasScreen({ lang = 'ru', dark = false }) {
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg  = dark ? SC.ink900 : SC.paper;
  const border  = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
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
    <div style={{ padding: '28px 36px 40px', height: '100%', overflow: 'auto', fontFamily: SC.fontDisplay }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', color: text }}>
          Инвестиционные идеи
        </h1>
        <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>Май 2026 · аналитика</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '7px 18px', borderRadius: 999,
            background: filter === t.id ? (dark ? '#fff' : SC.ink1000) : fieldBg,
            color: filter === t.id ? (dark ? SC.ink1000 : '#fff') : sub,
            border: 'none', cursor: 'pointer',
            fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 13, letterSpacing: '-0.1px',
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {items.map((idea, i) => (
          <div key={i} style={{ background: idea.color, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', minHeight: 260 }}>
            <div style={{ padding: '22px 22px 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.10)', marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: idea.accent }}/>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{idea.tag}</span>
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{idea.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55 }}>{idea.body}</p>
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{ margin: '16px 22px 22px', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: idea.accent, fontFamily: SC.fontMono, letterSpacing: '-0.03em' }}>{idea.upside}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{idea.period} · {idea.target}</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: idea.riskColor, whiteSpace: 'nowrap' }}>
                {idea.risk}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Web Profile / Settings screen — mirrors mobile ProfileScreen
// ─────────────────────────────────────────────────────────────
function WebProfileScreen({ lang = 'ru', dark = false, onLogout = () => {} }) {
  const text    = dark ? '#fff' : SC.ink1000;
  const sub     = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const cardBg  = dark ? SC.ink900 : SC.paper;
  const border  = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;

  const c = (typeof window !== 'undefined' && window.SENTI_CLIENT) || null;
  const genderRu = { male: 'Мужской', female: 'Женский' };
  const realRows = c ? (lang === 'ru' ? [
    { label: 'Клиент ID',   value: c.id, mono: true },
    { label: 'Имя',         value: c.profile?.name || '—' },
    { label: 'Дата рожд.',  value: c.profile?.dob || '—' },
    { label: 'Пол',         value: genderRu[c.profile?.gender] || '—' },
    { label: 'Email',       value: c.email + (c.emailVerified ? ' ✓' : ' (не подтв.)') },
    { label: 'Телефон',     value: c.profile?.phone || '—', mono: true },
    { label: 'Верификация', value: c.kycStatus === 'verified' ? 'Пройдена' : 'Не пройдена' },
  ] : [
    { label: 'Client ID',   value: c.id, mono: true },
    { label: 'Name',        value: c.profile?.name || '—' },
    { label: 'Birth date',  value: c.profile?.dob || '—' },
    { label: 'Gender',      value: c.profile?.gender || '—' },
    { label: 'Email',       value: c.email + (c.emailVerified ? ' ✓' : ' (unverified)') },
    { label: 'Phone',       value: c.profile?.phone || '—', mono: true },
    { label: 'Verification',value: c.kycStatus === 'verified' ? 'Done' : 'Pending' },
  ]) : null;

  const rows = realRows || (lang === 'ru' ? [
    { label: 'ФИО',         value: 'Калыкова Айгуль Маратовна' },
    { label: 'Дата рожд.',  value: '14.06.1996' },
    { label: 'Гражданство', value: 'Кыргызская Республика' },
    { label: 'Паспорт',     value: 'AN 1840 \u00b7\u00b7\u00b7\u00b7 8841',  mono: true },
    { label: 'ИНН',         value: '20406199600541',      mono: true },
    { label: 'Email',       value: 'a.kalykova@mail.kg' },
    { label: 'Телефон',     value: '+996 \u00b7\u00b7\u00b7 22 41',      mono: true },
    { label: 'Адрес',       value: '\u0433. \u0411\u0438\u0448\u043a\u0435\u043a, \u0427\u0443\u0439\u0441\u043a\u0438\u0439 \u043f\u0440-\u0442, 162' },
  ] : [
    { label: 'Full name',    value: 'Kalykova Aigul Maratovna' },
    { label: 'Date of birth',value: '14.06.1996' },
    { label: 'Citizenship',  value: 'Kyrgyz Republic' },
    { label: 'Passport',     value: 'AN 1840 \u00b7\u00b7\u00b7\u00b7 8841',  mono: true },
    { label: 'Tax ID',       value: '20406199600541',      mono: true },
    { label: 'Email',        value: 'a.kalykova@mail.kg' },
    { label: 'Phone',        value: '+996 \u00b7\u00b7\u00b7 22 41',      mono: true },
    { label: 'Address',      value: 'Bishkek, Chuy prospect, 162' },
  ]);

  const groups = lang === 'ru' ? [
    { title: '\u0424\u0438\u043d\u0430\u043d\u0441\u044b', items: [
      { icon: 'wallet',      label: '\u0421\u0447\u0435\u0442\u0430 \u0438 \u043a\u0430\u0440\u0442\u044b',          meta: '2 \u0441\u0447\u0451\u0442\u0430' },
      { icon: 'qr',          label: '\u0420\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b \u0434\u043b\u044f \u043f\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f' },
      { icon: 'layers',      label: '\u041d\u0430\u043b\u043e\u0433\u0438 \u0438 \u0432\u044b\u043f\u0438\u0441\u043a\u0438',        meta: '2026' },
    ]},
    { title: '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435 \u0438 \u043f\u043e\u043c\u043e\u0449\u044c', items: [
      { icon: 'book',        label: '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435',                meta: '5 \u0443\u0440\u043e\u043a\u043e\u0432' },
      { icon: 'sparkles',    label: '\u0418\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0435 \u0438\u0434\u0435\u0438',     meta: 'NEW' },
      { icon: 'info',        label: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430' },
    ]},
    { title: '\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c', items: [
      { icon: 'fingerprint', label: '\u0412\u0445\u043e\u0434 \u0438 \u043f\u0430\u0440\u043e\u043b\u044c' },
      { icon: 'bell',        label: '\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f' },
      { icon: 'settings',    label: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438' },
    ]},
  ] : [
    { title: 'Finance', items: [
      { icon: 'wallet',      label: 'Accounts & cards',       meta: '2 accounts' },
      { icon: 'qr',          label: 'Top-up details' },
      { icon: 'layers',      label: 'Tax & statements',        meta: '2026' },
    ]},
    { title: 'Learn & help', items: [
      { icon: 'book',        label: 'Learn',                  meta: '5 lessons' },
      { icon: 'sparkles',    label: 'Investment ideas',        meta: 'NEW' },
      { icon: 'info',        label: 'Support' },
    ]},
    { title: 'Security', items: [
      { icon: 'fingerprint', label: 'Sign-in & password' },
      { icon: 'bell',        label: 'Notifications' },
      { icon: 'settings',    label: 'Settings' },
    ]},
  ];

  return (
    <div style={{ padding: '28px 36px 40px', height: '100%', overflow: 'auto', fontFamily: SC.fontDisplay }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', color: text }}>
        {lang === 'ru' ? 'Профиль' : 'Profile'}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ background: cardBg, borderRadius: 24, border, padding: '28px 24px 22px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft, color: dark ? SC.greenBright : SC.greenDeep, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 34, fontFamily: SC.fontDisplay, margin: '0 auto 16px', position: 'relative' }}>
              {c ? clientInitial(lang) : '\u0410'}
              {(!c || clientKycVerified()) && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 999, background: SC.green, border: `3px solid ${cardBg}`, display: 'grid', placeItems: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                </div>
              )}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px', color: text }}>
              {c ? clientName(lang) : (lang === 'ru' ? '\u0410\u0439\u0433\u0443\u043b\u044c \u041a\u0430\u043b\u044b\u043a\u043e\u0432\u0430' : 'Aigul Kalykova')}
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 4, fontFamily: SC.fontMono }}>
              {c ? ('ID ' + clientId()) : ('ID 7841 \u00b7 ' + (lang === 'ru' ? '\u0441 12 \u043c\u0430\u0440\u0442\u0430 2024' : 'since Mar 12, 2024'))}
            </div>
            {clientKycVerified() || !c ? (
              <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft, color: dark ? SC.greenBright : SC.greenDeep, fontSize: 12, fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                {lang === 'ru' ? 'KYC \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d' : 'KYC verified'}
              </div>
            ) : (
              <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: dark ? 'rgba(229,165,10,0.18)' : '#FBF0D9', color: '#B7791F', fontSize: 12, fontWeight: 600 }}>
                {lang === 'ru' ? '\u0412\u0435\u0440\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u044f \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u0430' : 'Verification pending'}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Pill variant={dark ? 'softDark' : 'soft'} size="md" full>{lang === 'ru' ? '\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c' : 'Edit'}</Pill>
              <Pill variant="primary" size="md" full arrow>{lang === 'ru' ? '\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b' : 'Documents'}</Pill>
            </div>
          </div>
          <div style={{ background: cardBg, borderRadius: 20, border, overflow: 'hidden' }}>
            {rows.map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', gap: 12, borderBottom: i === arr.length - 1 ? 'none' : border }}>
                <span style={{ flex: '0 0 116px', fontSize: 12, color: sub, fontWeight: 500 }}>{r.label}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: text, fontFamily: r.mono ? SC.fontMono : SC.fontDisplay, letterSpacing: '-0.1px' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          {groups.map(g => (
            <div key={g.title} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 4px 10px' }}>{g.title}</div>
              <div style={{ background: cardBg, borderRadius: 20, border, overflow: 'hidden' }}>
                {g.items.map((it, i, arr) => (
                  <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: i === arr.length - 1 ? 'none' : border, cursor: 'pointer' }}>
                    <Icon name={it.icon} size={20} color={text}/>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, letterSpacing: '-0.2px', color: text }}>{it.label}</span>
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
          <button onClick={onLogout} style={{ width: '100%', padding: '15px 20px', borderRadius: 20, background: cardBg, border, color: SC.danger, cursor: 'pointer', fontFamily: SC.fontDisplay, fontWeight: 600, fontSize: 14, letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="upload" size={16} color={SC.danger}/>
            {lang === 'ru' ? '\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430' : 'Sign out'}
          </button>
          <div style={{ marginTop: 16, textAlign: 'center', color: sub, fontSize: 11, fontFamily: SC.fontMono }}>
            Zaman · v2.0.0 · 2026
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebMarketsView, WebAssetDetail, WebExchange, WebWithdraw, WebHistory, WebInvestmentIdeas, WebNewsScreen, WebIdeasScreen, WebProfileScreen });
