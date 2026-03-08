const PROD_API = 'https://sgfbackend.deejay.onl'

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // In dev, requests go through Vite proxy (same origin)
      return ''
    }
  }
  return PROD_API
}

export async function fetchFromBFF<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const base = getApiBase()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `BFF API error: ${res.status} ${res.statusText}`);
  }
  return res.json()
}

export async function streamFromBFF(
  path: string,
  options: RequestInit,
  onChunk: (chunk: string) => void
): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `BFF API stream error: ${res.status} ${res.statusText}`);
  }
  
  if (!res.body) {
    throw new Error('No readable stream returned')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) {
      onChunk(chunk)
    }
  }
}
