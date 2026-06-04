import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import RealEditor from "./real-editor";
import type {
  EditorCategory,
  EditorMenu,
  EditorProduct,
} from "@/components/editor/types";

export const dynamic = "force-dynamic";

export default async function EditMenuPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!menu) notFound();

  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", params.id)
    .order("sort_order", { ascending: true });

  const categoryIds = (categoriesRaw ?? []).map((c) => c.id);
  const { data: productsRaw } = categoryIds.length
    ? await supabase
        .from("products")
        .select("*")
        .in("category_id", categoryIds)
        .order("sort_order", { ascending: true })
    : { data: [] as any[] };

  const initial: EditorMenu = {
    id: menu.id,
    name: menu.name,
    name_ar: menu.name_ar ?? null,
    subtitle: menu.subtitle ?? null,
    subtitle_ar: menu.subtitle_ar ?? null,
    slug: menu.slug,
    cover_image_url: menu.cover_image_url ?? null,
    background_image_url: menu.background_image_url ?? null,
    layout_style: (menu.layout_style as "list" | "cards" | "gallery") ?? "list",
    categories: (categoriesRaw ?? []).map((c): EditorCategory => ({
      id: c.id,
      name: c.name,
      name_ar: c.name_ar ?? null,
      products: (productsRaw ?? [])
        .filter((p) => p.category_id === c.id)
        .map((p): EditorProduct => ({
          id: p.id,
          name: p.name,
          name_ar: p.name_ar ?? null,
          description: p.description ?? "",
          description_ar: p.description_ar ?? null,
          price: Number(p.price),
          price_lbp: p.price_lbp == null ? null : Number(p.price_lbp),
          image_url: p.image_url ?? null,
          available: p.available ?? true,
        })),
    })),
  };

  // Build the public URL from the actual request host — so a QR generated on
  // ghazze.vercel.app encodes ghazze.vercel.app, not whatever env var is set.
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const site =
    envSite && !envSite.includes("localhost") ? envSite : `${proto}://${host}`;
  const publicUrl = `${site.replace(/\/$/, "")}/menu/${menu.slug}`;

  return <RealEditor initial={initial} publicUrl={publicUrl} initialTab={searchParams.tab} />;
}
