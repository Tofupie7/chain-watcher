import React, { useState, useEffect } from 'react';

const API_SERVICES = [
  {
    id: 'dexscreener',
    name: 'DexScreener',
    icon: '📊',
    desc: 'Free · No key required · Auto-connected',
    chains: ['solana', 'base'],
    authType: 'none',
    alwaysConnected: true,
  },
  {
    id: 'birdeye',
    name: 'Birdeye',
    icon: '🦅',
    desc: 'Token data, OHLCV, wallet PnL, holders, security',
    chains: ['solana', 'base'],
    authType: 'apikey',
    placeholder: 'Paste your Birdeye API key...',
    hasProToggle: true,
  },
  {
    id: 'axiom',
    name: 'Axiom Trade',
    icon: '⚡',
    desc: 'Wallet balances, trending, new token alerts',
    chains: ['solana'],
    authType: 'dual-token',
    placeholders: {
      access: 'Paste auth-access-token (starts with eyJ...)',
      refresh: 'Paste auth-refresh-token (starts with eyJ...)',
    },
    hasGuide: true,
    guideSteps: [
      'Open axiom.trade in Chrome and log in to your account',
      'Press F12 to open Developer Tools',
      'Click the Application tab at the top (not Console or Network)',
      'In the left sidebar, expand Cookies → click https://axiom.trade',
      'Find auth-access-token — double-click the Value column and copy it',
      'Find auth-refresh-token — double-click the Value column and copy it',
      'Paste both tokens below and click Save',
    ],
    guideNote: 'Access tokens expire after ~24 hours. The refresh token lasts longer and Chain Watcher will auto-refresh when possible. If data stops loading, re-extract both tokens.',
  },
  {
    id: 'bullx',
    name: 'BullX Terminal',
    icon: '🐂',
    desc: 'Neo (Solana) + Turbo (Base) trading data',
    chains: ['solana', 'base'],
    authType: 'token',
    placeholder: 'Paste your BullX auth token...',
    hasGuide: true,
    guideSteps: [
      'Open bullx.io in Chrome and log in to your account',
      'Press F12 to open Developer Tools',
      'Click the Application tab at the top',
      'In the left sidebar, expand Cookies → click https://bullx.io',
      'Find the bullx-token cookie — double-click the Value and copy it',
      'Paste it below and click Save',
    ],
    guideNote: 'Token may expire periodically. If data stops loading, re-extract the token.',
  },
  {
    id: 'goldrush',
    name: 'GoldRush',
    icon: '🪙',
    desc: 'Deep Base chain data, balances, transactions, events',
    chains: ['base'],
    authType: 'apikey',
    placeholder: 'Paste your GoldRush API key...',
  },
  {
    id: 'bitquery',
    name: 'Bitquery',
    icon: '📡',
    desc: 'GraphQL queries + real-time WebSocket feeds',
    chains: ['base'],
    authType: 'apikey',
    placeholder: 'Paste your Bitquery API key...',
  },
  {
    id: 'arkham',
    name: 'Arkham Intelligence',
    icon: '🕵️',
    desc: 'Wallet intelligence + entity labeling',
    chains: ['base'],
    authType: 'apikey',
    placeholder: 'Paste your Arkham API key...',
  },
  {
    id: 'claude',
    name: 'Claude AI',
    icon: '🤖',
    desc: 'Natural language app customization',
    chains: ['solana', 'base'],
    authType: 'apikey',
    placeholder: 'Paste your Claude API key...',
    optional: true,
  },
];

