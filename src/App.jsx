import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import AlphaWallet from './pages/AlphaWallet';
import Trending from './pages/Trending';
import WalletTracker from './pages/WalletTracker';
import Watchlist from './pages/Watchlist';
import DevWallets from './pages/DevWallets';
import TokenScanner from './pages/TokenScanner';
import Settings from './pages/Settings';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chain, setChain] = useState('solana'); // 'solana' | 'base'

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard chain={chain} />;
      case 'alpha': return <AlphaWallet chain={chain} />;
      case 'trending': return <Trending chain={chain} />;
      case 'tracker': return <WalletTracker chain={chain} />;
      case 'watchlist': return <Watchlist chain={chain} />;
      case 'devwallets': return <DevWallets chain={chain} />;
      case 'scanner': return <TokenScanner chain={chain} />;
      case 'settings': return <Settings chain={chain} />;
      default: return <Dashboard chain={chain} />;
    }
  };

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  return (
    <div className="app-layout">
      <Sidebar
        active={activeSection}
        onNavigate={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        chain={chain}
      />
      <div className="main-area" style={{ marginLeft: sidebarWidth }}>
        <TopBar
          activeSection={activeSection}
          chain={chain}
          onChainChange={setChain}
        />
        <div className="content-area">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
