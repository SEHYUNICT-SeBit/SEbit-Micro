import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SYSTEM_PROMPT } from './prompt';

type Bindings = {
  AI: Ai;
  ALLOWED_ORIGINS: string;
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

// Simple in-memory rate limiter (per-isolate)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/api/*', async (c, next) => {
  const allowedOrigins = (c.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (allowedOrigins.includes(origin)) return origin;
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) return origin;
      return '';
    },
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

// Chat endpoint with SSE streaming (Cloudflare Workers AI - FREE)
app.post('/api/chat', async (c) => {
  // Rate limit check
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return c.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, 429);
  }

  const body = await c.req.json<ChatRequest>();

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return c.json({ error: 'messages array is required' }, 400);
  }

  // Build messages with system prompt
  const aiMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...body.messages.slice(-20),
  ];

  try {
    // Cloudflare Workers AI - streaming response
    const stream = await c.env.AI.run(
      '@cf/meta/llama-3.1-8b-instruct-fp8',
      {
        messages: aiMessages,
        stream: true,
        max_tokens: 1024,
      }
    ) as ReadableStream;

    // Workers AI returns SSE stream with "data: {response: "..."}" format
    // We need to transform it to our "data: {text: "..."}" format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: parsed.response })}\n\n`)
                );
              }
            } catch {
              // Skip unparseable
            }
          }
        }
      },
    });

    stream.pipeTo(transformStream.writable);

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': c.req.header('origin') || '*',
      },
    });
  } catch (err) {
    console.error('Workers AI error:', err);
    return c.json({ error: 'AI 서비스에 일시적인 문제가 발생했습니다.' }, 500);
  }
});

export default app;
