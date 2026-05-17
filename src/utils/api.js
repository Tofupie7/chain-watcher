// ============ DEXSCREENER API (Free, no key) ============

const DEX_BASE = 'https://api.dexscreener.com/latest/dex';

export async function fetchTokenInfo(contractAddress, chain = 'solana') {
  try {
    const res = await fetch(`${DEX_BASE}/tokens/${contractAddress}`);
    if (!res.ok) throw new Error(`DexScreener error: ${res.status}`);
    const data = await res.json();
    
    if (!data.pairs || data.pairs.length === 0) return null;

    const chainMap = { solana: 'solana', base: 'base' };
    const chainId = chainMap[chain] || 'solana';
    
    const pairs = data.pairs
      .filter(p => p.chainId === chainId)
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));

    return formatDexPair(pairs.length > 0 ? pairs[0] : data.pairs[0]);
  } catch (err) {
    console.error('DexScreener fetch failed:', err);
    throw err;
  }
}

function formatDexPair(pair) {
  const createdAt = pair.pairCreatedAt ? new Date(pair.pairCreatedAt) : null;
  const ageMs = createdAt ? Date.now() - createdAt.getTime() : null;
  
  return {
    name: pair.baseToken?.name || 'Unknown',
    symbol: pair.baseToken?.symbol || '???',
    address: pair.baseToken?.address || '',
    pairAddress: pair.pairAddress || '',
    chain: pair.chainId || 'solana',
    dex: pair.dexId || 'unknown',
    price: parseFloat(pair.priceUsd) || 0,
    priceChange24h: pair.priceChange?.h24 || 0,
    mcap: pair.marketCap || pair.fdv || 0,
    volume24h: pair.volume?.h24 || 0,
    liquidity: pair.liquidity?.usd || 0,
    txns24h: {
      buys: pair.txns?.h24?.buys || 0,
      sells: pair.txns?.h24?.sells || 0,
    },
    createdAt: createdAt ? createdAt.toISOString() : null,
    ageMs,
    ageFormatted: ageMs ? formatAge(ageMs) : 'Unknown',
    url: pair.url || `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
    imageUrl: pair.info?.imageUrl || null,
  };
}

function formatAge(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}


// ============ BIRDEYE API ============

const BIRDEYE_BASE = 'https://public-api.birdeye.so';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function birdeyeHeaders(apiKey, chain = 'solana') {
  return {
    'X-API-KEY': apiKey,
    'x-chain': chain,
    'Accept': 'application/json',
  };
}


// ============ MAIN: FETCH TOP TRADERS ============

/**
 * Two-part approach that works on Birdeye FREE tier:
 * 
 * Part A: Get top 10 traders by volume from /top_traders (most meaningful positions)
 * Part B: Get swap transactions from /txs/token to calculate actual USD PnL per wallet
 * 
 * Volume-only approach filters out spam bots that inflate trade counts.
 * Total: ~6 API calls with 3 sec delays = ~18 seconds
 */
export async function fetchTopTraders(contractAddress, apiKey, chain = 'solana', onProgress) {

  // ---- PART A: Get trader addresses by volume ----
  if (onProgress) onProgress('Fetching top traders by volume...');
  
  let traderMap = new Map(); // address -> { tradeBuy, tradeSell, tags }
  
  try {
    const url = `${BIRDEYE_BASE}/defi/v2/tokens/top_traders?address=${contractAddress}&time_frame=24h&sort_type=desc&sort_by=volume&offset=0&limit=10`;
    const res = await fetch(url, { headers: birdeyeHeaders(apiKey, chain) });
    if (res.ok) {
      const data = await res.json();
      const items = data.data?.items || [];
      console.log(`[CW] top_traders (volume): ${items.length} traders`);
      for (const t of items) {
        if (t.owner) {
          traderMap.set(t.owner, { tradeBuy: t.tradeBuy || 0, tradeSell: t.tradeSell || 0, tags: t.tags || [] });
        }
      }
    }
  } catch (err) {
    console.warn('[CW] top_traders volume failed:', err.message);
  }
  
  console.log(`[CW] Total trader addresses: ${traderMap.size}`);


  // ---- PART B: Get swap transactions to calculate USD PnL ----
  if (onProgress) onProgress(`Fetching swap transactions for PnL calculation...`);
  
  await delay(3000);
  
  const allSwaps = [];
  const pagesToFetch = 5; // 50 swaps total
  
  for (let page = 0; page < pagesToFetch; page++) {
    if (page > 0) await delay(3000);
    
    if (onProgress) onProgress(`Fetching swaps: page ${page + 1}/${pagesToFetch}...`);
    
    try {
      const offset = page * 10;
      const url = `${BIRDEYE_BASE}/defi/txs/token?address=${contractAddress}&tx_type=swap&sort_type=desc&offset=${offset}&limit=10`;
      const res = await fetch(url, { headers: birdeyeHeaders(apiKey, chain) });
      
      if (!res.ok) {
        console.warn(`[CW] txs page ${page + 1} failed: ${res.status}`);
        if (res.status === 429) {
          console.log('[CW] Rate limited, waiting longer...');
          await delay(5000);
        }
        break;
      }
      
      const data = await res.json();
      const items = data.data?.items || [];
      
      // Filter to only swaps (safety check)
      const swaps = items.filter(tx => tx.txType === 'swap' && tx.owner && tx.side);
      allSwaps.push(...swaps);
      
      console.log(`[CW] Swaps page ${page + 1}: ${swaps.length} swaps (${allSwaps.length} total)`);
      
      if (items.length < 10) break;
    } catch (err) {
      console.warn(`[CW] txs page ${page + 1} error:`, err.message);
      break;
    }
  }
  
  console.log(`[CW] Total swaps collected: ${allSwaps.length}`);
  
  if (allSwaps.length > 0) {
    console.log('[CW] Sample swap:', JSON.stringify(allSwaps[0], null, 2));
  }


  // ---- PART C: Aggregate per-wallet PnL from swaps ----
  if (onProgress) onProgress('Calculating wallet PnL...');
  
  const wallets = {};
  
  for (const tx of allSwaps) {
    const wallet = tx.owner;
    if (!wallet) continue;
    
    if (!wallets[wallet]) {
      wallets[wallet] = {
        address: wallet,
        totalBoughtUsd: 0,
        totalSoldUsd: 0,
        buyCount: 0,
        sellCount: 0,
        firstBuyTime: null,
        lastSellTime: null,
        tags: traderMap.get(wallet)?.tags || [],
        inTopTraders: traderMap.has(wallet),
      };
    }
    
    const w = wallets[wallet];
    const timestamp = tx.blockUnixTime ? tx.blockUnixTime * 1000 : Date.now();
    
    // Calculate USD value from SOL (quote) side
    // quote.uiChangeAmount is negative when spending SOL (buying tokens)
    // quote.uiChangeAmount is positive when receiving SOL (selling tokens)
    const solAmount = Math.abs(tx.quote?.uiChangeAmount || tx.quote?.uiAmount || 0);
    const solPrice = tx.quotePrice || tx.quote?.price || 0;
    const usdValue = solAmount * solPrice;
    
    if (tx.side === 'buy') {
      w.totalBoughtUsd += usdValue;
      w.buyCount++;
      if (!w.firstBuyTime || timestamp < w.firstBuyTime) {
        w.firstBuyTime = timestamp;
      }
    } else if (tx.side === 'sell') {
      w.totalSoldUsd += usdValue;
      w.sellCount++;
      if (!w.lastSellTime || timestamp > w.lastSellTime) {
        w.lastSellTime = timestamp;
      }
    }
  }
  
  // ---- PART D: Calculate ROI and format results ----
  const results = Object.values(wallets)
    // Must have both buys AND sells (realized profit only)
    .filter(w => w.totalBoughtUsd > 0.01 && w.sellCount > 0)
    .map(w => {
      // Realized ROI: (sold - bought) / bought * 100
      const roi = ((w.totalSoldUsd - w.totalBoughtUsd) / w.totalBoughtUsd) * 100;
      const holdTimeMs = (w.lastSellTime || Date.now()) - (w.firstBuyTime || Date.now());
      const stillHolding = w.totalSoldUsd < w.totalBoughtUsd * 0.5;
      const isBot = w.tags?.some(t => t.includes('bot'));
      
      // Add trade counts from top_traders if available (may have more complete data)
      const topTraderData = traderMap.get(w.address);
      
      return {
        address: w.address,
        roi: Math.round(roi * 10) / 10,
        realizedPnl: Math.round((w.totalSoldUsd - w.totalBoughtUsd) * 100) / 100,
        totalBoughtUsd: Math.round(w.totalBoughtUsd * 100) / 100,
        totalSoldUsd: Math.round(w.totalSoldUsd * 100) / 100,
        buyCount: topTraderData?.tradeBuy || w.buyCount,
        sellCount: topTraderData?.tradeSell || w.sellCount,
        holdTimeMs,
        holdTimeFormatted: holdTimeMs > 0 ? formatAge(Math.abs(holdTimeMs)) : 'N/A',
        stillHolding,
        tags: w.tags,
        isBot,
        inTopTraders: w.inTopTraders,
        entryMcap: 0,
      };
    })
    .sort((a, b) => b.roi - a.roi);
  
  console.log(`[CW] Final: ${results.length} wallets with realized PnL`);
  if (results.length > 0) {
    console.log('[CW] Top 3:', results.slice(0, 3).map(w => 
      `${w.address.slice(0,6)}... ROI: ${w.roi}% Bought: $${w.totalBoughtUsd} Sold: $${w.totalSoldUsd}`
    ));
  } else {
    console.log('[CW] No wallets found with both buys and sells in recent swaps.');
    console.log(`[CW] Total wallets seen in swaps: ${Object.keys(wallets).length}`);
    console.log('[CW] Wallets with only buys:', Object.values(wallets).filter(w => w.buyCount > 0 && w.sellCount === 0).length);
    console.log('[CW] Wallets with only sells:', Object.values(wallets).filter(w => w.sellCount > 0 && w.buyCount === 0).length);
  }
  
  return results;
}


// ============ ALPHA WALLET ELIGIBILITY ============

const SOLANA_DEFAULTS = {
  dailyMigrated: { mcap: 20000, minHold: 10 },
  dailyRunner: { mcap: 220000, minHold: 15 },
  weeklyRunner: { mcap: 500000, minHold: 15 },
  gemFinders: { mcap: 1000000, minHold: 15 },
};

const BASE_DEFAULTS = {
  dailyRunner: { mcap: 80000, minHold: 15 },
  weeklyRunner: { mcap: 200000, minHold: 15 },
  gemFinders: { mcap: 400000, minHold: 15 },
};

export function checkAlphaEligibility(wallet, tokenInfo, chain = 'solana') {
  const eligible = [];
  const holdMins = wallet.holdTimeMs ? wallet.holdTimeMs / 60000 : 0;
  const thresholds = chain === 'solana' ? SOLANA_DEFAULTS : BASE_DEFAULTS;
  const tokenMcap = tokenInfo?.mcap || 0;
  const tokenAgeMs = tokenInfo?.ageMs || Infinity;
  const tokenAgeDays = tokenAgeMs / (1000 * 60 * 60 * 24);

  if (chain === 'solana' && holdMins >= thresholds.dailyMigrated.minHold && wallet.entryMcap <= thresholds.dailyMigrated.mcap) {
    eligible.push('Daily Migrated');
  }
  if (tokenMcap >= thresholds.dailyRunner.mcap && tokenAgeDays <= 1) {
    eligible.push('Daily Runner');
  }
  if (tokenMcap >= thresholds.weeklyRunner.mcap && tokenAgeDays <= 7) {
    eligible.push('Weekly Runner');
  }
  if (tokenMcap >= thresholds.gemFinders.mcap && tokenAgeDays <= 7) {
    eligible.push('Gem Finders');
  }

  return eligible;
}


// ============ SCORING ============

export function estimateScore(wallet) {
  let score = 0;

  // Profitability (max 30) — ROI% is king
  if (wallet.roi >= 1000) score += 30;
  else if (wallet.roi >= 500) score += 25;
  else if (wallet.roi >= 250) score += 20;
  else if (wallet.roi >= 100) score += 14;
  else if (wallet.roi >= 50) score += 8;
  else if (wallet.roi > 0) score += 4;

  // Trading activity (max 15)
  const totalTrades = (wallet.buyCount || 0) + (wallet.sellCount || 0);
  if (totalTrades >= 20) score += 15;
  else if (totalTrades >= 10) score += 12;
  else if (totalTrades >= 5) score += 8;
  else if (totalTrades >= 2) score += 4;

  // Sell discipline (max 10)
  if (wallet.sellCount >= 3) score += 10;
  else if (wallet.sellCount >= 2) score += 7;
  else if (wallet.sellCount >= 1) score += 4;

  // Bot detection penalty
  if (wallet.isBot) score -= 5;

  // Still holding with profit bonus
  if (wallet.stillHolding && wallet.roi > 100) score += 5;

  return Math.max(0, Math.min(score, 100));
}

export function getWalletGrade(score) {
  if (score >= 85) return { grade: 'S+', color: '#a855f7', emoji: '🟣' };
  if (score >= 70) return { grade: 'S', color: '#22c55e', emoji: '🟢' };
  if (score >= 55) return { grade: 'A', color: '#3b82f6', emoji: '🔵' };
  if (score >= 40) return { grade: 'B', color: '#eab308', emoji: '🟡' };
  return { grade: 'C', color: '#6b7280', emoji: '⚪' };
}
