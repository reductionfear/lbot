import CDP from 'chrome-remote-interface';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { injectIntoTab } from './injectIntoTab.js';
import { CHROME_PORT } from './helpers-chrome.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INJECT_SCRIPT_PATH = join(__dirname, '../dist/inject.js');

function isChessPage(url: string): boolean {
  return url.includes('chess.com') || url.includes('lichess.org');
}

export async function injectCode(): Promise<void> {
  try {
    console.log('Connecting to Chrome...');
    
    if (!existsSync(INJECT_SCRIPT_PATH)) {
      console.error(`✗ Inject script not found at ${INJECT_SCRIPT_PATH}`);
      console.log('Creating stub inject.js for testing...');
      const stubScript = `console.log('[Inject] Chess Analyzer initialized');`;
      return;
    }

    const injectCodeContent = readFileSync(INJECT_SCRIPT_PATH, 'utf8');

    const response = await fetch(`http://localhost:${CHROME_PORT}/json`);
    const tabs = await response.json();

    const chessTabs = tabs.filter((tab: any) => 
      tab.type === 'page' && isChessPage(tab.url)
    );

    if (chessTabs.length > 0) {
      console.log(`Found ${chessTabs.length} chess tab(s), injecting code...`);
      let injectedCount = 0;

      for (const tab of chessTabs) {
        try {
          const client = await CDP({ port: CHROME_PORT, target: tab.id });
          const success = await injectIntoTab(client, injectCodeContent);
          if (success) {
            console.log(`✓ Injected into: ${tab.url}`);
            injectedCount++;
          }
          await client.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.log(`▲ Skipped tab (may be loading): ${tab.url}`);
        }
      }

      if (injectedCount > 0) {
        console.log(`\n✓ Successfully injected into ${injectedCount} tab(s)!`);
      } else {
        console.log('\n▲ No tabs were successfully injected (pages may still be loading)');
      }
    } else {
      console.log('▲ No chess.com or lichess.org tabs found.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Injection error: ${errorMessage}`);
  }
}
