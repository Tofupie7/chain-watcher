import React from 'react';

const SECTIONS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'alpha', icon: '🏆', label: 'Alpha Wallet' },
  { id: 'trending', icon: '🔥', label: 'Trending' },
  { id: 'tracker', icon: '👁️', label: 'Wallet Tracker' },
  { id: 'watchlist', icon: '⭐', label: 'Watchlist' },
  { id: 'devwallets', icon: '👨‍💻', label: 'Dev Wallets', solanaOnly: true },
  { id: 'scanner', icon: '🔍', label: 'Token Scanner' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const styles = {
  sidebar: (collapsed) => ({
    width: collapsed ? 64 : 220,
    minHeight: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width var(--transition-normal)',
    flexShrink: 0,
    position: 'fixed',
    zIndex: 50,
    top: 0,
    left: 0,
    bottom: 0,
  }),
  logo: (collapsed) => ({
    padding: collapsed ? '18px 0' : '18px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid var(--border)',
    justifyContent: collapsed ? 'center' : 'flex-start',
    minHeight: 60,
    WebkitAppRegion: 'drag',
  }),
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 800,
    color: '#0a0d13',
    flexShrink: 0,
    boxShadow: '0 2px 12px rgba(245,158,11,0.25)',
  },
  navArea: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navItem: (isActive, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '10px 0' : '10px 12px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: isActive ? 'var(--amber-subtle)' : 'transparent',
    color: isActive ? 'var(--amber)' : 'var(--text-muted)',
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    fontFamily: 'var(--font-ui)',
    transition: 'all var(--transition-fast)',
    borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent',
    width: '100%',
    textAlign: 'left',
  }),
  navIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
    flexShrink: 0,
  },
  collapseBtn: {
    padding: 14,
    border: 'none',
    borderTop: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--font-ui)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    transition: 'color var(--transition-fast)',
  },
  chainBadge: {
    fontSize: 9,
    padding: '1px 5px',
    borderRadius: 4,
    background: 'rgba(245,158,11,0.1)',
    color: 'var(--amber)',
    fontWeight: 600,
    marginLeft: 'auto',
  }
};

export default function Sidebar({ active, onNavigate, collapsed, onToggleCollapse, chain }) {
  const visibleSections = SECTIONS.filter(s => {
    if (s.solanaOnly && chain === 'base') return false;
    return true;
  });

  return (
    <div style={styles.sidebar(collapsed)}>
      {/* Logo */}
      <div style={styles.logo(collapsed)}>
        <div style={styles.logoIcon}>⛓</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Chain Watcher
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {chain === 'solana' ? 'Solana' : 'Base'} Alpha
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div style={styles.navArea}>
        {visibleSections.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            style={styles.navItem(active === s.id, collapsed)}
            onMouseEnter={(e) => {
              if (active !== s.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== s.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <span style={styles.navIcon}>{s.icon}</span>
            {!collapsed && <span>{s.label}</span>}
            {!collapsed && s.solanaOnly && (
              <span style={styles.chainBadge}>SOL</span>
            )}
          </button>
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        style={styles.collapseBtn}
        onClick={onToggleCollapse}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
      >
        {collapsed ? '→' : '← Collapse'}
      </button>
    </div>
  );
}
