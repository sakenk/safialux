import "server-only";

/**
 * Уведомление админу в Telegram о новом заказе — чтобы узнавать о нём сразу, а не только
 * при заходе в /admin/orders. Настраивается через TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID;
 * без них — тихо ничего не делает. Никогда не бросает: сбой уведомления не должен ронять заказ.
 */
export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: controller.signal,
    });
    if (!res.ok) console.error("[telegram] sendMessage failed:", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("[telegram] sendMessage error:", err);
  } finally {
    clearTimeout(timeout);
  }
}
