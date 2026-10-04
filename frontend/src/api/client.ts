import type {
  Container,
  ContainerWithItems,
  Item,
  PaginatedItems,
  SearchResponse,
} from "../types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getContainers: () => request<Container[]>("/containers"),
  createContainer: (label?: string) =>
    request<Container>("/containers", {
      method: "POST",
      body: JSON.stringify({ label }),
    }),
  getContainer: (id: number) =>
    request<ContainerWithItems>(`/containers/${id}`),
  renameContainer: (id: number, label: string) =>
    request<Container>(`/containers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ label }),
    }),
  deleteContainer: (id: number) =>
    request<void>(`/containers/${id}`, { method: "DELETE" }),

  getFreestandingItems: (page: number, limit: number) =>
    request<PaginatedItems>(`/items?page=${page}&limit=${limit}`),
  createItem: (input: {
    name: string;
    quantity?: number;
    container_id?: number | null;
  }) =>
    request<Item>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateItem: (
    id: number,
    input: Partial<{ name: string; quantity: number; container_id: number | null }>
  ) =>
    request<Item>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteItem: (id: number) =>
    request<void>(`/items/${id}`, { method: "DELETE" }),

  search: (q: string) =>
    request<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),
};
