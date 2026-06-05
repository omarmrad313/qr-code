"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EditorShell from "@/components/editor/EditorShell";
import type {
  EditorAdapter,
  EditorMenu,
  EditorCategory,
  EditorProduct,
  MenuPatch,
  CategoryPatch,
} from "@/components/editor/types";

const BUCKET = "product-images";

export default function RealEditor({
  initial,
  publicUrl,
  initialTab,
}: {
  initial: EditorMenu;
  publicUrl: string;
  initialTab?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [menu, setMenu] = useState<EditorMenu>(initial);
  const debounce = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function debounced(key: string, ms: number, fn: () => Promise<void> | void) {
    const old = debounce.current.get(key);
    if (old) clearTimeout(old);
    debounce.current.set(
      key,
      setTimeout(async () => {
        await fn();
      }, ms)
    );
  }

  function patchMenu(updater: (m: EditorMenu) => EditorMenu) {
    setMenu((m) => updater(m));
  }

  const adapter: EditorAdapter = {
    updateMenu(patch: MenuPatch) {
      patchMenu((m) => ({ ...m, ...patch }));
      debounced(`menu:${menu.id}`, 300, async () => {
        await supabase.from("menus").update(patch).eq("id", menu.id);
        router.refresh();
      });
    },
    async addCategory(name) {
      const sort_order = menu.categories.length;
      const { data } = await supabase
        .from("categories")
        .insert({ menu_id: menu.id, name, sort_order })
        .select("*")
        .single();
      if (data) {
        patchMenu((m) => ({
          ...m,
          categories: [
            ...m.categories,
            { id: data.id, name: data.name, name_ar: data.name_ar ?? null, products: [] },
          ],
        }));
        router.refresh();
      }
    },
    updateCategory(id, patch: CategoryPatch) {
      patchMenu((m) => ({
        ...m,
        categories: m.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
      debounced(`cat:${id}`, 300, async () => {
        await supabase.from("categories").update(patch).eq("id", id);
      });
    },
    async deleteCategory(id) {
      patchMenu((m) => ({ ...m, categories: m.categories.filter((c) => c.id !== id) }));
      await supabase.from("categories").delete().eq("id", id);
      router.refresh();
    },
    async reorderCategories(orderedIds) {
      patchMenu((m) => ({
        ...m,
        categories: orderedIds
          .map((id) => m.categories.find((c) => c.id === id))
          .filter(Boolean) as EditorCategory[],
      }));
      await Promise.all(
        orderedIds.map((id, idx) =>
          supabase.from("categories").update({ sort_order: idx }).eq("id", id)
        )
      );
    },
    async addProduct(categoryId) {
      const cat = menu.categories.find((c) => c.id === categoryId);
      const sort_order = cat?.products.length ?? 0;
      const { data } = await supabase
        .from("products")
        .insert({ category_id: categoryId, name: "New item", price: 0, sort_order })
        .select("*")
        .single();
      if (data) {
        const np: EditorProduct = {
          id: data.id,
          name: data.name,
          name_ar: data.name_ar ?? null,
          description: data.description ?? "",
          description_ar: data.description_ar ?? null,
          price: Number(data.price),
          price_lbp: data.price_lbp == null ? null : Number(data.price_lbp),
          image_url: data.image_url ?? null,
          available: data.available ?? true,
        };
        patchMenu((m) => ({
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId ? { ...c, products: [...c.products, np] } : c
          ),
        }));
        router.refresh();
      }
    },
    updateProduct(id, patch) {
      patchMenu((m) => ({
        ...m,
        categories: m.categories.map((c) => ({
          ...c,
          products: c.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      }));
      debounced(`prod:${id}`, 300, async () => {
        const dbPatch: Record<string, unknown> = { ...patch };
        if ("description" in dbPatch && dbPatch.description === "") dbPatch.description = null;
        await supabase.from("products").update(dbPatch).eq("id", id);
      });
    },
    async deleteProduct(id) {
      patchMenu((m) => ({
        ...m,
        categories: m.categories.map((c) => ({
          ...c,
          products: c.products.filter((p) => p.id !== id),
        })),
      }));
      await supabase.from("products").delete().eq("id", id);
      router.refresh();
    },
    async reorderProducts(categoryId, orderedIds) {
      patchMenu((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                products: orderedIds
                  .map((id) => c.products.find((p) => p.id === id))
                  .filter(Boolean) as EditorProduct[],
              }
            : c
        ),
      }));
      await Promise.all(
        orderedIds.map((id, idx) =>
          supabase.from("products").update({ sort_order: idx }).eq("id", id)
        )
      );
    },
    async uploadImage(productId, file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      this.updateProduct(productId, { image_url: pub.publicUrl });
      return pub.publicUrl;
    },
    async uploadCover(file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `covers/${menu.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      patchMenu((m) => ({ ...m, cover_image_url: pub.publicUrl }));
      await supabase.from("menus").update({ cover_image_url: pub.publicUrl }).eq("id", menu.id);
      router.refresh();
      return pub.publicUrl;
    },
    clearCover() {
      patchMenu((m) => ({ ...m, cover_image_url: null }));
      supabase.from("menus").update({ cover_image_url: null }).eq("id", menu.id).then(() => router.refresh());
    },
    async addCoverImage(file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `covers/${menu.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const next = [...menu.cover_images, pub.publicUrl];
      patchMenu((m) => ({ ...m, cover_images: next }));
      await supabase.from("menus").update({ cover_images: next }).eq("id", menu.id);
      router.refresh();
      return pub.publicUrl;
    },
    async removeCoverImage(url) {
      const next = menu.cover_images.filter((u) => u !== url);
      patchMenu((m) => ({ ...m, cover_images: next }));
      await supabase.from("menus").update({ cover_images: next }).eq("id", menu.id);
      router.refresh();
    },
    async uploadBackground(file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `backgrounds/${menu.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      patchMenu((m) => ({ ...m, background_image_url: pub.publicUrl }));
      await supabase.from("menus").update({ background_image_url: pub.publicUrl }).eq("id", menu.id);
      router.refresh();
      return pub.publicUrl;
    },
    clearBackground() {
      patchMenu((m) => ({ ...m, background_image_url: null }));
      supabase.from("menus").update({ background_image_url: null }).eq("id", menu.id).then(() => router.refresh());
    },
  };

  return (
    <EditorShell
      menu={menu}
      adapter={adapter}
      publicUrl={publicUrl}
      homeHref="/admin"
      homeLabel="All menus"
      initialTab={initialTab}
    />
  );
}
