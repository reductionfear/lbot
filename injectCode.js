import CDP from 'chrome-remote-interface';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { injectIntoTab } from './injectIntoTab.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PORT = 9222;
const INJECT_SCRIPT_PATH = path.join(__dirname, 'dist/inject.js');

export async function injectCode() {
  try {
    console.log('Connecting to Chrome...');
    const injectCode = fs.readFileSync(INJECT_SCRIPT_PATH, 'utf8');

    const response = await fetch(`http://localhost:${CHROME_PORT}/json`);
    const tabs = await response.json();

    const isChessPage = (url) =>
      url.includes('chess.com') || url.includes('lichess.org');

    const chessTabs = tabs.filter(tab => tab.type === 'page' && isChessPage(tab.url));

    if (chessTabs.length > 0) {
      console.log(`Found ${chessTabs.length} chess tab(s), injecting code...`);
      let injectedCount = 0;

      for (const tab of chessTabs) {
        try {
          const client = await CDP({ port: CHROME_PORT, target: tab.id });
          const success = await injectIntoTab(client, injectCode);
          if (success) {
            console.log(`Injected into: ${tab.url}`);
            injectedCount++;
          }
          await client.close();
        } catch (err) {
          console.log(`▲ Skipped tab (may be loading): ${tab.url}`);
        }
      }

      if (injectedCount > 0) {
        console.log(`
Successfully injected into ${injectedCount} tab(s)!`);
      } else {
        console.log('
No tabs were successfully injected (pages may still be loading)');
      }
    } else {
      console.log('No chess.com or lichess.org tabs found.');
    }
  } catch (error) {
    console.error(`✗ Injection error: ${error.message}`);
  }
}
