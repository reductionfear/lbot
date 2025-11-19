import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock functions for testing tab filtering logic
function isChessPage(url: string): boolean {
  return url.includes('chess.com') || url.includes('lichess.org');
}

interface MockTab {
  id: string;
  type: string;
  url: string;
}

function filterChessTabs(tabs: MockTab[]): MockTab[] {
  return tabs.filter(tab => tab.type === 'page' && isChessPage(tab.url));
}

describe('injectCode - Tab Filtering', () => {
  it('should filter chess.com tabs correctly', () => {
    const tabs: MockTab[] = [
      { id: '1', type: 'page', url: 'https://chess.com/play/online' },
      { id: '2', type: 'page', url: 'https://google.com' },
      { id: '3', type: 'page', url: 'https://www.chess.com/game/123' },
    ];

    const result = filterChessTabs(tabs);
    expect(result).toHaveLength(2);
    expect(result[0].url).toContain('chess.com');
    expect(result[1].url).toContain('chess.com');
  });

  it('should filter lichess.org tabs correctly', () => {
    const tabs: MockTab[] = [
      { id: '1', type: 'page', url: 'https://lichess.org' },
      { id: '2', type: 'page', url: 'https://github.com' },
      { id: '3', type: 'page', url: 'https://lichess.org/game/abc123' },
    ];

    const result = filterChessTabs(tabs);
    expect(result).toHaveLength(2);
    expect(result[0].url).toContain('lichess.org');
    expect(result[1].url).toContain('lichess.org');
  });

  it('should filter out non-page tabs', () => {
    const tabs: MockTab[] = [
      { id: '1', type: 'page', url: 'https://lichess.org' },
      { id: '2', type: 'background_page', url: 'https://lichess.org' },
      { id: '3', type: 'service_worker', url: 'https://chess.com' },
    ];

    const result = filterChessTabs(tabs);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('page');
  });

  it('should return empty array when no chess tabs found', () => {
    const tabs: MockTab[] = [
      { id: '1', type: 'page', url: 'https://google.com' },
      { id: '2', type: 'page', url: 'https://github.com' },
    ];

    const result = filterChessTabs(tabs);
    expect(result).toHaveLength(0);
  });

  it('should handle mixed chess sites', () => {
    const tabs: MockTab[] = [
      { id: '1', type: 'page', url: 'https://chess.com/play' },
      { id: '2', type: 'page', url: 'https://lichess.org/game/123' },
      { id: '3', type: 'page', url: 'https://stackoverflow.com' },
    ];

    const result = filterChessTabs(tabs);
    expect(result).toHaveLength(2);
  });

  it('should handle URLs with query parameters', () => {
    const tabs: MockTab[] = [
      { id: '1', type: 'page', url: 'https://chess.com/play?mode=rapid' },
      { id: '2', type: 'page', url: 'https://lichess.org/?ref=home' },
    ];

    const result = filterChessTabs(tabs);
    expect(result).toHaveLength(2);
  });
});

describe('injectCode - URL Detection', () => {
  it('should identify chess.com URLs', () => {
    expect(isChessPage('https://chess.com')).toBe(true);
    expect(isChessPage('https://www.chess.com/play/online')).toBe(true);
    expect(isChessPage('http://chess.com/game/123')).toBe(true);
  });

  it('should identify lichess.org URLs', () => {
    expect(isChessPage('https://lichess.org')).toBe(true);
    expect(isChessPage('https://lichess.org/game/abc')).toBe(true);
    expect(isChessPage('http://lichess.org/@/user')).toBe(true);
  });

  it('should reject non-chess URLs', () => {
    expect(isChessPage('https://google.com')).toBe(false);
    expect(isChessPage('https://github.com')).toBe(false);
    expect(isChessPage('https://youtube.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isChessPage('')).toBe(false);
    expect(isChessPage('about:blank')).toBe(false);
    expect(isChessPage('chrome://settings')).toBe(false);
  });
});
