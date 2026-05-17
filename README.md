# ⛓ Chain Watcher — Solana & Base Alpha Dashboard

### Chain Watcher is a Solana and Base memecoin alpha dashboard designed to identify skilled trading wallets, track smart money movements, and provide real-time market intelligence across both chains. The app runs as a local web application (single HTML file) that opens in any browser with zero installation required. A global chain toggle switches the entire app between Solana and Base.

## First Time Setup (5 minutes, one time only)

### Step 1: Install Node.js
1. Go to **https://nodejs.org/**


### Step 2: Setup Chain Watcher
1. Open the **chain-watcher** folder
2. Double-click **setup.bat**
3. Wait for it to finish (1-2 minutes — it downloads dependencies)
4. You'll see "Setup Complete!" when done

### Step 3: Launch the App
1. Double-click **start.bat**
2. Chain Watcher will open in its own window
3. Done!

## Connecting Your APIs
1. Open Chain Watcher
2. Click **Settings** in the sidebar
3. Click **Connect** on any service
4. Paste your API key and click **Save**
5. Keys are encrypted and stored securely on your machine


---

## Troubleshooting

**"npm is not recognized"**
→ Node.js isn't installed. Go to https://nodejs.org/ and install it.

**App won't start**
→ Try running setup.bat again. If that fails, delete the `node_modules` folder and run setup.bat.

**Blank white screen**
→ Wait 5-10 seconds. The React dev server needs a moment to start.

---

## Data Sources


| Service | Auth Required | Cost | Chain Support |
| :--- | :--- | :--- | :--- |
| **DexScreener** | None (auto-connected) | Free | Solana + Base |
| **Birdeye** | API Key (paste in settings) | Free tier (Pro toggle available) | Solana + Base |
| **Axiom Trade** | Auth + refresh token (from browser) | Free (requires account) | Solana only |
| **BullX Terminal** | Auth token (from browser) | Free (requires account) | Solana + Base (Neo + Turbo) |
| **GoldRush** | API Key (paste in settings) | Free tier | Base only |
| **Bitquery** | API Key (paste in settings) | Free tier | Base only |
| **Arkham Intelligence** | API Key (paste in settings) | Varies | Base only |

DexScreener and Birdeye support both chains and require no changes between Solana and Base. Axiom Trade is Solana-only. BullX Terminal uses the same token extraction approach as Axiom, with BullX Neo covering Solana and BullX Turbo covering Base/EVM chains. For Base, GoldRush provides deep chain data, Bitquery adds real-time WebSocket feeds, and Arkham Intelligence provides wallet-level intelligence and entity labeling.
Feel free to use your own paid api with better access

## Customization & Updates

### Preferences Panel
•	Built-in settings for filters, refresh intervals, themes, layout, and thresholds
•	All changes saved locally, no coding required

### Presets System
All scoring, filtering, and threshold parameters are fully adjustable from the Settings page. Users can save named presets and switch between them with one click.

### Adjustable Parameters
•	Alpha Wallet token filters (mcap targets, volume minimums, global fee minimums per subsection)
•	Scoring point weights (all 6 categories: Entry Quality, Conviction, Profitability, Risk Management, Credibility, Trading Style)
•	Entry timing thresholds (all tiers per subsection, e.g. sub 10k, sub 30k, sub 50k)
•	Hold time thresholds (all tiers per subsection)
•	Trending criteria (mcap ceiling, minimum wallet count, all 6 qualifying wallet conditions)
•	Wallet grade cutoffs (S+ threshold, S threshold, A threshold, B threshold, filter-out threshold)
•	Badge trigger conditions (all 11 skill badges + warning badge thresholds)
•	Token Scanner result count (default: top 15)

### Named Presets
•	Save multiple named presets (e.g. “Bull Market”, “Bear Market”, “Degen Mode”)
•	Switch between presets with one click
•	“Reset to Default” button restores all values to the spec document factory defaults
•	Unlimited presets can be saved

### Per-Chain Presets
•	Separate presets for Solana and Base
•	Switching the chain toggle automatically loads that chain’s active preset
•	Each chain maintains its own default values (Solana defaults and Base defaults are different)
