"use client";

/** Запрос к API админки с человеческой ошибкой. */
export async function adminRequest<T = { ok: true }>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // Proxy перенаправит на страницу входа
    window.location.reload();
    throw new Error("Сессия истекла — войдите заново");
  }
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data as T;
}

export async function uploadImage(file: File, folder: "products" | "categories" | "brands") {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Не удалось загрузить фото");
  return data.url as string;
}
