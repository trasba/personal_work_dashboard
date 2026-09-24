/**
 * AuraWork AI — API Client for SQLite and Outlook MAPI Backend
 */

export const API_BASE = window.location.origin;

export async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson?.detail) errorDetail = errJson.detail;
      } catch (_) {}
      const err = new Error(errorDetail);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[AuraWork Sync] API error on ${method} ${endpoint}:`, err.message);
    throw err;
  }
}
