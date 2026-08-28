import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Project, Research } from "@/lib/content";

export const BUCKET = "research-files";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Uploads to the private store and returns the stored path plus a size label. */
export async function uploadFile(
  folder: string,
  file: File,
): Promise<{ path: string; meta: string }> {
  const clean = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const path = `${folder}/${Date.now()}-${clean}${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  const kind = ext.replace(".", "").toUpperCase() || "FILE";
  return { path, meta: `${kind} · ${formatBytes(file.size)}` };
}

export const adminResearchQuery = queryOptions({
  queryKey: ["admin", "research"],
  queryFn: async (): Promise<Research[]> => {
    const { data, error } = await supabase
      .from("research")
      .select("*")
      .order("publication_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const adminProjectsQuery = queryOptions({
  queryKey: ["admin", "projects"],
  queryFn: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("project_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const isAdminQuery = queryOptions({
  queryKey: ["admin", "is-admin"],
  queryFn: async (): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return false;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return false;
    return !!data;
  },
});
