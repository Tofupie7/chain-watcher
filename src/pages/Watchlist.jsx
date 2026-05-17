import React, { useState } from 'react';

const TABS = ['Leaderboard', 'Token Overlap', 'Trade Feed'];

export default function Watchlist({ chain }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {TABS.map((tab, i) => (
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

      <div className="card" style={{ borderRadius: '0 14px 14px 14px', minHeight: 400 }}>
        <div className="page-placeholder">
          <div className="icon">⭐</div>
          <div className="title">Watchlist — {TABS[activeTab]}</div>
          <div className="subtitle">
            {activeTab === 0 && 'Leaderboard of your followed wallets ranked by Avg ROI%, win rate, and consistency.'}
            {activeTab === 1 && 'See which tokens multiple watched wallets are holding simultaneously.'}
            {activeTab === 2 && 'Real-time stream of all trades from your followed wallets.'}
          </div>
          <div className="badge">Phase 5 — Coming Soon</div>
        </div>
      </div>
    </div>
  );
}
