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

export async function uploadFile(file: File): Promise<{ url: string; filename: string; size: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('gleego_token') : null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/api/uploads`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: fd,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Erro ${res.status}`;
    throw new ApiError(res.status, data, Array.isArray(msg) ? msg.join(' · ') : msg);
  }
  return data;
}