import type { Email } from "../type/email";

const API_BASE = "http://localhost:3000";

export async function fetchLast30Days(): Promise<Email[]> {
  const res = await fetch(`${API_BASE}/api/imapfunctions`);
  if (!res.ok) throw new Error("Failed to fetch recent emails");
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map((row) => ({ id: String(row.uid), ...row.message } as Email));
  }
  return [];
}

export default async function searchEmails(q: string): Promise<Email[]> {
  const url = new URL(`${API_BASE}/api/elasticSearchfunc`);
  url.searchParams.set("q", q || "");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  if (data?.hits?.hits && Array.isArray(data.hits.hits)) {
    return data.hits.hits.map((h: Email) => ({ id: h.id, ...(h || {}) } as Email));
  }
  if (Array.isArray(data)) {
    return data.map((e: Email) => ({ id: e.id, ...(e) } as Email));
  }
  return [];
}

export async function fetchEmailById(id: string): Promise<Email | null> {
  const res = await fetch(`${API_BASE}/api/elasticSearchfunc/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data as Email;
}