import { createFileRoute } from "@tanstack/react-router";

/**
 * Streams a stored file (PDF report, Excel model, image, resume) from the
 * private file store.
 *
 * Security model: the requested storage path must be referenced by content
 * that is currently PUBLISHED. The allow-list is built with the anonymous
 * (publishable) key, so Row Level Security itself decides what is public —
 * drafts and unreferenced paths are never readable. Only after that check
 * does the server read the bytes. No listing, no writes, no traversal.
 */

const ALLOWLIST_TTL_MS = 30_000;
let cache: { at: number; paths: Set<string> } | null = null;

function add(set: Set<string>, value: unknown) {
  if (typeof value !== "string") return;
  const trimmed = value.replace(/^\/+/, "").trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return;
  set.add(trimmed);
}

async function publicPaths(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < ALLOWLIST_TTL_MS) return cache.paths;

  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  const anon = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const paths = new Set<string>();

  const [research, projects, certifications, settings] = await Promise.all([
    anon.from("research").select("cover_image_url, pdf_url, excel_url").eq("published", true),
    anon
      .from("projects")
      .select("cover_image_url, pdf_url, excel_url, gallery")
      .eq("published", true),
    anon
      .from("certifications")
      .select("certificate_image_path, certificate_pdf_path, issuer_logo_path")
      .eq("published", true),
    anon.from("site_settings").select("key, value").eq("key", "profile"),
  ]);

  for (const row of research.data ?? []) {
    add(paths, row.cover_image_url);
    add(paths, row.pdf_url);
    add(paths, row.excel_url);
  }
  for (const row of projects.data ?? []) {
    add(paths, row.cover_image_url);
    add(paths, row.pdf_url);
    add(paths, row.excel_url);
    for (const item of row.gallery ?? []) add(paths, item);
  }
  for (const row of certifications.data ?? []) {
    add(paths, row.certificate_image_path);
    add(paths, row.certificate_pdf_path);
    add(paths, row.issuer_logo_path);
  }
  for (const row of settings.data ?? []) {
    const value = row.value as Record<string, unknown> | null;
    add(paths, value?.["resume_url"]);
  }

  cache = { at: Date.now(), paths };
  return paths;
}

const notFound = () => new Response("Not found", { status: 404 });

export const Route = createFileRoute("/api/public/files/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        let path = "";
        try {
          path = decodeURIComponent(String((params as { _splat?: string })._splat ?? ""));
        } catch {
          return notFound();
        }

        if (
          !path ||
          path.length > 512 ||
          path.includes("..") ||
          path.startsWith("/") ||
          path.includes("\\") ||
          path.includes("\0")
        ) {
          return notFound();
        }

        let allowed: Set<string>;
        try {
          allowed = await publicPaths();
        } catch {
          return notFound();
        }
        if (!allowed.has(path)) return notFound();

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("research-files").download(path);
        if (error || !data) return notFound();

        const download = new URL(request.url).searchParams.has("download");
        const filename = (path.split("/").pop() ?? "file").replace(/["\r\n]/g, "");

        return new Response(data, {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "content-disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
            "cache-control": "public, max-age=3600",
            "x-content-type-options": "nosniff",
            "content-security-policy": "default-src 'none'; sandbox",
          },
        });
      },
    },
  },
});
