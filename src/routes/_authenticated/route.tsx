import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

/**
 * Gate for the private administration area.
 * Anonymous  -> private sign-in route.
 * Signed in without the admin role -> back to the public site.
 * Row Level Security remains the final authorization layer.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/v9p3x-gate-7qz2" });

    // Role is read from the database (own row only, enforced by RLS) —
    // never from client state. RLS re-checks it on every read and write.
    const { data: adminRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRow) throw redirect({ to: "/" });

    return { user: data.user };
  },
  component: () => <Outlet />,
});
