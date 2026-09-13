export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

/** Ступень оптовой цены: при количестве ≥ min_qty действует price за штуку. */
export interface PriceTier {
  min_qty: number;
  price: number;
}

export interface SeoFields {
  h1: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_text: string | null;
}

export interface Category extends SeoFields {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Brand extends SeoFields {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  country: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  category_id: string;
  brand_id: string | null;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  wholesale_prices: PriceTier[];
  images: ProductImage[];
  specs: ProductSpec[];
  in_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_sale: boolean;
  is_published: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithRelations extends Product {
  category: Pick<Category, "id" | "slug" | "name"> | null;
  brand: Pick<Brand, "id" | "slug" | "name" | "logo_url"> | null;
}

export type CustomerType = "person" | "company";
export type DeliveryMethod = "pickup" | "delivery";
export type OrderStatus = "new" | "processing" | "done" | "cancelled";
export type LeadStatus = "new" | "in_work" | "closed";

export interface OrderItem {
  product_id: string;
  slug: string;
  name: string;
  sku: string | null;
  image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  number: number;
  customer_type: CustomerType;
  customer_name: string;
  customer_phone: string;
  company_name: string | null;
  company_bin: string | null;
  needs_invoice: boolean;
  city: string | null;
  delivery_method: DeliveryMethod;
  address: string | null;
  comment: string | null;
  items: OrderItem[];
  items_count: number;
  total: number;
  status: OrderStatus;
  admin_note: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  company_name: string | null;
  message: string | null;
  source: string;
  product_id: string | null;
  status: LeadStatus;
  created_at: string;
}
