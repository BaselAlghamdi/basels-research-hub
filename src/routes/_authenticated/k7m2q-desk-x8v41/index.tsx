import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { adminProjectsQuery, adminResearchQuery, isAdminQuery } from "@/lib/admin";
import { formatDate } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/k7m2q-desk-x8v41/")({
  head: () => ({
    meta: [{ title: "Admin — Basel M. Alghamdi" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading } = useQuery(isAdminQuery);
  const research = useQuery({ ...adminResearchQuery, enabled: !!isAdmin });
  const projects = useQuery({ ...adminProjectsQuery, enabled: !!isAdmin });

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  }

  async function remove(table: "research" | "projects", id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      window.alert(error.message);
      return;
    }
    queryClient.invalidateQueries();
  }

  if (isLoading) {
    return <p className="mx-auto max-w-6xl px-5 py-16 text-sm text-muted-foreground">Loading…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
        <h1 className="text-2xl">Not authorised</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account does not have administrator access.
        </p>
        <button onClick={signOut} className="mt-6 border border-input px-3 py-1.5 text-xs">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="label-eyebrow">Administration</p>
          <h1 className="mt-2 text-3xl">Content Manager</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/k7m2q-desk-x8v41/settings"
            className="border border-input px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Site settings
          </Link>
          <button onClick={signOut} className="border border-input px-3 py-1.5 text-xs font-medium">
            Sign out
          </button>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between border-b border-foreground pb-2">
          <h2 className="label-eyebrow text-foreground">Research</h2>
          <Link
            to="/k7m2q-desk-x8v41/research/$id"
            params={{ id: "new" }}
            className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent"
          >
            New research
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {(research.data ?? []).map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="num text-xs text-muted-foreground">
                  {item.category} · {formatDate(item.publication_date)}
                  {item.published ? "" : " · Draft"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/research/$slug"
                  params={{ slug: item.slug }}
                  className="border border-input px-2.5 py-1 text-xs"
                >
                  View
                </Link>
                <Link
                  to="/k7m2q-desk-x8v41/research/$id"
                  params={{ id: item.id }}
                  className="border border-input px-2.5 py-1 text-xs"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove("research", item.id, item.title)}
                  className="border border-input px-2.5 py-1 text-xs text-destructive"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {research.data && !research.data.length ? (
            <li className="py-4 text-sm text-muted-foreground">No research yet.</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between border-b border-foreground pb-2">
          <h2 className="label-eyebrow text-foreground">Projects</h2>
          <Link
            to="/k7m2q-desk-x8v41/projects/$id"
            params={{ id: "new" }}
            className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent"
          >
            New project
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {(projects.data ?? []).map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="num text-xs text-muted-foreground">
                  {item.category} · {formatDate(item.project_date)}
                  {item.published ? "" : " · Draft"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/projects/$slug"
                  params={{ slug: item.slug }}
                  className="border border-input px-2.5 py-1 text-xs"
                >
                  View
                </Link>
                <Link
                  to="/k7m2q-desk-x8v41/projects/$id"
                  params={{ id: item.id }}
                  className="border border-input px-2.5 py-1 text-xs"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove("projects", item.id, item.title)}
                  className="border border-input px-2.5 py-1 text-xs text-destructive"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {projects.data && !projects.data.length ? (
            <li className="py-4 text-sm text-muted-foreground">No projects yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
