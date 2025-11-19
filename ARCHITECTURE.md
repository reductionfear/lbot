# Architecture & Flow

## Overview

**Lichess External Mover** is a Node.js/Electron application that automates chess analysis by controlling a Chrome browser instance via the Chrome DevTools Protocol (CDP). Unlike browser extensions, this runs as an external process with full control over the browser session.

## Technology Stack

- **Runtime:** Node.js with Electron capabilities
- **Protocol:** Chrome DevTools Protocol (CDP) via `chrome-remote-interface`
- **Browser Control:** Dedicated Chrome instance with `--remote-debugging-port`
- **Engines:** External compiled executables (e.g., `blunder.exe`), not JavaScript-only
- **Language:** TypeScript compiled to ES2022 modules

## Key Features

Based on provided descriptions, the system supports:

1. **Move Analysis:** Displays the top 4 best moves with evaluation scores
2. **Visual Indicators:** Colorful arrows overlaid on the board (green, yellow, orange, red)
3. **Automation:** **AUTOPLAY** feature for automatic move execution
4. **Settings Panel ("PRIME CHESS"):**
   - Rating configuration (MAX setting available)
   - Depth control (e.g., DEPTH: 10)
   - Multi-PV setting (MULTIPV: 4 for top 4 moves)
   - Perfect Opening book toggle
   - Monte Carlo Tree Search options
   - Personality modes (e.g., AGGRESSIVE)
   - Auto-skill adjustment

## Core Workflow

The application follows a strict three-step sequence:

```
launchChrome() → injectCode() → injectIntoTab()
```

### 1. launchChrome()

**Purpose:** Start Chrome with remote debugging enabled and a dedicated profile.

**Process:**
- Detects Chrome installation path (Windows, macOS, Linux)
- Spawns detached Chrome process with:
  - `--remote-debugging-port=9222` for CDP access
  - `--user-data-dir` for persistent profile (saves login state)
  - `--no-first-run` and `--no-default-browser-check` flags
- Implements retry logic: checks debug port availability every second for up to 30 seconds
- Logs progress with concise status messages: `✓ success`, `▲ skipped`, `✗ error`

**Key Code (from provided context):**
```javascript
const chromeProcess = spawn(chromePath, chromeArgs, { detached: true, stdio: 'ignore' });
chromeProcess.unref();

// Retry loop
while (retries < maxRetries) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const ready = await checkChromeDebugActive();
  if (ready) {
    console.log('✓ Chrome is ready!');
    return;
  }
  retries++;
}
```

### 2. injectCode()

**Purpose:** Connect to Chrome's debug port, discover chess tabs, and inject code.

**Process:**
- Fetches tab list via `http://localhost:9222/json` endpoint
- Filters tabs by URL (chess.com or lichess.org)
- For each matching tab:
  - Establishes CDP client connection
  - Calls `injectIntoTab()` with the inject script content
  - Handles failures gracefully (tabs may still be loading)
- Reports injection success count

**Key Code (from provided context):**
```javascript
const response = await fetch(`http://localhost:${CHROME_PORT}/json`);
const tabs = await response.json();

const chessTabs = tabs.filter(tab => 
  tab.type === 'page' && isChessPage(tab.url)
);

for (const tab of chessTabs) {
  const client = await CDP({ port: CHROME_PORT, target: tab.id });
  const success = await injectIntoTab(client, injectCode);
  if (success) {
    console.log(`✓ Injected into: ${tab.url}`);
  }
}
```

### 3. injectIntoTab(client, injectCode)

**Purpose:** Execute the analyzer script within a specific browser tab.

**Process:**
- Enables the CDP Page domain
- **Bypasses Content Security Policy** via `Page.setBypassCSP({ enabled: true })` — critical for code injection
- Evaluates the inject script using `Runtime.evaluate`
- Returns success/failure status

**Key Code (from provided context):**
```javascript
async function injectIntoTab(client, injectCode) {
  try {
    const { Page, Runtime } = client;
    await Page.enable();
    await Page.setBypassCSP({ enabled: true });  // CSP bypass
    await Runtime.evaluate({ expression: injectCode });
    return true;
  } catch (error) {
    console.error(`▲ Failed to inject: ${error.message}`);
    return false;
  }
}
```

## Helper Functions

### getChromePath()

Cross-platform Chrome installation detection:
- **Windows:** Checks `Program Files`, `Program Files (x86)`, and `LOCALAPPDATA`
- **macOS:** Looks in `/Applications/Google Chrome.app`
- **Linux:** Tries `/usr/bin/google-chrome`, `chromium`, etc.

Throws an error if Chrome is not found.

### checkChromeDebugActive()

Polls `http://localhost:9222/json/version` to verify the debug port is active. Used in the retry loop during `launchChrome()`.

## Injected Script Behavior

The `dist/inject.js` file contains the actual chess analyzer logic. Based on provided console logs (Screenshot 1):

