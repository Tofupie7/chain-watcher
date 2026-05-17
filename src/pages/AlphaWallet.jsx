import React, { useState } from 'react';

const SOLANA_TABS = ['Daily Migrated', 'Daily Runner', 'Weekly Runner', 'Gem Finders'];
const BASE_TABS = ['Daily Runner', 'Weekly Runner', 'Gem Finders'];

export default function AlphaWallet({ chain }) {
  const tabs = chain === 'solana' ? SOLANA_TABS : BASE_TABS;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px 8px 0 0',
              border: '1px solid',
              borderColor: activeTab === i ? 'var(--amber)' : 'var(--border-light)',
              borderBottom: activeTab === i ? '2px solid var(--amber)' : '1px solid var(--border-light)',
              background: activeTab === i ? 'var(--amber-subtle)' : 'var(--bg-secondary)',
              color: activeTab === i ? 'var(--amber)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: activeTab === i ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card" style={{ borderRadius: '0 14px 14px 14px', minHeight: 400 }}>
        <div className="page-placeholder">
          <div className="icon">🏆</div>
          <div className="title">Alpha Wallet — {tabs[activeTab]}</div>
          <div className="subtitle">
            Wallet scoring, badges, and rankings for {tabs[activeTab]} will appear here. Scanning for wallets with strong ROI% on qualifying tokens.
          </div>
          <div className="badge">Phase 3 — Coming Soon</div>
        </div>
      </div>
    </div>
  );
}
