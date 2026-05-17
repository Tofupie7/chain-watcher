import React from 'react';

export default function Trending({ chain }) {
  const mcapCeiling = chain === 'solana' ? '130k' : '80k';

  return (
    <div>
      <div className="page-placeholder">
        <div className="icon">🔥</div>
        <div className="title">Trending — Smart Money Early Signal</div>
        <div className="subtitle">
          Tokens under 24hrs old, below {mcapCeiling} mcap, with 3+ quality wallets entering. Real-time smart money convergence signals on {chain === 'solana' ? 'Solana' : 'Base'}.
        </div>
        <div className="badge">Phase 5 — Coming Soon</div>
      </div>
    </div>
  );
}