1. **Initialization:** Logs `[Inject] Initializing Chess Analyzer for Lichess`
2. **Board Detection:** Identifies the chessboard DOM element
3. **FEN Extraction:** Captures board state (e.g., `r1bqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1`)
4. **Engine Communication:** Sends position to external engine, receives evaluations
5. **UI Rendering:** Displays "PRIME CHESS" panel with settings and top moves
6. **Arrow Visualization:** Draws colored arrows with eval scores on the board

## UI Components (from provided descriptions)

The injected script creates a custom UI overlay:

### Analysis Panel
- **Header:** "♪ Waiting…" when idle, or move recommendations when active
- **Top Move Display:** e.g., `e2e4` with evaluation `0.78`
- **Settings Row:** Shows RATING, DEPTH, MULTIPV, AUTOPLAY status
- **Control Buttons:** SETTINGS (opens modal), STOP (red, halts engine)

### Settings Modal
- **Title:** SETTINGS
- **Toggles:**
  - Perfect Opening (book file usage)
  - Monte Carlo Tree Search
  - Auto Skill adjustment
- **Sliders:** MCTS Hash Memory (MB)
- **Dropdowns:** Personality (e.g., AGGRESSIVE)
- **Actions:** RESET (red), SAVE (blue)

### Move Arrows (Screenshot 3)
- **Green arrow:** Best move (0.78 eval)
- **Yellow arrow:** Second best (0.77)
- **Orange arrow:** Third best (0.75)
- **Red arrow:** Fourth best (0.52)

Colors and positions overlay directly on the Lichess board interface.

## Error Handling

The system uses a tiered logging approach:

- **✓ Success:** Operations completed without issue
- **▲ Skipped:** Non-critical failures (e.g., tab still loading)
- **✗ Error:** Critical failures requiring user intervention

All error messages are concise and user-facing, avoiding technical stack traces where possible.

## Security Considerations

1. **CSP Bypass:** Required for code injection; only used within user's own browser session
2. **Process Isolation:** Chrome runs detached to prevent orphaned processes
3. **Local-Only:** Debug port is bound to localhost (not exposed to network)
4. **Profile Persistence:** User data directory isolates chess analyzer session from default Chrome profile

## Troubleshooting

See the dedicated Troubleshooting section in this document.

---

# Troubleshooting

## Debug Port Issues

**Problem:** Chrome fails to start with debugging enabled.

**Solutions:**
- Verify no other process is using port 9222:
  ```bash
  # Linux/macOS
  lsof -i :9222
  
  # Windows
  netstat -ano | findstr :9222
  ```
- Kill existing Chrome debug instances before launching
- Try a different port by modifying `CHROME_PORT` in `helpers/chrome.ts`

## CSP (Content Security Policy) Errors

**Problem:** Injection fails with CSP violations.

**Solutions:**
- Ensure `Page.setBypassCSP({ enabled: true })` is called **before** `Runtime.evaluate`
- Verify the CDP connection is established (`Page.enable()` must succeed)
- Check browser console for CSP error details

**Code Check:**
```typescript
// Correct order:
await Page.enable();
await Page.setBypassCSP({ enabled: true });  // MUST come before evaluate
await Runtime.evaluate({ expression: injectCode });
```

## Tab Discovery Problems

**Problem:** `injectCode()` reports "No chess.com or lichess.org tabs found."

**Solutions:**
- Manually open a chess.com or lichess.org tab in the launched Chrome window
- Wait for pages to fully load before running injection
- Check the URL filter logic in `injectCode.ts`:
  ```typescript
  function isChessPage(url: string): boolean {
    return url.includes('chess.com') || url.includes('lichess.org');
  }
  ```
- Verify tab list retrieval: `curl http://localhost:9222/json` should show active tabs

## Injection Timing Issues

**Problem:** Injection succeeds but analyzer doesn't activate.

**Solutions:**
- Increase delay between `launchChrome()` and `injectCode()` (default: 3 seconds in full workflow)
- Re-run injection after pages fully load:
  ```bash
  npm start inject
  ```
- Check browser DevTools console for inject script errors

## Chrome Path Detection Failures

**Problem:** `getChromePath()` throws "Chrome not found" error.

**Solutions:**
- Install Google Chrome from official source
- Set `CHROME_PATH` environment variable:
  ```bash
  export CHROME_PATH="/path/to/chrome"
  ```
- Modify path arrays in `helpers/chrome.ts` for custom installations

## Profile/Lock File Conflicts

**Problem:** Chrome refuses to start due to existing profile lock.

**Solutions:**
- Delete `.chrome-analyzer-profile` directory
- Remove `.chrome-analyzer-lock` file
- Ensure previous Chrome instances are fully closed

## Network/Fetch Errors

**Problem:** `checkChromeDebugActive()` or tab fetching fails.

**Solutions:**
- Verify `fetch` API is available (Node.js 18+ required)
- Check firewall rules for localhost connections
- Ensure Chrome's debug port listener is active (visible in Chrome's task manager)

---

**Note:** All UI references in this document are based on provided descriptions from the project context. The actual UI rendering is handled by the injected script (`dist/inject.js`).
