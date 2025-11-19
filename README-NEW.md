# Lichess External Mover

Node.js/Electron application for automated chess analysis using Chrome DevTools Protocol.

## Features

- **Move Analysis:** Display top 4 best moves with evaluations
- **Visual Arrows:** Colorful move indicators on the board
- **Automation:** AUTOPLAY feature for automatic move execution
- **External Engines:** Support for compiled engines like `blunder.exe`

## Quick Start

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Usage

**Full workflow** (launch Chrome + inject code):
```bash
npm start full
```

**Launch Chrome only:**
```bash
npm start launch
```

**Inject into existing Chrome session:**
```bash
npm start inject
```

## How It Works

The application follows a three-step workflow:

1. **launchChrome()** - Starts Chrome with `--remote-debugging-port=9222` and a dedicated profile
2. **injectCode()** - Connects via CDP, finds chess.com/lichess.org tabs
3. **injectIntoTab()** - Injects analyzer script with CSP bypass

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Testing

Run unit tests:
```bash
npm test
```

## Project Structure

```
lbot/
├── helpers-chrome.ts       # Chrome path detection & debug check
├── launchChrome.ts         # Chrome launcher with retry logic
├── injectCode.ts           # CDP tab discovery & injection coordinator
├── injectIntoTab.ts        # Individual tab injection with CSP bypass
├── index.ts                # Main entry point
├── dist-inject.js          # Injected analyzer script (stub)
├── test-*.test.ts          # Unit tests
├── ARCHITECTURE.md         # Full documentation
└── package.json            # Dependencies and scripts
```

## Troubleshooting

### Chrome not found
Install Google Chrome or set `CHROME_PATH` environment variable.

### No chess tabs found
Open chess.com or lichess.org in the launched Chrome window before running injection.

### CSP errors
Ensure `Page.setBypassCSP` is called before `Runtime.evaluate` (already handled in code).

### Port 9222 in use
Close existing Chrome debug sessions:
```bash
# Linux/macOS
lsof -i :9222 | grep LISTEN | awk '{print $2}' | xargs kill

# Windows
netstat -ano | findstr :9222
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for comprehensive troubleshooting.

## Requirements

- Node.js 18+ (for native `fetch` API)
- Google Chrome or Chromium
- TypeScript 5.3+

## Development

The codebase uses ES2022 modules with TypeScript. Key dependencies:

- `chrome-remote-interface` - CDP client library
- `jest` - Testing framework

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture, workflow, and troubleshooting guide

## License

MIT

---

**Note:** UI references in documentation are based on provided project descriptions. The actual UI is rendered by `dist/inject.js`.
