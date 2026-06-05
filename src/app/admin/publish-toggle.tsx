"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PublishToggle({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [, startTransition] = useTransition();

  async function toggle() {
    const next = !on;
    setOn(next);
    const supabase = createClient();
    const { error } = await supabase.from("menus").update({ published: next }).eq("id", id);
    if (error) {
      setOn(!next);
      alert(error.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      title={on ? "Live — tap to hide" : "Hidden — tap to publish"}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        on ? "bg-emerald-500" : "bg-elevated border border-line"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