function ConnectionCard({ service, credentials, onSave, onDelete }) {
  const [inputValue, setInputValue] = useState('');
  const [refreshValue, setRefreshValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [proEnabled, setProEnabled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isDualToken = service.authType === 'dual-token';
  const isConnected = service.alwaysConnected || !!credentials[service.id];
  const statusText = service.alwaysConnected ? 'Connected' : isConnected ? 'Connected' : 'Not Connected';
  const statusClass = isConnected ? 'connected' : 'disconnected';

  const handleSave = () => {
    if (isDualToken) {
      if (inputValue.trim() && refreshValue.trim()) {
        onSave(service.id, JSON.stringify({ access: inputValue.trim(), refresh: refreshValue.trim() }));
        setInputValue('');
        setRefreshValue('');
        setShowInput(false);
      }
    } else {
      if (inputValue.trim()) {
        onSave(service.id, inputValue.trim());
        setInputValue('');
        setShowInput(false);
      }
    }
  };

  const handleDisconnect = () => {
    onDelete(service.id);
  };

  return (
    <div className="card" style={{ padding: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{service.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {service.name}
            </span>
            {service.chains.map(c => (
              <span key={c} style={{
                fontSize: 9,
                padding: '1px 6px',
                borderRadius: 4,
                background: c === 'solana' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                color: c === 'solana' ? 'var(--amber)' : 'var(--blue)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {c}
              </span>
            ))}
            {service.optional && (
              <span style={{
                fontSize: 9, padding: '1px 6px', borderRadius: 4,
                background: 'rgba(90,101,119,0.15)', color: 'var(--text-muted)', fontWeight: 500,
              }}>
                Optional
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
            {service.desc}
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className={`status-dot ${statusClass}`} />
          <span style={{
            fontSize: 12,
            color: isConnected ? 'var(--green)' : 'var(--red)',
            fontWeight: 500,
          }}>
            {statusText}
          </span>
          {service.hasProToggle && isConnected && (
            <button
              onClick={() => setProEnabled(!proEnabled)}
              style={{
                marginLeft: 8,
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: proEnabled ? 'var(--amber)' : 'var(--border)',
                background: proEnabled ? 'var(--amber-subtle)' : 'transparent',
                color: proEnabled ? 'var(--amber)' : 'var(--text-dim)',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {proEnabled ? '✓ Pro' : 'Free Tier'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {service.hasGuide && (
            <button
              className="btn btn-ghost"
              onClick={() => setShowGuide(!showGuide)}
              style={{ fontSize: 11 }}
            >
              {showGuide ? 'Hide Guide' : '📖 Setup Guide'}
            </button>
          )}
          {service.authType !== 'none' && (
            isConnected && !service.alwaysConnected ? (
              <button className="btn btn-ghost" onClick={handleDisconnect} style={{ fontSize: 11, color: 'var(--red)' }}>
                Disconnect
              </button>
            ) : (
              <button className="btn btn-amber" onClick={() => setShowInput(!showInput)} style={{ fontSize: 11 }}>
                {showInput ? 'Cancel' : 'Connect'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Input Fields — Single Token / API Key */}
      {showInput && service.authType !== 'none' && service.authType !== 'dual-token' && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input
            className="input"
            type="password"
            placeholder={service.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-mono)' }}
          />
          <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: 12 }}>
            Save
          </button>
        </div>
      )}

      {/* Input Fields — Dual Token (Axiom) */}
      {showInput && service.authType === 'dual-token' && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
              Access Token
            </div>
            <input
              className="input"
              type="password"
              placeholder={service.placeholders.access}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
              Refresh Token
            </div>
            <input
              className="input"
              type="password"
              placeholder={service.placeholders.refresh}
              value={refreshValue}
              onChange={(e) => setRefreshValue(e.target.value)}
              style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: 12, alignSelf: 'flex-end', marginTop: 4 }}>
            Save Both Tokens
          </button>
        </div>
      )}

      {/* Setup Guide — Custom Steps */}
      {showGuide && service.guideSteps && (
        <div style={{
          marginTop: 12,
          padding: 14,
          background: 'var(--bg-primary)',
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 10 }}>
            How to get your {service.name} tokens:
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 2 }}>
            {service.guideSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--amber)', fontWeight: 600, minWidth: 18 }}>{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          {service.guideNote && (
            <div style={{
              fontSize: 10,
              color: 'var(--text-dim)',
              marginTop: 10,
              padding: '8px 10px',
              background: 'rgba(245,158,11,0.05)',
              borderRadius: 6,
              border: '1px solid rgba(245,158,11,0.1)',
              fontStyle: 'italic',
            }}>
              ⚠️ {service.guideNote}
            </div>
          )}
        </div>
      )}

      {/* Setup Guide — Generic Fallback */}
      {showGuide && !service.guideSteps && (
        <div style={{
          marginTop: 12,
          padding: 14,
          background: 'var(--bg-primary)',
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 8 }}>
            How to get your {service.name} auth token:
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            1. Open {service.name} in your browser and log in<br />
            2. Open Developer Tools (F12 or Ctrl+Shift+I)<br />
            3. Go to the Application tab → Cookies<br />
            4. Find the auth token cookie and copy its value<br />
            5. Paste it above and click Save
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8, fontStyle: 'italic' }}>
            Note: Tokens expire periodically. You may need to re-extract them.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings({ chain }) {
  const [credentials, setCredentials] = useState({});
  const [activeTab, setActiveTab] = useState('connections');

  // Load credentials on mount
  useEffect(() => {
    async function load() {
      if (window.chainWatcher?.credentials) {
        try {
          const creds = await window.chainWatcher.credentials.get();
          setCredentials(creds || {});
        } catch {
          // Running in browser (dev mode), use localStorage fallback
          try {
            const stored = localStorage.getItem('cw_credentials');
            if (stored) setCredentials(JSON.parse(stored));
          } catch {}
        }
      }
    }
    load();
  }, []);

  const handleSave = async (serviceId, value) => {
    const updated = { ...credentials, [serviceId]: value };
    setCredentials(updated);
    try {
      if (window.chainWatcher?.credentials) {
        await window.chainWatcher.credentials.save(updated);
      } else {
        localStorage.setItem('cw_credentials', JSON.stringify(updated));
      }
    } catch {}
  };

  const handleDelete = async (serviceId) => {
    const updated = { ...credentials };
    delete updated[serviceId];
    setCredentials(updated);
    try {
      if (window.chainWatcher?.credentials) {
        await window.chainWatcher.credentials.save(updated);
      } else {
        localStorage.setItem('cw_credentials', JSON.stringify(updated));
      }
    } catch {}
  };

  // Show ALL services in Settings — users should configure everything regardless of active chain
  const visibleServices = API_SERVICES;

  const tabs = ['Connections', 'Presets', 'Preferences'];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {tabs.map((tab) => {
          const tabId = tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tabId)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px 8px 0 0',
                border: '1px solid',
                borderColor: activeTab === tabId ? 'var(--amber)' : 'var(--border-light)',
                borderBottom: activeTab === tabId ? '2px solid var(--amber)' : '1px solid var(--border-light)',
                background: activeTab === tabId ? 'var(--amber-subtle)' : 'var(--bg-secondary)',
                color: activeTab === tabId ? 'var(--amber)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: activeTab === tabId ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {visibleServices.map(service => (
            <ConnectionCard
              key={service.id}
              service={service}
              credentials={credentials}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="card" style={{ minHeight: 400 }}>
          <div className="card-header">
            <div className="card-title">
              ⚙️ Presets — {chain === 'solana' ? 'Solana' : 'Base'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-amber">+ New Preset</button>
              <button className="btn btn-ghost">Reset to Default</button>
            </div>
          </div>
          <div className="page-placeholder" style={{ minHeight: 300 }}>
            <div className="icon">🎛️</div>
            <div className="title">Presets System</div>
            <div className="subtitle">
              Save named presets for scoring weights, token filters, entry timing, hold time, trending criteria, wallet grades, and badge conditions. Switch between Bull Market, Bear Market, or custom configurations with one click.
            </div>
            <div className="badge">Coming in Phase 3</div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="card" style={{ minHeight: 400 }}>
          <div className="page-placeholder" style={{ minHeight: 300 }}>
            <div className="icon">🎨</div>
            <div className="title">Preferences</div>
            <div className="subtitle">
              Refresh intervals, display options, theme tweaks, and layout settings. Quick adjustments without changing scoring logic.
            </div>
            <div className="badge">Coming in Phase 3</div>
          </div>
        </div>
      )}
    </div>
  );
}
