import { createFileRoute } from "@tanstack/react-router";

/**
 * Streams a stored file (PDF report, Excel model, image, resume) from the
 * private file store. Only files that are referenced publicly are readable,
 * and no write operations are exposed here.
 */
export const Route = createFileRoute("/api/public/files/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = decodeURIComponent(String((params as { _splat?: string })._splat ?? ""));

        if (!path || path.includes("..") || path.startsWith("/")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("research-files").download(path);

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        const download = new URL(request.url).searchParams.has("download");
        const filename = path.split("/").pop() ?? "file";

        return new Response(data, {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "content-disposition": `${download ? "attachment" : "inline"}; filename="${filename.replace(/"/g, "")}"`,
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
