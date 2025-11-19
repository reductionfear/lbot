# GEMINI.md — Project context for Gemini

Use this file with **Gemini CLI** / **Gemini Code Assist** to give the model persistent guidance for the *Lichess External Mover* project.

## Project Overview
- Node.js/Electron app controlling a Chrome instance in **remote debugging** mode.
- Supports external compiled engines (e.g., `blunder.exe`).
- Similar functionality to “Lichess Bot (stockfish8) 2.js”.

## Key Features
- Move Analysis (top 4 moves)
- Colorful arrows for visualization
- **Automove** capability

## Core Workflows to Emphasize
- `launchChrome` → `injectCode` → `injectIntoTab`
- Use **CDP** (Chrome DevTools Protocol) for injection; bypass CSP when evaluating code.

## Guardrails
- Do **not** invent features or code beyond what’s described.
- When referring to screenshots/UI, state you’re using provided descriptions.

## Useful Commands (Gemini CLI)
- Explore repo context: `gemini -p "@./ Summarize architecture and modules"`
- Plan injection flow changes: `gemini -p "Describe how launchChrome → injectCode → injectIntoTab interact"`
- Generate docs to `docs/`: `gemini -p "Create docs outlining the CDP injection and settings panel"`

> References  
- Gemini CLI & agent mode overview: https://cloud.google.com/gemini/docs/codeassist/gemini-cli  
- Cookbook examples: https://github.com/google-gemini/cookbook
