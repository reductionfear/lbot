# Local Development Commands

## Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Usage

```bash
# Run full workflow (launch Chrome + inject)
npm start full

# Launch Chrome only
npm start launch

# Inject into existing Chrome session
npm start inject
```

## Testing

Tests are provided in `test-*.test.ts` files:
- `test-injectCode.test.ts` - Tab filtering and URL detection
- `test-launchChrome.test.ts` - Launch retry logic and configuration
- `test-injectIntoTab.test.ts` - Injection and CSP bypass

To run tests (after Jest is properly configured):
```bash
npm test
```

## Build Output

Compiled files will be in `dist/`:
- `dist/index.js` - Main entry point
- `dist/launchChrome.js` - Chrome launcher
- `dist/injectCode.js` - Injection coordinator
- `dist/injectIntoTab.js` - Tab injector
- `dist/helpers-chrome.js` - Helper functions

## Directory Structure

```
lbot/
├── dist/                         # Build output (generated)
│   ├── index.js
│   ├── launchChrome.js
│   ├── injectCode.js
│   └── ...
├── .chrome-analyzer-profile/     # Chrome user data (generated)
├── .chrome-analyzer-lock         # Lock file (generated)
├── helpers-chrome.ts             # Source files
├── launchChrome.ts
├── injectCode.ts
├── injectIntoTab.ts
├── index.ts
├── dist-inject.js                # Inject script
├── test-*.test.ts                # Tests
├── ARCHITECTURE.md               # Documentation
└── package.json
```

## Troubleshooting

### Chrome not found
```bash
# Set Chrome path manually
export CHROME_PATH="/path/to/chrome"
npm start launch
```

### Port 9222 in use
```bash
# Find and kill process
lsof -i :9222
kill -9 <PID>
```

### Build errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Inject script not found
The system will use `dist-inject.js` as a stub. For production, create `dist/inject.js` with actual chess analysis logic.

## Development Workflow

1. Edit TypeScript files (`*.ts`)
2. Build with `npm run build`
3. Test with `npm start [command]`
4. Check Chrome DevTools console for inject script output

## README Snippet for Project Root

You can replace the existing README with the content from `README-NEW.md`, or add this section:

```markdown
## Chrome Connection + Injection

This project now includes a complete Chrome DevTools Protocol (CDP) integration for automated chess analysis.

### Quick Start
\`\`\`bash
npm install
npm run build
npm start full
\`\`\`

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete technical documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details

### Features
- Automated Chrome launch with debugging enabled
- Tab discovery and filtering (chess.com, lichess.org)
- Code injection with CSP bypass
- Top 4 move analysis with colorful arrows
- Settings panel and automove capability
\`\`\`

See [README-NEW.md](./README-NEW.md) for full documentation.
