import { launchChrome } from './launchChrome.js';
import { injectCode } from './injectCode.js';

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'launch':
        console.log('=== Launching Chrome ===');
        await launchChrome();
        break;
      
      case 'inject':
        console.log('=== Injecting Code ===');
        await injectCode();
        break;
      
      case 'full':
      default:
        console.log('=== Full Workflow: Launch + Inject ===');
        await launchChrome();
        console.log('\nWaiting 3 seconds before injection...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await injectCode();
        break;
    }
    
    console.log('\n✓ Operation completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n✗ Operation failed: ${errorMessage}`);
    process.exit(1);
  }
}

main();
