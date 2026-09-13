import "server-only";
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import { adminDb, isAdminDbConfigured } from "./supabase";
import type { Brand, Category, Lead, Order, Product } from "./types";

// Чтение для админки: включая скрытые записи, без кэша.

async function all<T>(table: string, order: string, ascending: boolean): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await adminDb().from(table).select("*").order(order, { ascending }).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return rows;
  }
}

export async function adminCategories(): Promise<Category[]> {
  return isAdminDbConfigured ? all<Category>("categories", "sort_order", true) : DEMO_CATEGORIES;
}

export async function adminBrands(): Promise<Brand[]> {
  return isAdminDbConfigured ? all<Brand>("brands", "sort_order", true) : DEMO_BRANDS;
}

export async function adminProducts(): Promise<Product[]> {
  const rows = isAdminDbConfigured ? await all<Product>("products", "created_at", false) : DEMO_PRODUCTS;
  return rows.map((p) => ({ ...p, price: Number(p.price), old_price: p.old_price == null ? null : Number(p.old_price) }));
}

async function byId<T>(table: string, id: string, demo: T[]): Promise<T | null> {
  if (!isAdminDbConfigured) return (demo as (T & { id: string })[]).find((r) => r.id === id) ?? null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await adminDb().from(table).select("*").eq("id", id).maybeSingle();
  return (data as T) ?? null;
}

export const adminProduct = (id: string) => byId<Product>("products", id, DEMO_PRODUCTS);
export const adminCategory = (id: string) => byId<Category>("categories", id, DEMO_CATEGORIES);
export const adminBrand = (id: string) => byId<Brand>("brands", id, DEMO_BRANDS);
export const adminOrder = (id: string) => byId<Order>("orders", id, []);

export async function adminOrders(filter: { status?: string; type?: string; from?: string; to?: string }) {
  if (!isAdminDbConfigured) return [] as Order[];
  let q = adminDb().from("orders").select("*").order("created_at", { ascending: false }).limit(500);
  if (filter.status) q = q.eq("status", filter.status);
  if (filter.type === "company") q = q.eq("customer_type", "company");
  if (filter.from) q = q.gte("created_at", `${filter.from}T00:00:00+05:00`);
  if (filter.to) q = q.lte("created_at", `${filter.to}T23:59:59+05:00`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data ?? []) as Order[]).map((o) => ({ ...o, total: Number(o.total), number: Number(o.number) }));
}

export async function adminLeads(status?: string) {
  if (!isAdminDbConfigured) return [] as Lead[];
  let q = adminDb().from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function adminCounters() {
  if (!isAdminDbConfigured) return { newOrders: 0, newLeads: 0 };
  const [orders, leads] = await Promise.all([
    adminDb().from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    adminDb().from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return { newOrders: orders.count ?? 0, newLeads: leads.count ?? 0 };
}
