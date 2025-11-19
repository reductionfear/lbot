import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { getChromePath, checkChromeDebugActive, CHROME_PORT } from './helpers-chrome.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHROME_LOCK_FILE = join(__dirname, '.chrome-analyzer-lock');

export async function launchChrome(): Promise<void> {
  const chromePath = getChromePath();
  const userDataDir = join(__dirname, '.chrome-analyzer-profile');

  if (!existsSync(userDataDir)) {
    mkdirSync(userDataDir, { recursive: true });
  }

  console.log('Launching Chrome with debugging...');
  console.log('Using dedicated profile for Chess Analyzer');
  console.log('TIP: Login to Chess.com/Lichess in this window — your login will be saved!');

  const chromeArgs = [
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'https://lichess.org',
  ];

  try {
    const chromeProcess = spawn(chromePath, chromeArgs, { 
      detached: true, 
      stdio: 'ignore' 
    });
    chromeProcess.unref();

    console.log('Waiting for Chrome to start (this may take up to 30 seconds)...');

    let retries = 0;
    const maxRetries = 30;

    while (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const ready = await checkChromeDebugActive();

      if (ready) {
        console.log('✓ Chrome is ready!');
        writeFileSync(CHROME_LOCK_FILE, Date.now().toString());
        return;
      }

      if (retries % 5 === 0 && retries > 0) {
        console.log(`Still waiting... (${retries}s elapsed)`);
      }

      retries++;
    }

    console.error('✗ Chrome failed to start within 30 seconds');
    throw new Error('Chrome startup timeout');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Error launching Chrome: ${errorMessage}`);
    throw error;
  }
}
