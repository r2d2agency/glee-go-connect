import { ApiError } from './api';

const MAP: Record<string, string> = {
  'Invalid credentials': 'Email ou senha incorretos.',
  'Credenciais inválidas': 'Email ou senha incorretos.',
  'Unauthorized': 'Sessão expirada. Faça login novamente.',
};

export function humanizeError(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (err instanceof ApiError) {
    const msg = err.message || fallback;
    if (err.status === 401) return MAP['Unauthorized'];
    return MAP[msg] || msg;
  }
  if (err instanceof Error) return MAP[err.message] || err.message || fallback;
  return fallback;
}