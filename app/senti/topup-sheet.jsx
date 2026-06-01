// TopUpSheet — deposit flow: method → crypto → network → address + QR
// Works in both web (modal overlay) and mobile (bottom sheet)

const TOPUP_WORKER = 'https://senti-bybit.ecoholding-perm.workers.dev';

// Coins that support network selection (USDT + USDC)
const MULTI_NETWORK_COINS = ['USDT', 'USDC'];

// All crypto deposit options: from LIVE_ASSETS.crypto + USDT + USDC
function getDepositCryptos() {
  const base = typeof LIVE_ASSETS !== 'undefined' ? (LIVE_ASSETS.crypto || []) : [];
  const symbols = new Set(base.map(a => a.symbol));
  const priority = [];
  if (!symbols.has('USDT')) priority.push({ symbol: 'USDT', name: 'Tether USD' });
  if (!symbols.has('USDC')) priority.push({ symbol: 'USDC', name: 'USD Coin' });
  const rest = base.filter(a => a.symbol !== 'USDT' && a.symbol !== 'USDC');
  const usdt = base.find(a => a.symbol === 'USDT');
  const usdc = base.find(a => a.symbol === 'USDC');
  const pinned = [...(usdt ? [usdt] : priority.filter(p => p.symbol === 'USDT')), ...(usdc ? [usdc] : priority.filter(p => p.symbol === 'USDC'))];
  return [...pinned, ...rest];
}

