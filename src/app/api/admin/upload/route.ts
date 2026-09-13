import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminApiGuard } from "@/lib/admin-guard";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 10 * 1024 * 1024;
const FOLDERS = new Set(["products", "categories", "brands"]);

export async function POST(req: NextRequest) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary не настроен: добавьте CLOUDINARY_* в .env.local" }, { status: 503 });
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Поддерживаются JPG, PNG, WebP и AVIF" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 400 });

  const folderInput = String(form?.get("folder") ?? "products");
  const folder = `sanlux/${FOLDERS.has(folderInput) ? folderInput : "products"}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await cloudinary.uploader.upload(`data:${file.type};base64,${buffer.toString("base64")}`, {
      folder,
      resource_type: "image",
      // Оригиналы с телефона бывают по 4000px — храним не больше 2000px по длинной стороне
      transformation: [{ width: 2000, height: 2000, crop: "limit" }],
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload] Cloudinary error:", err);
    return NextResponse.json({ error: "Не удалось загрузить фото. Попробуйте ещё раз." }, { status: 500 });
  }
}
