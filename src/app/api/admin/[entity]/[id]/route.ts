import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_TAG } from "@/lib/data";
import { adminApiGuard } from "@/lib/admin-guard";
import { CATALOG_ENTITIES, friendlyDbError, isEntity, sanitize } from "@/lib/admin-entities";
import { adminDb, isAdminDbConfigured } from "@/lib/supabase";

type Ctx = { params: Promise<{ entity: string; id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function prepare(ctx: Ctx) {
  const denied = await adminApiGuard();
  if (denied) return { response: denied };
  const { entity, id } = await ctx.params;
  if (!isEntity(entity)) return { response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (!isAdminDbConfigured) {
    return { response: NextResponse.json({ error: "Демо-режим: подключите Supabase, чтобы сохранять данные" }, { status: 503 }) };
  }
  if (!UUID.test(id)) return { response: NextResponse.json({ error: "Запись не найдена" }, { status: 404 }) };
  return { entity, id };
}

function refreshCatalog(entity: string) {
  if (CATALOG_ENTITIES.includes(entity as never)) {
    revalidateTag(CATALOG_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const prep = await prepare(ctx);
  if ("response" in prep) return prep.response;
  const { entity, id } = prep;

  const result = sanitize(entity, (await req.json().catch(() => ({}))) ?? {}, "update");
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { error, count } = await adminDb().from(entity).update(result.data, { count: "exact" }).eq("id", id);
  if (error) return NextResponse.json({ error: friendlyDbError(error.message) }, { status: 400 });
  if (!count) return NextResponse.json({ error: "Запись не найдена — возможно, её уже удалили" }, { status: 404 });

  refreshCatalog(entity);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const prep = await prepare(ctx);
  if ("response" in prep) return prep.response;
  const { entity, id } = prep;
  if (entity === "orders") return NextResponse.json({ error: "Заказы не удаляются — поставьте статус «Отменён»" }, { status: 400 });

  const { error } = await adminDb().from(entity).delete().eq("id", id);
  if (error) return NextResponse.json({ error: friendlyDbError(error.message) }, { status: 400 });

  refreshCatalog(entity);
  return NextResponse.json({ ok: true });
}
