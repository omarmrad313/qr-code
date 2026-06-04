import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ExternalIcon, PlusIcon } from "@/components/icons";
import SignOutButton from "./sign-out-button";
import type { Menu } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (menus ?? []) as Menu[];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="label-eyebrow">Workspace</div>
            <div className="text-sm font-semibold tracking-tightish">Menu Builder</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-dim md:inline">{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tighter2">Your menus</h1>
            <p className="mt-1 text-sm text-muted">
              {list.length} {list.length === 1 ? "menu" : "menus"}
            </p>
          </div>
          <Link href="/admin/new" className="btn-primary">
            <PlusIcon /> Create menu
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="card mt-10 py-20 text-center">
            <p className="text-base font-medium">No menus yet.</p>
            <p className="mt-1 text-sm text-muted">Start by adding your first menu.</p>
            <Link href="/admin/new" className="btn-primary mt-6">
              Create menu
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {list.map((m) => (
              <li key={m.id} className="card group p-5 transition hover:border-focus">
                <div className="text-base font-semibold tracking-tightish">{m.name}</div>
                <div className="mt-0.5 text-xs text-dim">/menu/{m.slug}</div>
                <div className="mt-5 flex gap-2">
                  <Link href={`/admin/menus/${m.id}`} className="btn-primary flex-1">
                    Open
                  </Link>
                  <Link
                    href={`/menu/${m.slug}`}
                    target="_blank"
                    className="btn-secondary"
                    title="View public menu"
                  >
                    <ExternalIcon />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
