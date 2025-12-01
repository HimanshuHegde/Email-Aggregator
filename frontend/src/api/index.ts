import type { Email } from "../type/email";

const API_BASE = "https://email-aggregator-1.onrender.com";

export async function fetchLast30Days(): Promise<Email[]> {
  const res = await fetch(`${API_BASE}/api/imapfunctions`, {
    headers: {
      'authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });
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
  const res = await fetch(url.toString(), {
    headers: {
      'authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  if (Array.isArray(data.emails)) {
    return data.emails as Email[];
  }
  return [];
}
export async function getAccounntByOwnerId(ownerId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/getOwnerById/${ownerId}`, {
    method: "GET",
    headers: {
      'authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  const data = await res.json();
  return data.accounts as any[];
}
export async function deleteAccount(email: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/elasticSearchfunc/deleteAccounts/${email}`, {
    method: "DELETE",
    headers: {
      'authorization': `Bearer ${localStorage.getItem("token")}`
    }
  });
  return res.ok;
}

export async function fetchEmailById(id: string): Promise<Email | null> {
  const res = await fetch(`${API_BASE}/api/elasticSearchfunc/${id}`,
    { headers: {
      'authorization': `Bearer ${localStorage.getItem("token")}`
    } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data as Email;
}

export async function createBulkEmails(emails: Email[]) {
  const res = await fetch(`${API_BASE}/api/elasticSearchfunc/bulk`, {
    method: "POST",
    headers: {
      'authorization': `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(emails)
  });
  return res.ok;
} 