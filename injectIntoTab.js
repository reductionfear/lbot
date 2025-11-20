import CDP from 'chrome-remote-interface';

const CHROME_PORT = 9222;

async function injectIntoTab(client, injectCode) {
  try {
    const { Page, Runtime } = client;
    await Page.enable();
    await Page.setBypassCSP({ enabled: true });
    await Runtime.evaluate({ expression: injectCode });
    return true;
  } catch (error) {
    console.error(`▲ Failed to inject: ${error.message}`);
    return false;
  }
}

export { injectIntoTab };
