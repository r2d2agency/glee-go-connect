const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  payload: any;
  constructor(status: number, payload: any, message: string) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function api(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('gleego_token') : null;
  const res = await fetch(`${API}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && (
        (Array.isArray(data.message) ? data.message.join(' · ') : data.message) ||
        data.error
      )) ||
      (typeof data === 'string' ? data : '') ||
      `Erro ${res.status}`;
    throw new ApiError(res.status, data, msg);
  }
  return data;
}