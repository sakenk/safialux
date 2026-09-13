import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_TAG } from "@/lib/data";
import { adminApiGuard } from "@/lib/admin-guard";
import { CATALOG_ENTITIES, friendlyDbError, isEntity, sanitize } from "@/lib/admin-entities";
import { adminDb, isAdminDbConfigured } from "@/lib/supabase";

type Ctx = { params: Promise<{ entity: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const denied = await adminApiGuard();
  if (denied) return denied;
  const { entity } = await params;
  if (!isEntity(entity)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdminDbConfigured) return NextResponse.json({ error: "Демо-режим: подключите Supabase, чтобы сохранять данные" }, { status: 503 });

  const result = sanitize(entity, (await req.json().catch(() => ({}))) ?? {}, "create");
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await adminDb().from(entity).insert(result.data).select("id").single();
  if (error) return NextResponse.json({ error: friendlyDbError(error.message) }, { status: 400 });

  if (CATALOG_ENTITIES.includes(entity)) {
    revalidateTag(CATALOG_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
