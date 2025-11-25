import { describe, it, expect, jest } from '@jest/globals';

// Mock injection success tracking
async function mockInjectIntoTab(
  client: any,
  injectCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!client || !client.Page || !client.Runtime) {
      throw new Error('Invalid client object');
    }
    
    if (!injectCode || injectCode.trim().length === 0) {
      throw new Error('Empty inject code');
    }
    
    // Simulate CDP calls
    await client.Page.enable();
    await client.Page.setBypassCSP({ enabled: true });
    await client.Runtime.evaluate({ expression: injectCode });
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

describe('injectIntoTab - Success Cases', () => {
  it('should successfully inject with valid client and code', async () => {
    const mockClient = {
      Page: {
        enable: jest.fn().mockResolvedValue(undefined),
        setBypassCSP: jest.fn().mockResolvedValue(undefined),
      },
      Runtime: {
        evaluate: jest.fn().mockResolvedValue({ result: { type: 'undefined' } }),
      },
    };
    
    const injectCode = 'console.log("test");';
    const result = await mockInjectIntoTab(mockClient, injectCode);
    
    expect(result.success).toBe(true);
    expect(mockClient.Page.enable).toHaveBeenCalledTimes(1);
    expect(mockClient.Page.setBypassCSP).toHaveBeenCalledWith({ enabled: true });
    expect(mockClient.Runtime.evaluate).toHaveBeenCalledWith({ expression: injectCode });
  });

  it('should call CDP methods in correct order', async () => {
    const callOrder: string[] = [];
    const mockClient = {
      Page: {
        enable: jest.fn().mockImplementation(async () => {
          callOrder.push('Page.enable');
        }),
        setBypassCSP: jest.fn().mockImplementation(async () => {
          callOrder.push('Page.setBypassCSP');
        }),
      },
      Runtime: {
        evaluate: jest.fn().mockImplementation(async () => {
          callOrder.push('Runtime.evaluate');
        }),
      },
    };
    
    await mockInjectIntoTab(mockClient, 'test code');
    
    expect(callOrder).toEqual([
      'Page.enable',
      'Page.setBypassCSP',
      'Runtime.evaluate',
    ]);
  });
});

describe('injectIntoTab - Failure Cases', () => {
  it('should handle missing client gracefully', async () => {
    const result = await mockInjectIntoTab(null as any, 'test code');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should handle empty inject code', async () => {
    const mockClient = {
      Page: { enable: jest.fn(), setBypassCSP: jest.fn() },
      Runtime: { evaluate: jest.fn() },
    };
    
    const result = await mockInjectIntoTab(mockClient, '');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Empty inject code');
  });

  it('should handle CSP bypass failure', async () => {
    const mockClient = {
      Page: {
        enable: jest.fn().mockResolvedValue(undefined),
        setBypassCSP: jest.fn().mockRejectedValue(new Error('CSP bypass failed')),
      },
      Runtime: {
        evaluate: jest.fn(),
      },
    };
    
    const result = await mockInjectIntoTab(mockClient, 'test code');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('CSP bypass failed');
    expect(mockClient.Runtime.evaluate).not.toHaveBeenCalled();
  });

  it('should handle Runtime.evaluate failure', async () => {
    const mockClient = {
      Page: {
        enable: jest.fn().mockResolvedValue(undefined),
        setBypassCSP: jest.fn().mockResolvedValue(undefined),
      },
      Runtime: {
        evaluate: jest.fn().mockRejectedValue(new Error('Evaluation error')),
      },
    };
    
    const result = await mockInjectIntoTab(mockClient, 'invalid code');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Evaluation error');
  });
});

describe('injectIntoTab - CSP Bypass', () => {
  it('should enable CSP bypass before evaluation', async () => {
    let bypassEnabled = false;
    let evaluationAttempted = false;
    
    const mockClient = {
      Page: {
        enable: jest.fn().mockResolvedValue(undefined),
        setBypassCSP: jest.fn().mockImplementation(async ({ enabled }) => {
          bypassEnabled = enabled;
        }),
      },
      Runtime: {
        evaluate: jest.fn().mockImplementation(async () => {
          evaluationAttempted = true;
          if (!bypassEnabled) {
            throw new Error('CSP violation');
          }
        }),
      },
    };
    
    const result = await mockInjectIntoTab(mockClient, 'test code');
    
    expect(result.success).toBe(true);
    expect(bypassEnabled).toBe(true);
    expect(evaluationAttempted).toBe(true);
  });
});
