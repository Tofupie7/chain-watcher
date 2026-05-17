import React, { useState } from 'react';
import { fetchTokenInfo, fetchTopTraders, checkAlphaEligibility, estimateScore, getWalletGrade } from '../utils/api';

function formatUsd(value) {
  if (!value || value === 0) return '$0';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  if (value < 0) return `-$${Math.abs(value).toFixed(2)}`;
  return `$${value.toFixed(2)}`;
}

// ============ TOKEN INFO PANEL ============
function TokenInfoPanel({ token, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading token data...</div>
      </div>
    );
  }
  if (!token) return null;

  const stats = [
    { label: 'Price', value: `$${token.price < 0.001 ? token.price.toExponential(2) : token.price.toFixed(6)}` },
    { label: 'Market Cap', value: formatUsd(token.mcap) },
    { label: '24h Volume', value: formatUsd(token.volume24h) },
    { label: 'Liquidity', value: formatUsd(token.liquidity) },
    { label: 'Age', value: token.ageFormatted },
    { label: '24h Change', value: `${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h?.toFixed(1)}%`, color: token.priceChange24h >= 0 ? 'var(--green)' : 'var(--red)' },
    { label: '24h Buys', value: token.txns24h?.buys?.toLocaleString() || '0' },
    { label: '24h Sells', value: token.txns24h?.sells?.toLocaleString() || '0' },
  ];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {token.imageUrl && (
          <img src={token.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-primary)' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{token.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>${token.symbol}</span>
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase' }}>
              {token.chain} · {token.dex}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{token.address}</span>
            <button onClick={() => navigator.clipboard.writeText(token.address)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, padding: 0 }} title="Copy address">📋</button>
          </div>
        </div>
        <a href={token.url} target="_blank" rel="noopener noreferrer" className="btn btn-amber" style={{ textDecoration: 'none', fontSize: 11 }}>DexScreener ↗</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: s.color || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ WALLET TABLE ROW ============
function WalletRow({ wallet, rank }) {
  const grade = getWalletGrade(wallet.score);
  const alphaEligible = wallet.alphaEligible || [];
  const shortAddr = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  const isBot = wallet.tags?.some(t => t.includes('bot'));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 100px 90px 100px 90px 1fr 60px',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid var(--border)',
      fontSize: 12,
      transition: 'background var(--transition-fast)',
      cursor: 'pointer',
      background: rank <= 3 ? 'rgba(245,158,11,0.03)' : 'transparent',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    onMouseLeave={(e) => e.currentTarget.style.background = rank <= 3 ? 'rgba(245,158,11,0.03)' : 'transparent'}
    >
      {/* Rank */}
      <div style={{
        width: 26, height: 26, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
        background: rank === 1 ? 'var(--amber)' : rank === 2 ? '#6b7280' : rank === 3 ? '#b45309' : 'var(--bg-primary)',
        color: rank <= 3 ? 'var(--bg-primary)' : 'var(--text-muted)',
        border: rank > 3 ? '1px solid var(--border)' : 'none',
      }}>{rank}</div>

      {/* Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: 12 }}>{shortAddr}</span>
        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(wallet.address); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-dim)', padding: 0 }}
          title="Copy full address">📋</button>
        {isBot && (
          <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontWeight: 600 }}>BOT</span>
        )}
      </div>

      {/* Realized PnL */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: wallet.realizedPnl >= 0 ? 'var(--green)' : 'var(--red)' }}
        title={`Bought: $${wallet.totalBoughtUsd?.toLocaleString()} · Sold: $${wallet.totalSoldUsd?.toLocaleString()}`}
      >
        {wallet.realizedPnl >= 0 ? '+' : ''}{formatUsd(wallet.realizedPnl)}
      </div>

      {/* ROI% */}
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: wallet.roi >= 0 ? 'var(--green)' : 'var(--red)' }}
        title={`Bought: $${wallet.totalBoughtUsd?.toLocaleString()} · Sold: $${wallet.totalSoldUsd?.toLocaleString()}`}
      >
        {wallet.roi >= 0 ? '+' : ''}{wallet.roi.toLocaleString()}%
      </div>

      {/* Trades */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--green)' }}>{wallet.buyCount}B</span>
        {' / '}
        <span style={{ color: 'var(--red)' }}>{wallet.sellCount}S</span>
      </div>

      {/* Status */}
      <div>
        {wallet.stillHolding ? (
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', fontWeight: 600 }}>Holding</span>
        ) : (
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(90,101,119,0.1)', color: 'var(--text-muted)', fontWeight: 500 }}>Closed</span>
        )}
      </div>

      {/* Alpha Eligible */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {alphaEligible.length > 0 ? alphaEligible.map((tag, i) => (
          <span key={i} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.12)', color: 'var(--purple)', fontWeight: 600, whiteSpace: 'nowrap' }}>{tag}</span>
        )) : (
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>—</span>
        )}
      </div>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11 }}>{grade.emoji}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: grade.color }}>{wallet.score}</span>
      </div>
    </div>
  );
}

