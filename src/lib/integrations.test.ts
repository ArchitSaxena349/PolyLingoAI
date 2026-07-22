import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ElevenLabsService,
  LingoService,
  DappierService,
  RevenueCatService,
  TavusService,
  RiverService,
  MagicAIService,
  NetlifyService,
} from './integrations';

describe('Integration API Services', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('ElevenLabsService fetches available voices', async () => {
    const mockResponse = { voices: [{ voice_id: 'v1', name: 'Clara' }] };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const elevenLabs = new ElevenLabsService('http://localhost:8787/api');
    const result = await elevenLabs.getVoices();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8787/api/integrations/elevenlabs/voices',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockResponse);
  });

  it('LingoService correctly formats translation requests', async () => {
    const mockResponse = { translatedText: 'Hola Mundo' };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const lingo = new LingoService('http://localhost:8787/api');
    const result = await lingo.translateText('Hello World', 'es', 'en');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8787/api/integrations/lingo/translate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'Hello World', sourceLanguage: 'en', targetLanguage: 'es' }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('DappierService correctly formats chat completions', async () => {
    const mockResponse = { choices: [{ message: { content: 'AI Response' } }] };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const dappier = new DappierService('http://localhost:8787/api');
    const result = await dappier.getChatCompletion([{ role: 'user', content: 'Hi' }]);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8787/api/integrations/dappier/chat/completions',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('RevenueCatService handles subscription queries', async () => {
    const mockResponse = { subscriber: { subscriptions: {} } };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const revenueCat = new RevenueCatService('http://localhost:8787/api');
    const result = await revenueCat.getSubscriptionStatus('user-1');

    expect(result).toEqual(mockResponse);
  });

  it('TavusService requests video generation', async () => {
    const mockResponse = { video_id: 'vid-1' };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const tavus = new TavusService('http://localhost:8787/api');
    const result = await tavus.generatePersonalizedVideo('Alice', 'PolyApp');

    expect(result).toEqual(mockResponse);
  });

  it('RiverService fetches upcoming events', async () => {
    const mockResponse = { events: [] };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const river = new RiverService('http://localhost:8787/api');
    const result = await river.getUpcomingEvents();

    expect(result).toEqual(mockResponse);
  });

  it('MagicAIService handles component generation requests', async () => {
    const mockResponse = { code: 'const Comp = () => <div/>' };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const magic = new MagicAIService('http://localhost:8787/api');
    const result = await magic.generateComponent('pricing card');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8787/api/integrations/magic/generate-component',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('NetlifyService deploys app configuration', async () => {
    const mockResponse = { url: 'https://polylingo-123.netlify.app' };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const netlify = new NetlifyService('http://localhost:8787/api');
    const result = await netlify.deployApp({ id: 'app-123' });

    expect(result).toEqual(mockResponse);
  });
});
