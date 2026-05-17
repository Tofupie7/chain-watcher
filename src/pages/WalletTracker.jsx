import React from 'react';

export default function WalletTracker({ chain }) {
  return (
    <div>
      <div className="page-placeholder">
        <div className="icon">👁️</div>
        <div className="title">Wallet Tracker</div>
        <div className="subtitle">
          Create named groups of {chain === 'solana' ? 'Solana' : 'Base'} wallets. Monitor their holdings in real-time, track inflows, and see group-level performance stats.
        </div>
        <div className="badge">Phase 5 — Coming Soon</div>
      </div>
    </div>
  );
}
