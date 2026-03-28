export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3101/api';

export const ACCESS_TOKEN_STORAGE_KEY = 'directcash.accessToken';

export class DirectCashApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'DirectCashApiError';
    this.status = status;
    this.details = details;
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, QueryValue>;
  token?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unwrapEnvelope<T>(value: unknown): T {
  if (isRecord(value) && 'data' in value && 'timestamp' in value && 'path' in value) {
    return unwrapEnvelope<T>(value.data);
  }
  return value as T;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  const url = `${normalizedBase}/${normalizedPath}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString.length > 0 ? `${url}?${queryString}` : url;
}

function getErrorMessage(details: unknown, fallbackStatus: number): string {
  if (isRecord(details)) {
    const message = details.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return fallbackStatus >= 500
    ? 'Erro inesperado no servidor'
    : 'Não foi possível concluir a operação';
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const parsed = text.length > 0 ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message = getErrorMessage(parsed, response.status);
    throw new DirectCashApiError(message, response.status, parsed);
  }

  if (parsed === null) {
    return undefined as T;
  }

  return unwrapEnvelope<T>(parsed);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, query, token, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: requestHeaders,
      credentials: 'include',
    });
  } catch {
    throw new DirectCashApiError(
      'Não foi possível conectar com a API. Verifique se ela está ativa e liberada para o front-end.',
      0,
    );
  }

  return parseResponse<T>(response);
}
