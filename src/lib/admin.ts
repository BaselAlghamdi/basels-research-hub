import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Project, Research } from "@/lib/content";
import type { Certification } from "@/lib/certifications";

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

/**
 * Only document, spreadsheet and image formats are accepted. Executable,
 * script and markup formats are rejected so nothing active can ever be
 * served back from the file store.
 */
const ALLOWED: Record<string, { mime: string[]; maxMb: number }> = {
  pdf: { mime: ["application/pdf"], maxMb: 25 },
  xlsx: {
    mime: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    maxMb: 25,
  },
  xls: { mime: ["application/vnd.ms-excel"], maxMb: 25 },
  csv: { mime: ["text/csv", "application/vnd.ms-excel", ""], maxMb: 10 },
  jpg: { mime: ["image/jpeg"], maxMb: 8 },
  jpeg: { mime: ["image/jpeg"], maxMb: 8 },
  png: { mime: ["image/png"], maxMb: 8 },
  webp: { mime: ["image/webp"], maxMb: 8 },
};

const SAFE_FOLDER = /^[a-z0-9][a-z0-9-]{0,40}$/;

/** Uploads to the private store and returns the stored path plus a size label. */
export async function uploadFile(
  folder: string,
  file: File,
): Promise<{ path: string; meta: string }> {
  if (!SAFE_FOLDER.test(folder)) throw new Error("Invalid upload folder.");

  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rule = ALLOWED[ext];
  if (!rule) {
    throw new Error("Unsupported file type. Allowed: PDF, XLSX, XLS, CSV, JPG, PNG, WebP.");
  }
  if (file.type && !rule.mime.includes(file.type)) {
    throw new Error("File content does not match its extension.");
  }
  if (file.size > rule.maxMb * 1024 * 1024) {
    throw new Error(`File is too large. Maximum ${rule.maxMb} MB.`);
  }

  const clean = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "file";
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  // Unique path: uploads never overwrite an existing object.
  const path = `${folder}/${Date.now()}-${unique}-${clean}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: rule.mime[0] || "application/octet-stream",
  });
  if (error) throw error;

  return { path, meta: `${ext.toUpperCase()} · ${formatBytes(file.size)}` };
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

export const adminCertificationsQuery = queryOptions({
  queryKey: ["admin", "certifications"],
  queryFn: async (): Promise<Certification[]> => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
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
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (error) return false;
    return !!data;
  },
});
