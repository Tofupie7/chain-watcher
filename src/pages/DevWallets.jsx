import React from 'react';

export default function DevWallets({ chain }) {
  if (chain === 'base') {
    return (
      <div className="page-placeholder">
        <div className="icon">🔒</div>
        <div className="title">Dev Wallets — Solana Only</div>
        <div className="subtitle">
          Switch to Solana to access dev wallet tracking. Base dev tracking may be added in a future update.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-placeholder">
        <div className="icon">👨‍💻</div>
        <div className="title">Dev Wallets</div>
        <div className="subtitle">
          Auto-detected token deployers from Alpha Wallet scans. Scored by launch track record, success rate, global fees, and volume. See recent launches and dev grades.
        </div>
        <div className="badge">Phase 6 — Coming Soon</div>
      </div>
    </div>
  );
}
