import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Private administrator sign-in. Sign-in only — there is no registration,
 * no public account system, and no link to this route anywhere on the site.
 * Authorization is enforced by the `_authenticated` gate and by RLS.
 */
export const Route = createFileRoute("/v9p3x-gate-7qz2")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      // Generic message: never reveal whether an account exists.
      setMessage("Invalid credentials.");
      return;
    }
    navigate({ to: "/k7m2q-desk-x8v41" });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <p className="label-eyebrow">Administration</p>
      <h1 className="mt-3 text-2xl">Sign in</h1>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="label-eyebrow">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="label-eyebrow">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {busy ? "Please wait…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
