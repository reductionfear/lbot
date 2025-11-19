import { launchChrome } from './launchChrome.js';
import { injectCode } from './injectCode.js';

const CHROME_PORT = 9222;

async function main() {
  console.log('=== Lichess External Mover ===');
  console.log('');

  try {
    // Check if Chrome is already running with debugging
    const response = await fetch(`http://localhost:${CHROME_PORT}/json/version`).catch(() => null);
    
    if (!response || !response.ok) {
      console.log('Chrome not detected with debugging enabled. Launching Chrome...');
      await launchChrome();
      console.log('');
    } else {
      console.log('✓ Chrome already running with debugging enabled');
      console.log('');
    }

    // Wait a bit for pages to load
    console.log('Waiting for pages to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('');

    // Inject code into chess pages
    await injectCode();
    console.log('');
    console.log('=== Ready ===');
    console.log('Open lichess.org in the Chrome window to start analyzing!');
    console.log('The code will automatically inject into chess.com and lichess.org tabs.');
    console.log('');
    console.log('Press Ctrl+C to exit');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
