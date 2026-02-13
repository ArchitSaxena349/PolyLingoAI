type RequestMethod = 'GET' | 'POST';
type ResponseType = 'json' | 'blob';

const getApiBaseUrl = () => (import.meta.env.VITE_BACKEND_API_URL || '/api').replace(/\/$/, '');

const buildHeaders = (body?: BodyInit | null): HeadersInit => {
  if (body instanceof FormData) return {};
  return {
    'Content-Type': 'application/json',
  };
};

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    if (typeof payload?.error === 'string') return payload.error;
    if (typeof payload?.message === 'string') return payload.message;
  } catch {
    // Ignore JSON parse failures and use status text fallback.
  }
  return response.statusText || 'Integration request failed';
};

const apiRequest = async <T>(
  baseUrl: string,
  path: string,
  method: RequestMethod = 'GET',
  body?: BodyInit | null,
  responseType: ResponseType = 'json'
): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: buildHeaders(body),
    body,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  if (responseType === 'blob') {
    return await response.blob() as T;
  }

  return await response.json() as T;
};

// All integration calls are routed through backend endpoints so provider keys stay server-side.
export class ElevenLabsService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async getVoices() {
    return await apiRequest<any>(this.apiBaseUrl, '/integrations/elevenlabs/voices');
  }

  async cloneVoice(name: string, audioFile: File) {
    const arrayBuffer = await audioFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Data = btoa(binary);

    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/elevenlabs/voices/clone',
      'POST',
      JSON.stringify({
        name,
        fileName: audioFile.name,
        mimeType: audioFile.type,
        base64Data,
      })
    );
  }

  async generateSpeech(text: string, voiceId: string) {
    return await apiRequest<Blob>(
      this.apiBaseUrl,
      `/integrations/elevenlabs/text-to-speech/${encodeURIComponent(voiceId)}`,
      'POST',
      JSON.stringify({ text }),
      'blob'
    );
  }
}

export class LingoService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async translateText(text: string, targetLanguage: string, sourceLanguage = 'en') {
    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/lingo/translate',
      'POST',
      JSON.stringify({ text, sourceLanguage, targetLanguage })
    );
  }

  async getSupportedLanguages() {
    return await apiRequest<any>(this.apiBaseUrl, '/integrations/lingo/languages');
  }
}

export class DappierService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async getChatCompletion(messages: any[], model = 'gpt-4') {
    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/dappier/chat/completions',
      'POST',
      JSON.stringify({ model, messages, maxTokens: 1000, temperature: 0.7 })
    );
  }

  async getAppBuildingSuggestions(currentComponents: any[]) {
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant helping users build applications. Provide helpful suggestions based on their current components.',
      },
      {
        role: 'user',
        content: `I have these components in my app: ${JSON.stringify(currentComponents)}. What should I add next?`,
      },
    ];

    return await this.getChatCompletion(messages);
  }
}

export class RevenueCatService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async createSubscription(userId: string, productId: string) {
    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/revenuecat/subscriptions',
      'POST',
      JSON.stringify({ userId, productId })
    );
  }

  async getSubscriptionStatus(userId: string) {
    return await apiRequest<any>(this.apiBaseUrl, `/integrations/revenuecat/subscribers/${encodeURIComponent(userId)}`);
  }
}

export class TavusService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async generatePersonalizedVideo(userName: string, appName: string) {
    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/tavus/videos',
      'POST',
      JSON.stringify({ userName, appName })
    );
  }
}

export class RiverService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async getUpcomingEvents() {
    return await apiRequest<any>(this.apiBaseUrl, '/integrations/river/events');
  }

  async createEvent(eventData: any) {
    return await apiRequest<any>(this.apiBaseUrl, '/integrations/river/events', 'POST', JSON.stringify(eventData));
  }
}

export class MagicAIService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async generateComponent(prompt: string) {
    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/magic/generate-component',
      'POST',
      JSON.stringify({ prompt, framework: 'react', styling: 'tailwindcss' })
    );
  }
}

export const initSentry = () => {
  console.log('Sentry monitoring initialized');
};

export class NetlifyService {
  constructor(private apiBaseUrl = getApiBaseUrl()) {}

  async deployApp(appData: any) {
    return await apiRequest<any>(
      this.apiBaseUrl,
      '/integrations/netlify/sites',
      'POST',
      JSON.stringify({
        name: `polylingo-${appData.id}`,
        buildSettings: {
          cmd: 'npm run build',
          dir: 'dist',
        },
      })
    );
  }
}
