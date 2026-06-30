import { getStoredToken } from "./auth";

const API_BASE = "/api";

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const token = getStoredToken();
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (token) {
    (options.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro de rede" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: any) => request<T>("POST", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
