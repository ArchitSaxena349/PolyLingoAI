import { createServer } from 'node:http';
import { Buffer } from 'node:buffer';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const ENV_FILE_PATH = join(projectRoot, '.env');
const MAX_BODY_BYTES = 15 * 1024 * 1024;

const legacyKeyFallback = {
  ELEVENLABS_API_KEY: 'VITE_ELEVENLABS_API_KEY',
  MAGIC_AI_API_KEY: 'VITE_MAGIC_AI_API_KEY',
  LINGO_API_KEY: 'VITE_LINGO_API_KEY',
  REVENUECAT_API_KEY: 'VITE_REVENUECAT_API_KEY',
  DAPPIER_API_KEY: 'VITE_DAPPIER_API_KEY',
  TAVUS_API_KEY: 'VITE_TAVUS_API_KEY',
  RIVER_API_KEY: 'VITE_RIVER_API_KEY',
  NETLIFY_ACCESS_TOKEN: 'VITE_NETLIFY_ACCESS_TOKEN',
};

const trimOptionalQuotes = (value) => value.replace(/^["']|["']$/g, '');

const loadEnvFile = () => {
  if (!existsSync(ENV_FILE_PATH)) return;
  const content = readFileSync(ENV_FILE_PATH, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const delimiterIndex = trimmed.indexOf('=');
    if (delimiterIndex < 1) continue;

    const key = trimmed.slice(0, delimiterIndex).trim();
    const rawValue = trimmed.slice(delimiterIndex + 1).trim();
    if (!key || process.env[key]) continue;
    process.env[key] = trimOptionalQuotes(rawValue);
  }
};

loadEnvFile();

const PORT = Number(process.env.PORT || 8787);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const json = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
};

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, `Request body too large. Max ${Math.round(MAX_BODY_BYTES / (1024 * 1024))}MB`));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new HttpError(400, 'Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });

const fetchJson = async (url, init = {}) => {
  const response = await fetch(url, init);
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }
  if (!response.ok) {
    const message = parsed?.detail?.message || parsed?.message || parsed?.error || response.statusText;
    throw new HttpError(response.status, message || 'Upstream API request failed');
  }
  return parsed;
};

const getRequiredEnv = (name) => {
  const value = process.env[name] || process.env[legacyKeyFallback[name] || ''];
  if (!value) {
    const legacy = legacyKeyFallback[name];
    const hint = legacy ? ` (or legacy ${legacy})` : '';
    throw new HttpError(503, `${name} is not configured on backend${hint}`);
  }
  return value;
};

const handleElevenLabsClone = async (req, res) => {
  const apiKey = getRequiredEnv('ELEVENLABS_API_KEY');
  const body = await parseJsonBody(req);
  const { name, fileName, mimeType, base64Data } = body;

  if (!name || !fileName || !base64Data) {
    json(res, 400, { error: 'name, fileName and base64Data are required' });
    return;
  }

  const bytes = Buffer.from(base64Data, 'base64');
  const form = new FormData();
  form.append('name', name);
  form.append('files', new Blob([bytes], { type: mimeType || 'audio/mpeg' }), fileName);

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    json(res, response.status, { error: payload?.detail?.message || payload?.message || 'Voice cloning failed' });
    return;
  }

  json(res, 200, payload);
};

const handleElevenLabsVoices = async (_req, res) => {
  const apiKey = getRequiredEnv('ELEVENLABS_API_KEY');
  const payload = await fetchJson('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': apiKey,
    },
  });
  json(res, 200, payload);
};

const handleElevenLabsTts = async (req, res, voiceId) => {
  const apiKey = getRequiredEnv('ELEVENLABS_API_KEY');
  const body = await parseJsonBody(req);
  const text = body?.text;

  if (!text) {
    json(res, 400, { error: 'text is required' });
    return;
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.5 },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    json(res, response.status, { error: payload?.detail?.message || payload?.message || 'Text-to-speech failed' });
    return;
  }

  const audio = Buffer.from(await response.arrayBuffer());
  res.writeHead(200, {
    'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(audio);
};

const handleMagicGenerate = async (req, res) => {
  const apiKey = getRequiredEnv('MAGIC_AI_API_KEY');
  const body = await parseJsonBody(req);
  const payload = await fetchJson('https://api.21st.dev/v1/generate-component', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: body?.prompt,
      framework: body?.framework || 'react',
      styling: body?.styling || 'tailwindcss',
    }),
  });
  json(res, 200, payload);
};

const handleLingoTranslate = async (req, res) => {
  const apiKey = getRequiredEnv('LINGO_API_KEY');
  const body = await parseJsonBody(req);
  const payload = await fetchJson('https://api.lingo.com/v1/translate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: body?.text,
      source_language: body?.sourceLanguage || 'en',
      target_language: body?.targetLanguage,
    }),
  });
  json(res, 200, payload);
};

