# Lichess External Mover

A Node.js application that uses Chrome Remote Debugging Protocol (CDP) to control a Chrome browser instance and inject chess analysis code into Lichess.org pages.

## Overview

This project is a **Node.js/Electron-based external application** (not a browser extension) that:
- Launches Chrome with remote debugging enabled (`--remote-debugging-port`)
- Connects to Chrome using the Chrome DevTools Protocol (CDP)
- Injects chess analysis code into Lichess.org and Chess.com tabs
- Supports external compiled engines (like `blunder.exe`), not just JavaScript engines

Inspired by the functionality of "Lichess Bot (stockfish8) 2.js".

## Key Features

- **Move Analysis:** Shows the top 4 best moves
- **Visuals:** Uses colorful arrows to display moves
- **Automation:** Includes an **automove** feature

## How It Works

The application follows a three-step workflow:

1. **`launchChrome()`** - Launches Chrome with remote debugging enabled on port 9222
2. **`injectCode()`** - Connects to Chrome via CDP and finds chess pages
3. **`injectIntoTab(client, code)`** - Injects the analysis code with CSP bypass

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

Run the application:
```bash
npm start
```

The application will:
1. Launch Chrome with debugging enabled (or connect to an existing instance)
2. Wait for chess pages to load
3. Automatically inject the analysis code into Lichess.org and Chess.com tabs

## Requirements

- Node.js (v18 or later recommended for native `fetch` support)
- Google Chrome or Chromium browser
- Internet connection (to load Stockfish engine from CDN)

## Project Structure

```
lbot/
├── index.js              # Main entry point
├── launchChrome.js       # Chrome launcher with debugging
├── injectCode.js         # CDP injection orchestrator
├── injectIntoTab.js      # CDP tab injection helper
├── inject.js             # Code to inject into pages
├── build.js              # Build script
├── dist/                 # Built files (created by build script)
│   └── inject.js
└── package.json          # Project dependencies
```

## Technical Details

### Chrome Launching (`launchChrome.js`)

- Detects Chrome path across platforms (Windows, macOS, Linux)
- Launches Chrome with `--remote-debugging-port=9222`
- Uses a dedicated user profile (`.chrome-analyzer-profile`)
- Waits up to 30 seconds for Chrome to be ready

### Code Injection (`injectCode.js`)

- Fetches list of open tabs from Chrome debugging endpoint
- Filters for chess.com and lichess.org pages
- Injects code into each matching tab using CDP

### Tab Injection (`injectIntoTab.js`)

- Enables CDP Page and Runtime domains
- Bypasses Content Security Policy (CSP) restrictions
- Evaluates JavaScript code in the target page context

### Injected Code (`inject.js`)

- Intercepts WebSocket connections to capture game state
- Loads Stockfish chess engine from CDN
- Analyzes positions and suggests moves
- Handles FEN completion for proper castling support
- Logs activity to browser console for debugging

## Notes

- Login to Lichess.org in the Chrome window that opens - your login will be saved in the dedicated profile
- The application keeps Chrome running in the background
- Check the browser console (F12) to see injection logs
- Press Ctrl+C in the terminal to exit the application

## License

MIT
