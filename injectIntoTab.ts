export async function injectIntoTab(client: any, injectCode: string): Promise<boolean> {
  try {
    const { Page, Runtime } = client;
    await Page.enable();
    await Page.setBypassCSP({ enabled: true });
    await Runtime.evaluate({ expression: injectCode });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`▲ Failed to inject: ${errorMessage}`);
    return false;
  }
}
