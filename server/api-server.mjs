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

// Security & Rate Limiting Configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:8787', 'http://127.0.0.1:5173', 'http://127.0.0.1:8787'];

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per 15 mins per IP

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  rateLimitStore.set(ip, record);
  return {
    isLimited: record.count > RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count),
    resetTime: Math.ceil((record.resetTime - now) / 1000),
  };
};

// Periodic store cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

const computeAllowOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return '*';
  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  // Default to first allowed origin or request origin in development
  return ALLOWED_ORIGINS[0] || '*';
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const buildSecurityHeaders = (req) => {
  return {
    'Access-Control-Allow-Origin': computeAllowOrigin(req),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
};

const json = (res, status, payload, req = null, extraHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(req ? buildSecurityHeaders(req) : { 'Access-Control-Allow-Origin': '*' }),
    ...extraHeaders,
  };
  res.writeHead(status, headers);
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

const getOptionalEnv = (name) => {
  return process.env[name] || process.env[legacyKeyFallback[name] || ''] || null;
};

const requireProviderKey = (res, keyName, req) => {
  json(res, 503, { error: `${keyName} is not configured on the backend.` }, req);
};

const handleElevenLabsClone = async (req, res) => {
  const apiKey = getOptionalEnv('ELEVENLABS_API_KEY');
  const body = await parseJsonBody(req);
  const { name, fileName, base64Data } = body;

  if (!name || !fileName || !base64Data) {
    json(res, 400, { error: 'name, fileName and base64Data are required' }, req);
    return;
  }

  if (!apiKey) {
    requireProviderKey(res, 'ELEVENLABS_API_KEY', req);
    return;
  }

  const bytes = Buffer.from(base64Data, 'base64');
  const form = new FormData();
  form.append('name', name);
  form.append('files', new Blob([bytes], { type: body.mimeType || 'audio/mpeg' }), fileName);

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    json(res, response.status, { error: payload?.detail?.message || payload?.message || 'Voice cloning failed' }, req);
    return;
  }

  json(res, 200, payload, req);
};

const handleElevenLabsVoices = async (req, res) => {
  const apiKey = getOptionalEnv('ELEVENLABS_API_KEY');
  if (!apiKey) {
    requireProviderKey(res, 'ELEVENLABS_API_KEY', req);
    return;
  }

  const payload = await fetchJson('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
  });
  json(res, 200, payload, req);
};

const handleElevenLabsTts = async (req, res, voiceId) => {
  const apiKey = getOptionalEnv('ELEVENLABS_API_KEY');
  const body = await parseJsonBody(req);
  const text = body?.text;

  if (!text) {
    json(res, 400, { error: 'text is required' }, req);
    return;
  }

  if (!apiKey) {
    requireProviderKey(res, 'ELEVENLABS_API_KEY', req);
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
    json(res, response.status, { error: payload?.detail?.message || payload?.message || 'Text-to-speech failed' }, req);
    return;
  }

  const audio = Buffer.from(await response.arrayBuffer());
  res.writeHead(200, {
    'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
    ...buildSecurityHeaders(req),
  });
  res.end(audio);
};

const handleMagicGenerate = async (req, res) => {
  const apiKey = getOptionalEnv('MAGIC_AI_API_KEY');
  const body = await parseJsonBody(req);
  const promptText = body?.prompt || 'Custom AI Component';

  if (!apiKey) {
    requireProviderKey(res, 'MAGIC_AI_API_KEY', req);
    return;
  }

  const payload = await fetchJson('https://api.21st.dev/v1/generate-component', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: promptText,
      framework: body?.framework || 'react',
      styling: body?.styling || 'tailwindcss',
    }),
  });
  json(res, 200, payload, req);
};

const handleLingoTranslate = async (req, res) => {
  const apiKey = getOptionalEnv('LINGO_API_KEY');
  const body = await parseJsonBody(req);
  const targetLang = body?.targetLanguage || 'es';
  const text = body?.text || '';

  if (!apiKey) {
    requireProviderKey(res, 'LINGO_API_KEY', req);
    return;
  }

  const payload = await fetchJson('https://api.lingo.com/v1/translate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      source_language: body?.sourceLanguage || 'en',
      target_language: targetLang,
    }),
  });
  json(res, 200, payload, req);
};

