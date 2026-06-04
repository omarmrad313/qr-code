"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Usernames map to <username>@menu.local on the Supabase side.
// Create the user once in Supabase → Authentication → Users with that email.
const USERNAME_DOMAIN = "menu.local";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const raw = username.trim().toLowerCase();
    // Accept a full email as-is; otherwise treat as username and append the default domain.
    const email = raw.includes("@") ? raw : `${raw}@${USERNAME_DOMAIN}`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("Invalid username or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="card w-full max-w-sm p-8">
      <div className="mb-6">
        <div className="text-xl font-semibold tracking-tightish">Sign in</div>
        <p className="mt-1 text-sm text-muted">Access the menu builder.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted">Username or email</label>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input mt-1.5"
            placeholder="ahmed123 or you@example.com"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1.5"
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
