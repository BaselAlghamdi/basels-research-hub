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

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw redirect({ to: "/" });

    return { user: data.user };
  },
  component: () => <Outlet />,
});