const handleLingoLanguages = async (req, res) => {
  const apiKey = getOptionalEnv('LINGO_API_KEY');
  if (!apiKey) {
    requireProviderKey(res, 'LINGO_API_KEY', req);
    return;
  }

  const payload = await fetchJson('https://api.lingo.com/v1/languages', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  json(res, 200, payload, req);
};

const handleDappierCompletion = async (req, res) => {
  const apiKey = getOptionalEnv('DAPPIER_API_KEY');
  const body = await parseJsonBody(req);

  if (!apiKey) {
    requireProviderKey(res, 'DAPPIER_API_KEY', req);
    return;
  }

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
  json(res, 200, payload, req);
};

const handleRevenueCatCreateSubscription = async (req, res) => {
  const apiKey = getOptionalEnv('REVENUECAT_API_KEY');
  const body = await parseJsonBody(req);
  const { userId, productId } = body;

  if (!apiKey) {
    requireProviderKey(res, 'REVENUECAT_API_KEY', req);
    return;
  }

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
  json(res, 200, payload, req);
};

const handleRevenueCatSubscriber = async (req, res, userId) => {
  const apiKey = getOptionalEnv('REVENUECAT_API_KEY');
  if (!apiKey) {
    requireProviderKey(res, 'REVENUECAT_API_KEY', req);
    return;
  }

  const payload = await fetchJson(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  json(res, 200, payload, req);
};

const handleTavusVideos = async (req, res) => {
  const apiKey = getOptionalEnv('TAVUS_API_KEY');
  const body = await parseJsonBody(req);

  if (!apiKey) {
    requireProviderKey(res, 'TAVUS_API_KEY', req);
    return;
  }

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
  json(res, 200, payload, req);
};

const handleRiverEventsGet = async (req, res) => {
  const apiKey = getOptionalEnv('RIVER_API_KEY');
  if (!apiKey) {
    requireProviderKey(res, 'RIVER_API_KEY', req);
    return;
  }

  const payload = await fetchJson('https://api.river.com/v1/events', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  json(res, 200, payload, req);
};

const handleRiverEventsCreate = async (req, res) => {
  const apiKey = getOptionalEnv('RIVER_API_KEY');
  const body = await parseJsonBody(req);

  if (!apiKey) {
    requireProviderKey(res, 'RIVER_API_KEY', req);
    return;
  }

  const payload = await fetchJson('https://api.river.com/v1/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  json(res, 200, payload, req);
};

const handleNetlifySites = async (req, res) => {
  const token = getOptionalEnv('NETLIFY_ACCESS_TOKEN');
  const body = await parseJsonBody(req);
  const siteName = body?.name || `polylingo-${Date.now()}`;

  if (!token) {
    requireProviderKey(res, 'NETLIFY_ACCESS_TOKEN', req);
    return;
  }

  const payload = await fetchJson('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: siteName,
      build_settings: body?.buildSettings || {
        cmd: 'npm run build',
        dir: 'dist',
      },
    }),
  });
  json(res, 200, payload, req);
};

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    json(res, 400, { error: 'Invalid request' }, req);
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, buildSecurityHeaders(req));
    res.end();
    return;
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  // Rate Limiting check (skipping health check endpoint)
  if (path !== '/api/health') {
    const rateLimit = checkRateLimit(clientIp);
    if (rateLimit.isLimited) {
      json(
        res,
        429,
        { error: 'Too many requests. Please try again later.' },
        req,
        { 'Retry-After': String(rateLimit.resetTime) }
      );
      return;
    }
  }

  try {
    if (req.method === 'GET' && path === '/api/health') {
      json(res, 200, { ok: true, service: 'polylingo-api', timestamp: new Date().toISOString() }, req);
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

    json(res, 404, { error: 'Route not found' }, req);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    json(res, status, { error: message }, req);
  }
});

server.listen(PORT, () => {
  console.log(`PolyLingo API running on http://localhost:${PORT}`);
});

// Process signal & exception handling
const shutdown = (signal) => {
  console.log(`Received ${signal}. Gracefully shutting down HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
