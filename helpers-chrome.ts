import { platform } from 'os';
import { existsSync } from 'fs';
import { join } from 'path';

export const CHROME_PORT = 9222;

export function getChromePath(): string {
  const system = platform();
  
  const chromePaths: Record<string, string[]> = {
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ],
  };

  const paths = chromePaths[system] || chromePaths.linux;
  
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new Error(`Chrome not found. Please install Google Chrome or set CHROME_PATH environment variable.`);
}

export async function checkChromeDebugActive(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${CHROME_PORT}/json/version`);
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
