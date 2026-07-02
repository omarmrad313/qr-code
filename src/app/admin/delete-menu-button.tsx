"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TrashIcon } from "@/components/icons";

export default function DeleteMenuButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onClick() {
    const ok = confirm(
      `Delete "${name}"? This removes all its categories and items. This cannot be undone.`
    );
    if (!ok) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("menus").delete().eq("id", id);
    setBusy(false);
    if (error) {
      alert(`Could not delete: ${error.message}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      title="Delete menu"
      className="btn-danger"
    >
      <TrashIcon />
    </button>
  );
}
