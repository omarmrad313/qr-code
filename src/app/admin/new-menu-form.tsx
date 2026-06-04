"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function NewMenuForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const finalSlug = slug.trim() || slugify(name);
    const { data, error } = await supabase
      .from("menus")
      .insert({ name: name.trim(), slug: finalSlug })
      .select("id")
      .single();
    setBusy(false);
    if (error) return setError(error.message);
    router.push(`/admin/menus/${data!.id}?tab=qr`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted">Menu name</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          placeholder="Café Lamar"
          className="input mt-1.5"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted">URL slug</label>
        <div className="mt-1.5 flex overflow-hidden rounded-lg border border-line bg-surface">
          <span className="flex items-center bg-elevated px-3 text-sm text-muted">/menu/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="cafe-lamar"
            className="w-full bg-surface px-3 py-2 text-sm text-fg focus:outline-none"
            required
          />
        </div>
        <p className="mt-1 text-xs text-dim">This appears in the QR-code URL.</p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Creating…" : "Create menu"}
      </button>
    </form>
  );
}
