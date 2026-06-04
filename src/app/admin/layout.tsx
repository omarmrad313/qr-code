import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="label-eyebrow">Setup required</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tighter2">Supabase not configured</h1>
        <p className="mt-3 text-muted">
          The app needs a Supabase project to store menus, users, and images. Add your keys to
          <code className="mx-1 rounded bg-elevated px-1.5 py-0.5 text-xs">.env.local</code>
          and restart. See <code>README.md</code> for the full setup checklist.
        </p>
      </main>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <>{children}</>;
}
