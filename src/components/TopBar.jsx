import React, { useState } from 'react';

const SECTION_LABELS = {
  dashboard: { icon: '📊', label: 'Dashboard' },
  alpha: { icon: '🏆', label: 'Alpha Wallet' },
  trending: { icon: '🔥', label: 'Trending' },
  tracker: { icon: '👁️', label: 'Wallet Tracker' },
  watchlist: { icon: '⭐', label: 'Watchlist' },
  devwallets: { icon: '👨‍💻', label: 'Dev Wallets' },
  scanner: { icon: '🔍', label: 'Token Scanner' },
  settings: { icon: '⚙️', label: 'Settings' },
};

const styles = {
  topbar: {
    height: 52,
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    background: 'var(--bg-secondary)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    gap: 16,
    WebkitAppRegion: 'drag',
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    WebkitAppRegion: 'no-drag',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--bg-tertiary)',
    borderRadius: 8,
    padding: '6px 14px',
    border: '1px solid var(--border)',
    width: 340,
    cursor: 'text',
    WebkitAppRegion: 'no-drag',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: 12,
    fontFamily: 'var(--font-ui)',
    width: '100%',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    WebkitAppRegion: 'no-drag',
  },
  chainToggle: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  chainBtn: (isActive) => ({
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: isActive ? 600 : 400,
    fontFamily: 'var(--font-ui)',
    color: isActive ? 'var(--bg-primary)' : 'var(--text-muted)',
    background: isActive ? 'var(--amber)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    transition: 'all var(--transition-fast)',
  }),
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
};

export default function TopBar({ activeSection, chain, onChainChange }) {
  const [searchValue, setSearchValue] = useState('');
  const section = SECTION_LABELS[activeSection] || SECTION_LABELS.dashboard;

  return (
    <div style={styles.topbar}>
      {/* Left: Section label */}
      <div style={styles.sectionLabel}>
        <span style={{ fontSize: 16 }}>{section.icon}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          {section.label}
        </span>
      </div>

      {/* Center: Search */}
      <div style={styles.searchBar}>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="Search token or wallet address..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {/* Right: Chain toggle + Live */}
      <div style={styles.rightSection}>
        {/* Chain Toggle */}
        <div style={styles.chainToggle}>
          <button
            style={styles.chainBtn(chain === 'solana')}
            onClick={() => onChainChange('solana')}
          >
            ☀️ Solana
          </button>
          <button
            style={styles.chainBtn(chain === 'base')}
            onClick={() => onChainChange('base')}
          >
            🔵 Base
          </button>
        </div>

        {/* Live Indicator */}
        <div style={styles.liveIndicator}>
          <div className="status-dot connected" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live</span>
        </div>
      </div>
    </div>
  );
}
