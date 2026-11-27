export type ApiRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

export async function responseJson<T>(pending: Response | Promise<Response>): Promise<T> {
  const response = await pending;
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { message?: string | string[] };
    throw new Error(Array.isArray(error.message) ? error.message.join(", ") : error.message ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function postJson<T>(api: ApiRequest, path: string, data: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(data) });
}
