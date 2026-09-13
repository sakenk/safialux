import "server-only";

// Простой лимит в памяти процесса: отсекает повторные отправки ботами.
// На нескольких инстансах лимит условный — основную защиту дают honeypot и время заполнения формы.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

/** Общая проверка формы от ботов: пустой honeypot и не меньше 3 секунд на заполнение. */
export function looksLikeBot(body: { website?: unknown; formLoadedAt?: unknown }) {
  if (body.website) return true;
  return typeof body.formLoadedAt !== "number" || Date.now() - body.formLoadedAt < 3000;
}

export function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const v = value.replace(/\s+/g, " ").trim().slice(0, max);
  return v || null;
}

export function cleanMultiline(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const v = value.replace(/\r\n/g, "\n").trim().slice(0, max);
  return v || null;
}
