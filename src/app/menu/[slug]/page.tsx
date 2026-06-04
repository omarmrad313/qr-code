import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MenuClient, { type PublicCategory, type PublicMenu } from "./menu-client";
import type { Category, Menu, Product } from "@/types";

export const revalidate = 30;

export default async function PublicMenuPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!menu) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menu.id)
    .order("sort_order", { ascending: true });

  const categoryIds = (categories ?? []).map((c) => c.id);
  const { data: products } = categoryIds.length
    ? await supabase
        .from("products")
        .select("*")
        .in("category_id", categoryIds)
        .eq("available", true)
        .order("sort_order", { ascending: true })
    : { data: [] as Product[] };

  const m = menu as Menu;
  const cats = (categories ?? []) as Category[];
  const prods = (products ?? []) as Product[];

  const publicMenu: PublicMenu = {
    name: m.name,
    name_ar: m.name_ar,
    subtitle: m.subtitle,
    subtitle_ar: m.subtitle_ar,
    cover_image_url: m.cover_image_url,
    background_image_url: m.background_image_url ?? null,
    layout_style: (m.layout_style as any) ?? "list",
    categories: cats
      .map<PublicCategory>((c) => ({
        id: c.id,
        name: c.name,
        name_ar: c.name_ar,
        items: prods
          .filter((p) => p.category_id === c.id)
          .map((p) => ({
            id: p.id,
            name: p.name,
            name_ar: p.name_ar,
            description: p.description,
            description_ar: p.description_ar,
            price: Number(p.price),
            price_lbp: p.price_lbp == null ? null : Number(p.price_lbp),
            image_url: p.image_url,
          })),
      }))
      .filter((c) => c.items.length > 0),
  };

  return <MenuClient menu={publicMenu} />;
}
