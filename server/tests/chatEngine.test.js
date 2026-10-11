import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyWithGemini, DEFAULT_GEMINI_MODEL } from '../lib/chatEngine.js';

describe('Gemini Classification Fallback', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('(a) sends the key only in the header x-goog-api-key, never in the URL', async () => {
    let capturedUrl = '';
    let capturedHeaders = {};

    global.fetch = vi.fn().mockImplementation(async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'inventory_check' }] } }]
        })
      };
    });

    const result = await classifyWithGemini('do we have 10k resistors', 'test-secret-key-12345');

    expect(result).toBe('inventory_check');
    expect(capturedUrl).not.toContain('key=');
    expect(capturedUrl).not.toContain('test-secret-key-12345');
    expect(capturedHeaders['x-goog-api-key']).toBe('test-secret-key-12345');
  });

  it('(b) includes the configured model in the URL', async () => {
    let capturedUrl = '';

    global.fetch = vi.fn().mockImplementation(async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'help' }] } }]
        })
      };
    });

    // Custom model
    const customResult = await classifyWithGemini('help me', 'mock-key', 'gemini-custom-flash');
    expect(customResult).toBe('help');
    expect(capturedUrl).toContain('/models/gemini-custom-flash:generateContent');

    // Default model
    await classifyWithGemini('help me', 'mock-key', undefined);
    expect(capturedUrl).toContain(`/models/${DEFAULT_GEMINI_MODEL}:generateContent`);
  });

  it('(c) falls back to unknown without throwing on invalid, empty, or error response', async () => {
    // 1. HTTP 500 error response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Error' })
    });
    const res500 = await classifyWithGemini('unknown gibberish', 'mock-key');
    expect(res500).toBe('unknown');

    // 2. Empty / invalid JSON payload
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({})
    });
    const resEmpty = await classifyWithGemini('unknown gibberish', 'mock-key');
    expect(resEmpty).toBe('unknown');

    // 3. Network fetch rejection / throw
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));
    const resThrow = await classifyWithGemini('unknown gibberish', 'mock-key');
    expect(resThrow).toBe('unknown');

    // 4. Hallucinated / disallowed intent
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'malicious_system_takeover' }] } }]
      })
    });
    const resHallucinated = await classifyWithGemini('unknown gibberish', 'mock-key');
    expect(resHallucinated).toBe('unknown');
  });

  it('(d) never calls fetch when no key is set', async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const result = await classifyWithGemini('any prompt', '');
    expect(result).toBe('unknown');
    expect(fetchMock).not.toHaveBeenCalled();

    const resultNull = await classifyWithGemini('any prompt', null);
    expect(resultNull).toBe('unknown');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