const handleLingoLanguages = async (_req, res) => {
  const apiKey = getRequiredEnv('LINGO_API_KEY');
  const payload = await fetchJson('https://api.lingo.com/v1/languages', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  json(res, 200, payload);
};

const handleDappierCompletion = async (req, res) => {
  const apiKey = getRequiredEnv('DAPPIER_API_KEY');
  const body = await parseJsonBody(req);
  const payload = await fetchJson('https://api.dappier.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: body?.model || 'gpt-4',
      messages: body?.messages || [],
      max_tokens: body?.maxTokens ?? 1000,
      temperature: body?.temperature ?? 0.7,
    }),
  });
  json(res, 200, payload);
};

const handleRevenueCatCreateSubscription = async (req, res) => {
  const apiKey = getRequiredEnv('REVENUECAT_API_KEY');
  const body = await parseJsonBody(req);
  const { userId, productId } = body;
  const payload = await fetchJson(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}/purchases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      price: productId === 'pro_monthly' ? 29.99 : 299.99,
      currency: 'USD',
    }),
  });
  json(res, 200, payload);
};

const handleRevenueCatSubscriber = async (_req, res, userId) => {
  const apiKey = getRequiredEnv('REVENUECAT_API_KEY');
  const payload = await fetchJson(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  json(res, 200, payload);
};

const handleTavusVideos = async (req, res) => {
  const apiKey = getRequiredEnv('TAVUS_API_KEY');
  const body = await parseJsonBody(req);
  const payload = await fetchJson('https://api.tavus.io/v1/videos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: 'onboarding_template',
      variables: {
        user_name: body?.userName,
        app_name: body?.appName,
      },
    }),
  });
  json(res, 200, payload);
};

const handleRiverEventsGet = async (_req, res) => {
  const apiKey = getRequiredEnv('RIVER_API_KEY');
  const payload = await fetchJson('https://api.river.com/v1/events', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  json(res, 200, payload);
};

const handleRiverEventsCreate = async (req, res) => {
  const apiKey = getRequiredEnv('RIVER_API_KEY');
  const body = await parseJsonBody(req);
  const payload = await fetchJson('https://api.river.com/v1/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  json(res, 200, payload);
};

const handleNetlifySites = async (req, res) => {
  const token = getRequiredEnv('NETLIFY_ACCESS_TOKEN');
  const body = await parseJsonBody(req);
  const payload = await fetchJson('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: body?.name,
      build_settings: body?.buildSettings || {
        cmd: 'npm run build',
        dir: 'dist',
      },
    }),
  });
  json(res, 200, payload);
};

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    json(res, 400, { error: 'Invalid request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/api/health') {
      json(res, 200, { ok: true, service: 'polylingo-api', timestamp: new Date().toISOString() });
      return;
    }

    if (req.method === 'GET' && path === '/api/integrations/elevenlabs/voices') return await handleElevenLabsVoices(req, res);
    if (req.method === 'POST' && path === '/api/integrations/elevenlabs/voices/clone') return await handleElevenLabsClone(req, res);
    if (req.method === 'POST' && path.startsWith('/api/integrations/elevenlabs/text-to-speech/')) {
      const voiceId = decodeURIComponent(path.split('/').pop() || '');
      return await handleElevenLabsTts(req, res, voiceId);
    }

    if (req.method === 'POST' && path === '/api/integrations/magic/generate-component') return await handleMagicGenerate(req, res);
    if (req.method === 'POST' && path === '/api/integrations/lingo/translate') return await handleLingoTranslate(req, res);
    if (req.method === 'GET' && path === '/api/integrations/lingo/languages') return await handleLingoLanguages(req, res);
    if (req.method === 'POST' && path === '/api/integrations/dappier/chat/completions') return await handleDappierCompletion(req, res);
    if (req.method === 'POST' && path === '/api/integrations/revenuecat/subscriptions') return await handleRevenueCatCreateSubscription(req, res);
    if (req.method === 'GET' && path.startsWith('/api/integrations/revenuecat/subscribers/')) {
      const userId = decodeURIComponent(path.split('/').pop() || '');
      return await handleRevenueCatSubscriber(req, res, userId);
    }
    if (req.method === 'POST' && path === '/api/integrations/tavus/videos') return await handleTavusVideos(req, res);
    if (req.method === 'GET' && path === '/api/integrations/river/events') return await handleRiverEventsGet(req, res);
    if (req.method === 'POST' && path === '/api/integrations/river/events') return await handleRiverEventsCreate(req, res);
    if (req.method === 'POST' && path === '/api/integrations/netlify/sites') return await handleNetlifySites(req, res);

    json(res, 404, { error: 'Route not found' });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    json(res, status, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`PolyLingo API running on http://localhost:${PORT}`);
});