// ============ MAIN TOKEN SCANNER ============
export default function TokenScanner({ chain }) {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [resultCount, setResultCount] = useState(15);
  const [hasSearched, setHasSearched] = useState(false);
  const [progress, setProgress] = useState('');

  const handleScan = async () => {
    const addr = contractAddress.trim();
    if (!addr) return;

    setLoading(true);
    setTokenLoading(true);
    setError(null);
    setTokenInfo(null);
    setWallets([]);
    setHasSearched(true);
    setProgress('Fetching token info...');
    setResultCount(15);

    try {
      // Step 1: Token info from DexScreener
      const token = await fetchTokenInfo(addr, chain);
      setTokenInfo(token);
      setTokenLoading(false);

      if (!token) {
        setError('Token not found on DexScreener. Check the contract address and chain.');
        setLoading(false);
        setProgress('');
        return;
      }

      // Step 2: Get Birdeye API key
      let apiKey = null;
      try {
        if (window.chainWatcher?.credentials) {
          const creds = await window.chainWatcher.credentials.get();
          apiKey = creds?.birdeye;
        }
      } catch {}
      if (!apiKey) {
        try {
          const stored = localStorage.getItem('cw_credentials');
          if (stored) apiKey = JSON.parse(stored)?.birdeye;
        } catch {}
      }

      if (!apiKey) {
        setError('Birdeye API key not found. Go to Settings → Connections → Birdeye to add your key.');
        setLoading(false);
        setProgress('');
        return;
      }

      // Step 3: Fetch traders with PnL (two-step process)
      setProgress('Fetching top trader addresses...');
      
      const traders = await fetchTopTraders(addr, apiKey, chain, (msg) => {
        setProgress(msg);
      });

      // Step 4: Score and tag
      const scored = traders.map(w => ({
        ...w,
        score: estimateScore(w),
        alphaEligible: checkAlphaEligibility(w, token, chain),
      }));

      setWallets(scored);
      setProgress('');
    } catch (err) {
      setError(`Scan failed: ${err.message}`);
      setTokenLoading(false);
      setProgress('');
    }

    setLoading(false);
  };

  const filteredWallets = filter === 'alpha'
    ? wallets.filter(w => w.alphaEligible.length > 0)
    : wallets;

  const displayWallets = filteredWallets.slice(0, resultCount);
  const alphaCount = wallets.filter(w => w.alphaEligible.length > 0).length;

  return (
    <div>
      {/* Search Bar */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder={`Paste ${chain === 'solana' ? 'Solana' : 'Base'} token contract address...`}
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleScan()}
              style={{ fontSize: 13, fontFamily: 'var(--font-mono)', padding: '10px 14px', background: 'var(--bg-primary)' }}
              disabled={loading}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={loading || !contractAddress.trim()}
            style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, opacity: loading || !contractAddress.trim() ? 0.5 : 1 }}
          >
            {loading ? '⏳ Scanning...' : '🔍 Scan Token'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8 }}>
          Fetches top traders by volume, analyzes swap transactions for PnL, ranks by ROI%. Takes ~18 seconds.
        </div>
      </div>

      {/* Progress Bar */}
      {loading && progress && (
        <div style={{
          padding: '10px 16px', marginBottom: 16, borderRadius: 10,
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 16, height: 16, border: '2px solid var(--amber)', borderTop: '2px solid transparent',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 500 }}>{progress}</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10,
          color: 'var(--red)', fontSize: 12, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Token Info */}
      <TokenInfoPanel token={tokenInfo} loading={tokenLoading} />

      {/* Results Table */}
      {hasSearched && !loading && wallets.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Top Wallets by ROI%</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{wallets.length} with realized PnL · {alphaCount} Alpha candidates</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setFilter('all')}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                  fontFamily: 'var(--font-ui)', border: '1px solid', cursor: 'pointer',
                  borderColor: filter === 'all' ? 'var(--amber)' : 'var(--border)',
                  background: filter === 'all' ? 'var(--amber-subtle)' : 'transparent',
                  color: filter === 'all' ? 'var(--amber)' : 'var(--text-muted)',
                }}>Top ROI% ({wallets.length})</button>
              <button onClick={() => setFilter('alpha')}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                  fontFamily: 'var(--font-ui)', border: '1px solid', cursor: 'pointer',
                  borderColor: filter === 'alpha' ? 'var(--purple)' : 'var(--border)',
                  background: filter === 'alpha' ? 'rgba(168,85,247,0.08)' : 'transparent',
                  color: filter === 'alpha' ? 'var(--purple)' : 'var(--text-muted)',
                }}>Alpha Candidates ({alphaCount})</button>
            </div>
          </div>

          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 100px 90px 100px 90px 1fr 60px',
            padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)',
          }}>
            {['#', 'Wallet', 'PnL', 'ROI%', 'Trades', 'Status', 'Alpha Eligible', 'Score'].map((h, i) => (
              <div key={i} style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {displayWallets.length > 0 ? (
            displayWallets.map((w, i) => <WalletRow key={w.address} wallet={w} rank={i + 1} />)
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              No {filter === 'alpha' ? 'Alpha-eligible' : ''} wallets found
            </div>
          )}

          {filteredWallets.length > resultCount && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setResultCount(prev => prev + 15)} style={{ fontSize: 11 }}>
                Show more ({filteredWallets.length - resultCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty results */}
      {hasSearched && !loading && wallets.length === 0 && !error && (
        <div className="card">
          <div className="page-placeholder" style={{ minHeight: 200 }}>
            <div className="icon">🔍</div>
            <div className="title">No wallets with realized PnL found</div>
            <div className="subtitle">
              This could mean the Birdeye PnL endpoint didn't return data for these wallets, the token is too new, or no traders have sold yet. Try a more actively traded token.
            </div>
          </div>
        </div>
      )}

      {/* Pre-search */}
      {!hasSearched && (
        <div className="card">
          <div className="page-placeholder" style={{ minHeight: 300 }}>
            <div className="icon">🔍</div>
            <div className="title">Token Scanner</div>
            <div className="subtitle">
              Paste any {chain === 'solana' ? 'Solana' : 'Base'} token contract address above to discover the top wallets by realized ROI%. Scans ~50 traders and checks their actual PnL data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