function useDepositChains(coin) {
  const [chains, setChains] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!coin) return;
    setLoading(true);
    setChains([]);
    fetch(`${TOPUP_WORKER}/deposit-chains?coin=${coin}`)
      .then(r => r.json())
      .then(d => { setChains(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [coin]);
  return { chains, loading };
}

function useDepositAddress(coin, chain) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!coin || !chain) return;
    setLoading(true);
    setData(null);
    fetch(`${TOPUP_WORKER}/deposit-address?coin=${coin}&chain=${chain}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [coin, chain]);
  return { data, loading };
}

function TopUpSheet({ lang = 'ru', dark = false, onClose, mobile = false }) {
  const [step, setStep] = React.useState('method'); // method | crypto | network | address
  const [selectedCoin, setSelectedCoin] = React.useState(null);
  const [selectedChain, setSelectedChain] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  const text   = dark ? '#fff' : SC.ink1000;
  const sub    = dark ? 'rgba(255,255,255,0.5)' : SC.ink500;
  const bg     = dark ? SC.ink900 : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const rowBg  = dark ? 'rgba(255,255,255,0.04)' : SC.ink50;

  const { chains, loading: chainsLoading } = useDepositChains(step === 'network' ? selectedCoin : null);
  const { data: addrData, loading: addrLoading } = useDepositAddress(
    step === 'address' ? selectedCoin : null,
    step === 'address' ? selectedChain : null
  );

  const methods = [
    { id: 'card',     icon: 'qr',       label: lang === 'ru' ? 'Карта'                : 'Card',             sub: lang === 'ru' ? 'Visa, Mastercard, МИР' : 'Visa, Mastercard' },
    { id: 'bank',     icon: 'layers',   label: lang === 'ru' ? 'Банковский перевод'   : 'Bank transfer',    sub: lang === 'ru' ? 'SWIFT, SEPA, внутренний' : 'SWIFT, SEPA, local' },
    { id: 'ewallet',  icon: 'wallet',   label: lang === 'ru' ? 'Электронный кошелёк'  : 'E-wallet',         sub: 'Kaspi, Mbank, PayPal' },
    { id: 'crypto',   icon: 'btc',      label: lang === 'ru' ? 'Криптовалюта'         : 'Cryptocurrency',   sub: lang === 'ru' ? 'Перевод в сети блокчейн' : 'On-chain transfer', active: true },
  ];

  const depCryptos = getDepositCryptos();

  function handleMethodPick(id) {
    if (id === 'crypto') setStep('crypto');
    // other methods show "coming soon" for now
  }

  function handleCryptoPick(symbol) {
    setSelectedCoin(symbol);
    if (MULTI_NETWORK_COINS.includes(symbol)) {
      setStep('network');
    } else {
      // For other cryptos, derive chain name = symbol itself
      setSelectedChain(symbol);
      setStep('address');
    }
  }

  function handleChainPick(chain) {
    setSelectedChain(chain);
    setStep('address');
  }

  function copyAddress() {
    if (addrData?.address) {
      navigator.clipboard?.writeText(addrData.address).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function goBack() {
    if (step === 'crypto')  setStep('method');
    else if (step === 'network') setStep('crypto');
    else if (step === 'address') setStep(MULTI_NETWORK_COINS.includes(selectedCoin) ? 'network' : 'crypto');
  }

  const titles = {
    method:  lang === 'ru' ? 'Пополнить счёт'   : 'Top up account',
    crypto:  lang === 'ru' ? 'Выберите монету'   : 'Choose coin',
    network: lang === 'ru' ? 'Выберите сеть'     : 'Choose network',
    address: lang === 'ru' ? 'Адрес для пополнения' : 'Deposit address',
  };

  const innerPad = mobile ? '0 20px' : '0 28px';

  return (
    <div style={{
      background: bg, borderRadius: mobile ? '24px 24px 0 0' : 28,
      display: 'flex', flexDirection: 'column',
      width: mobile ? '100%' : 480,
      maxHeight: mobile ? '85vh' : '80vh',
      fontFamily: SC.fontDisplay,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px 28px', borderBottom: border, flexShrink: 0 }}>
        {step !== 'method' && (
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, padding: 0, fontFamily: SC.fontDisplay }}>
            <Icon name="chevL" size={16} color={sub}/>
          </button>
        )}
        <div style={{ flex: 1, fontSize: 17, fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>{titles[step]}</div>
        {selectedCoin && step !== 'method' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: rowBg }}>
            <TickerLogo symbol={selectedCoin} size={16}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: text }}>{selectedCoin}</span>
            {selectedChain && step === 'address' && <span style={{ fontSize: 11, color: sub }}>· {selectedChain}</span>}
          </div>
        )}
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 999, padding: 0 }}>
          <Icon name="minus" size={20} color={sub}/>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `16px ${innerPad.split(' ')[1]} 24px` }}>

        {/* ── Method ── */}
        {step === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods.map(m => (
              <button key={m.id} onClick={() => handleMethodPick(m.id)} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                background: m.active ? (dark ? 'rgba(12,71,183,0.1)' : SC.greenWash) : rowBg,
                border: m.active ? `1px solid ${dark ? 'rgba(12,71,183,0.3)' : SC.greenSoft}` : `1px solid transparent`,
                borderRadius: 16, cursor: 'pointer', textAlign: 'left', fontFamily: SC.fontDisplay,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: m.active ? (dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft) : (dark ? 'rgba(255,255,255,0.06)' : SC.ink100), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={m.icon} size={18} color={m.active ? (dark ? SC.greenBright : SC.greenDeep) : sub}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: m.active ? (dark ? SC.greenBright : SC.greenDeep) : text, letterSpacing: '-0.2px' }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>{m.sub}</div>
                </div>
                {m.active
                  ? <Icon name="chevR" size={16} color={dark ? SC.greenBright : SC.greenDeep}/>
                  : <span style={{ fontSize: 10, fontWeight: 600, color: sub, padding: '2px 8px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100 }}>{lang === 'ru' ? 'Скоро' : 'Soon'}</span>
                }
              </button>
            ))}
          </div>
        )}

        {/* ── Crypto picker ── */}
        {step === 'crypto' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {depCryptos.map((a, i, arr) => (
              <button key={a.symbol} onClick={() => handleCryptoPick(a.symbol)} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px',
                background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 14,
                borderBottom: i < arr.length - 1 ? border : 'none',
                fontFamily: SC.fontDisplay, textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = rowBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <TickerLogo symbol={a.symbol} size={36}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>{a.symbol}</div>
                  <div style={{ fontSize: 12, color: sub }}>{a.name}</div>
                </div>
                <Icon name="chevR" size={14} color={sub}/>
              </button>
            ))}
          </div>
        )}

        {/* ── Network picker ── */}
        {step === 'network' && (
          chainsLoading
            ? <div style={{ padding: '40px 0', textAlign: 'center', color: sub, fontSize: 13 }}>{lang === 'ru' ? 'Загрузка сетей…' : 'Loading networks…'}</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chains.map((c, i, arr) => (
                  <button key={c.chain} onClick={() => handleChainPick(c.chain)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 12px',
                    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 14,
                    borderBottom: i < arr.length - 1 ? border : 'none',
                    fontFamily: SC.fontDisplay, textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = rowBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="layers" size={16} color={sub}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>
                        {c.chainType || c.chain}
                        {c.chain && c.chainType && c.chain !== c.chainType && (
                          <span style={{ fontWeight: 500, color: sub }}>{' '}({c.chain})</span>
                        )}
                      </div>
                    </div>
                    {parseFloat(c.minDeposit) > 0 && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: sub, fontFamily: SC.fontMono }}>{lang === 'ru' ? 'мин.' : 'min'}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: text, fontFamily: SC.fontMono }}>{c.minDeposit}</div>
                      </div>
                    )}
                    <Icon name="chevR" size={14} color={sub}/>
                  </button>
                ))}
              </div>
        )}

        {/* ── Address ── */}
        {step === 'address' && (
          addrLoading
            ? <div style={{ padding: '40px 0', textAlign: 'center', color: sub, fontSize: 13 }}>{lang === 'ru' ? 'Загрузка адреса…' : 'Loading address…'}</div>
            : addrData?.address
              ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  {/* Warning */}
                  <div style={{ width: '100%', padding: '12px 16px', borderRadius: 14, background: dark ? 'rgba(247,166,0,0.1)' : 'rgba(247,166,0,0.08)', border: '1px solid rgba(247,166,0,0.25)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icon name="info" size={16} color="#F7A600" strokeWidth={2}/>
                    <span style={{ fontSize: 12, color: '#F7A600', lineHeight: 1.4 }}>
                      {lang === 'ru'
                        ? `Отправляйте только ${addrData.coin} через сеть ${addrData.chain}. Другие монеты будут потеряны.`
                        : `Send only ${addrData.coin} via ${addrData.chain} network. Other coins will be lost.`}
                    </span>
                  </div>
                  {/* QR code */}
                  <div style={{ padding: 12, background: '#fff', borderRadius: 16, display: 'inline-flex' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(addrData.address)}&size=180x180&margin=0`}
                      width={180} height={180} alt="QR"
                      style={{ display: 'block', borderRadius: 8 }}/>
                  </div>
                  {/* Address box */}
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                      {lang === 'ru' ? 'Адрес кошелька' : 'Wallet address'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: rowBg, borderRadius: 14, border }}>
                      <span style={{ flex: 1, fontFamily: SC.fontMono, fontSize: 12, color: text, wordBreak: 'break-all', lineHeight: 1.5 }}>{addrData.address}</span>
                      <button onClick={copyAddress} style={{ flexShrink: 0, background: copied ? SC.green : (dark ? 'rgba(255,255,255,0.1)' : SC.ink100), border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: copied ? '#fff' : text, fontFamily: SC.fontDisplay, transition: 'background 0.2s' }}>
                        {copied ? (lang === 'ru' ? 'Скопировано' : 'Copied!') : (lang === 'ru' ? 'Копировать' : 'Copy')}
                      </button>
                    </div>
                  </div>
                  {/* Tag/memo if present */}
                  {addrData.tag && (
                    <div style={{ width: '100%' }}>
                      <div style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Memo / Tag</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: rowBg, borderRadius: 14, border }}>
                        <span style={{ flex: 1, fontFamily: SC.fontMono, fontSize: 13, color: text }}>{addrData.tag}</span>
                      </div>
                    </div>
                  )}
                </div>
              : <div style={{ padding: '40px 0', textAlign: 'center', color: sub, fontSize: 13 }}>
                  {lang === 'ru' ? 'Адрес недоступен' : 'Address unavailable'}
                </div>
        )}

      </div>
    </div>
  );
}

