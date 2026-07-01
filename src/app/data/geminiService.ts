/**
 * Serviço de IA Gemini para resumir artigos de texto, vídeos e áudios.
 *
 * As chamadas são feitas ao backend Spring Boot (/v1/ai/summarise),
 * que faz proxy seguro para a API Gemini evitando exposição de chaves no frontend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export type ContentType = 'article' | 'video' | 'podcast';

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  readingTime: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function summariseContent(params: {
  type: ContentType;
  title: string;
  description: string;
  body?: string;       // HTML do artigo
  mediaUrl?: string;   // URL do vídeo/áudio
}): Promise<SummaryResult> {
  const { type, title, description, body, mediaUrl } = params;

  const response = await fetch(`${API_BASE}/v1/ai/summarise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      title,
      description,
      body: body ? stripHtml(body).slice(0, 6000) : undefined,
      mediaUrl,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string };
    const errMsg = errData.error ?? `Erro ${response.status}`;

    // Mensagem amigável para quota esgotada
    if (errMsg.toLowerCase().includes('quota') || errMsg.includes('429') || errMsg.toLowerCase().includes('indisponíveis')) {
      throw new Error('Serviço de IA temporariamente indisponível. Aguarda 1-2 minutos e tenta novamente.');
    }

    throw new Error(errMsg);
  }

  const data = await response.json() as {
    summary?: string;
    keyPoints?: string[];
    readingTime?: string;
  };

  return {
    summary: data.summary ?? '',
    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
    readingTime: data.readingTime ?? '1 min',
  };
}