// ─── WithdrawSheet ────────────────────────────────────────────
const WITHDRAW_COIN    = 'USDT';
const WITHDRAW_CHAIN   = 'PLASMA';
const WITHDRAW_ADDRESS = '0x042d35602D409C84F2803AD32Dd73E124ea06C06';

// All USDT networks: PLASMA active, others soon
const WITHDRAW_NETWORKS = [
  { chain: 'PLASMA',   label: 'Plasma',      active: true  },
  { chain: 'ETH',      label: 'ERC20',       active: false },
  { chain: 'TRX',      label: 'TRC20',       active: false },
  { chain: 'BSC',      label: 'BEP20',       active: false },
  { chain: 'SOL',      label: 'Solana',      active: false },
  { chain: 'OP',       label: 'Optimism',    active: false },
  { chain: 'ARB',      label: 'Arbitrum',    active: false },
  { chain: 'MATIC',    label: 'Polygon',     active: false },
];

function WithdrawSheet({ lang = 'ru', dark = false, onClose, mobile = false }) {
  const [step,    setStep]   = React.useState('method'); // method | amount | confirm | result
  const [amount,  setAmount] = React.useState('');
  const [loading, setLoading]= React.useState(false);
  const [result,  setResult] = React.useState(null);

  const { balances } = typeof useBybitAccount === 'function' ? useBybitAccount() : { balances: [] };
  const usdtBal = React.useMemo(() => {
    const b = balances.find(b => b.asset === 'USDT');
    return b ? parseFloat(b.free || 0) : 0;
  }, [balances]);

  const text   = dark ? '#fff'                             : SC.ink1000;
  const sub    = dark ? 'rgba(255,255,255,0.5)'            : SC.ink500;
  const bg     = dark ? SC.ink900                          : SC.paper;
  const border = dark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${SC.ink200}`;
  const rowBg  = dark ? 'rgba(255,255,255,0.04)'           : SC.ink50;

  const amtNum  = parseFloat(amount) || 0;
  const isValid = amtNum > 0 && amtNum <= usdtBal;
  const innerPad = mobile ? '20px' : '28px';

  const methods = [
    { id: 'crypto', icon: 'btc',    label: lang === 'ru' ? 'Криптовалюта' : 'Cryptocurrency', sub: lang === 'ru' ? 'USDT на внешний кошелёк' : 'USDT to external wallet', active: true },
    { id: 'card',   icon: 'qr',     label: lang === 'ru' ? 'На карту'     : 'Card withdrawal', sub: 'Visa, Mastercard, МИР',                                                active: false },
    { id: 'bank',   icon: 'layers', label: lang === 'ru' ? 'Банковский перевод' : 'Bank transfer', sub: lang === 'ru' ? 'SWIFT, SEPA, внутренний' : 'SWIFT, SEPA, local', active: false },
  ];

  async function handleSubmit() {
    setLoading(true);
    try {
      const r = await fetch(`${TOPUP_WORKER}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: WITHDRAW_COIN, chain: WITHDRAW_CHAIN, address: WITHDRAW_ADDRESS, amount: amtNum }),
      });
      const d = await r.json();
      setResult(d.ok ? { ok: true, withdrawId: d.withdrawId } : { ok: false, error: d.error });
    } catch(e) {
      setResult({ ok: false, error: e.message });
    }
    setLoading(false);
    setStep('result');
  }

  const stepBack = { amount: 'method', confirm: 'amount' };
  const titleMap = {
    method:  lang === 'ru' ? 'Вывод средств'     : 'Withdraw',
    amount:  lang === 'ru' ? 'Вывод USDT'        : 'Withdraw USDT',
    confirm: lang === 'ru' ? 'Подтвердить вывод' : 'Confirm withdrawal',
    result:  result?.ok
      ? (lang === 'ru' ? 'Заявка отправлена' : 'Request sent')
      : (lang === 'ru' ? 'Ошибка'            : 'Error'),
  };

  return (
    <div style={{
      background: bg, borderRadius: mobile ? '24px 24px 0 0' : 28,
      display: 'flex', flexDirection: 'column',
      width: mobile ? '100%' : 480,
      maxHeight: mobile ? '85vh' : '80vh',
      fontFamily: SC.fontDisplay,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px 28px', borderBottom: border, flexShrink: 0 }}>
        {stepBack[step] && (
          <button onClick={() => setStep(stepBack[step])} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="chevL" size={16} color={sub}/>
          </button>
        )}
        <div style={{ flex: 1, fontSize: 17, fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>{titleMap[step]}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 999, padding: 0 }}>
          <Icon name="minus" size={20} color={sub}/>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: `16px ${innerPad} 24px` }}>

        {/* ── Method picker ── */}
        {step === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods.map(m => (
              <button key={m.id} onClick={() => m.active && setStep('amount')} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                background: m.active ? (dark ? 'rgba(12,71,183,0.1)' : SC.greenWash) : rowBg,
                border: m.active ? `1px solid ${dark ? 'rgba(12,71,183,0.3)' : SC.greenSoft}` : `1px solid transparent`,
                borderRadius: 16, cursor: m.active ? 'pointer' : 'default', textAlign: 'left', fontFamily: SC.fontDisplay,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: m.active ? (dark ? 'rgba(12,71,183,0.18)' : SC.greenSoft) : (dark ? 'rgba(255,255,255,0.06)' : SC.ink100), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={m.icon} size={18} color={m.active ? (dark ? SC.greenBright : SC.greenDeep) : sub}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: m.active ? (dark ? SC.greenBright : SC.greenDeep) : text, letterSpacing: '-0.2px' }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>{m.sub}</div>
                </div>
                {m.active
                  ? <Icon name="chevR" size={16} color={dark ? SC.greenBright : SC.greenDeep}/>
                  : <span style={{ fontSize: 10, fontWeight: 600, color: sub, padding: '2px 8px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100 }}>{lang === 'ru' ? 'Скоро' : 'Soon'}</span>
                }
              </button>
            ))}
          </div>
        )}

        {/* ── Amount step ── */}
        {step === 'amount' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Network selector */}
            <div>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{lang === 'ru' ? 'Выберите сеть' : 'Select network'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {WITHDRAW_NETWORKS.map((n, i, arr) => (
                  <div key={n.chain} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 14,
                    background: n.chain === WITHDRAW_CHAIN ? (dark ? 'rgba(12,71,183,0.1)' : SC.greenWash) : rowBg,
                    border: n.chain === WITHDRAW_CHAIN ? `1px solid ${dark ? 'rgba(12,71,183,0.3)' : SC.greenSoft}` : `1px solid transparent`,
                    opacity: n.active ? 1 : 0.5,
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: n.chain === WITHDRAW_CHAIN ? (dark ? 'rgba(12,71,183,0.2)' : SC.greenSoft) : (dark ? 'rgba(255,255,255,0.06)' : SC.ink100), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="layers" size={14} color={n.chain === WITHDRAW_CHAIN ? (dark ? SC.greenBright : SC.greenDeep) : sub}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: text, letterSpacing: '-0.2px' }}>{n.label}</span>
                      <span style={{ fontSize: 12, color: sub, marginLeft: 6 }}>({n.chain})</span>
                    </div>
                    {n.active
                      ? n.chain === WITHDRAW_CHAIN && <div style={{ width: 18, height: 18, borderRadius: 999, background: SC.green, display: 'grid', placeItems: 'center' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
                      : <span style={{ fontSize: 10, fontWeight: 600, color: sub, padding: '2px 8px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : SC.ink100 }}>{lang === 'ru' ? 'Скоро' : 'Soon'}</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div style={{ padding: '12px 14px', borderRadius: 14, background: rowBg, border }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{lang === 'ru' ? 'Адрес получателя' : 'Recipient address'}</div>
              <div style={{ fontFamily: SC.fontMono, fontSize: 11, color: text, wordBreak: 'break-all', lineHeight: 1.5 }}>{WITHDRAW_ADDRESS}</div>
            </div>

            {/* Amount input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang === 'ru' ? 'Сумма (USDT)' : 'Amount (USDT)'}</div>
                <div style={{ fontSize: 12, color: sub }}>
                  {lang === 'ru' ? 'Доступно:' : 'Available:'}{' '}
                  <span style={{ color: text, fontFamily: SC.fontMono, fontWeight: 600 }}>{usdtBal.toFixed(2)} USDT</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" min="0" step="any"
                  style={{
                    width: '100%', padding: '14px 80px 14px 16px', boxSizing: 'border-box',
                    background: rowBg,
                    border: `1px solid ${amtNum > usdtBal && amtNum > 0 ? '#EF4444' : (dark ? 'rgba(255,255,255,0.1)' : SC.ink200)}`,
                    borderRadius: 14, fontSize: 20, fontWeight: 700, color: text, fontFamily: SC.fontMono, outline: 'none',
                  }}
                />
                <button onClick={() => setAmount(String(usdtBal.toFixed(2)))} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: dark ? 'rgba(255,255,255,0.1)' : SC.ink100,
                  border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
                  fontSize: 11, fontWeight: 700, color: text, fontFamily: SC.fontDisplay,
                }}>MAX</button>
              </div>
              {amtNum > usdtBal && amtNum > 0 && (
                <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{lang === 'ru' ? 'Недостаточно средств' : 'Insufficient balance'}</div>
              )}
            </div>

            {/* Warning */}
            <div style={{ padding: '12px 16px', borderRadius: 14, background: dark ? 'rgba(247,166,0,0.1)' : 'rgba(247,166,0,0.08)', border: '1px solid rgba(247,166,0,0.25)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="info" size={16} color="#F7A600" strokeWidth={2}/>
              <span style={{ fontSize: 12, color: '#F7A600', lineHeight: 1.4 }}>
                {lang === 'ru'
                  ? 'Убедитесь, что адрес поддерживает сеть PLASMA. Перевод необратим.'
                  : 'Ensure the address supports PLASMA network. Transfers are irreversible.'}
              </span>
            </div>

            <button onClick={() => setStep('confirm')} disabled={!isValid} style={{
              padding: '14px', borderRadius: 16, border: 'none', cursor: isValid ? 'pointer' : 'not-allowed',
              background: isValid ? SC.green : (dark ? 'rgba(255,255,255,0.08)' : SC.ink100),
              color: isValid ? '#fff' : sub,
              fontSize: 15, fontWeight: 700, fontFamily: SC.fontDisplay, letterSpacing: '-0.2px',
            }}>
              {lang === 'ru' ? 'Продолжить' : 'Continue'}
            </button>
          </div>
        )}

        {/* ── Confirm step ── */}
        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: lang === 'ru' ? 'Монета'   : 'Coin',    value: 'USDT' },
              { label: lang === 'ru' ? 'Сеть'     : 'Network', value: 'PLASMA' },
              { label: lang === 'ru' ? 'Сумма'    : 'Amount',  value: `${amtNum.toFixed(2)} USDT` },
              { label: lang === 'ru' ? 'Адрес'    : 'Address', value: WITHDRAW_ADDRESS, mono: true },
            ].map(row => (
              <div key={row.label} style={{ padding: '12px 14px', background: rowBg, borderRadius: 14, border }}>
                <div style={{ fontSize: 11, color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: row.mono ? 11 : 15, fontWeight: 700, color: text, fontFamily: row.mono ? SC.fontMono : SC.fontDisplay, wordBreak: 'break-all', lineHeight: 1.5 }}>{row.value}</div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading} style={{
              marginTop: 8, padding: '14px', borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? (dark ? 'rgba(255,255,255,0.08)' : SC.ink100) : '#EF4444',
              color: loading ? sub : '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: SC.fontDisplay, letterSpacing: '-0.2px',
            }}>
              {loading
                ? (lang === 'ru' ? 'Отправка…' : 'Sending…')
                : (lang === 'ru' ? `Вывести ${amtNum.toFixed(2)} USDT` : `Withdraw ${amtNum.toFixed(2)} USDT`)}
            </button>
          </div>
        )}

        {/* ── Result step ── */}
        {step === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: result?.ok ? 'rgba(12,71,183,0.12)' : 'rgba(239,68,68,0.12)',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name={result?.ok ? 'check' : 'info'} size={28} color={result?.ok ? SC.green : '#EF4444'} strokeWidth={2}/>
            </div>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: text, marginBottom: 8 }}>
                {result?.ok
                  ? (lang === 'ru' ? 'Заявка на вывод создана' : 'Withdrawal request created')
                  : (lang === 'ru' ? 'Не удалось создать заявку' : 'Failed to create request')}
              </div>
              {result?.ok
                ? <div style={{ fontSize: 13, color: sub, lineHeight: 1.6 }}>
                    {lang === 'ru'
                      ? `Вывод ${amtNum.toFixed(2)} USDT через сеть PLASMA отправлен на обработку.`
                      : `Withdrawal of ${amtNum.toFixed(2)} USDT via PLASMA is being processed.`}
                    {result.withdrawId && <div style={{ fontFamily: SC.fontMono, marginTop: 8, fontSize: 11 }}>ID: {result.withdrawId}</div>}
                  </div>
                : <div style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{result?.error}</div>
              }
            </div>
            <button onClick={onClose} style={{
              padding: '12px 32px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: result?.ok ? SC.green : (dark ? 'rgba(255,255,255,0.08)' : SC.ink100),
              color: result?.ok ? '#fff' : text,
              fontSize: 14, fontWeight: 700, fontFamily: SC.fontDisplay,
            }}>
              {lang === 'ru' ? 'Закрыть' : 'Close'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

Object.assign(window, { TopUpSheet, WithdrawSheet });
