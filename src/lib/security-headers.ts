/**
 * Response security headers applied to every document served by the app.
 *
 * The policy is intentionally narrow: it only allows the services the site
 * actually uses (Supabase, Google Fonts, Vercel Analytics) and never falls
 * back to a permissive `default-src *`, `script-src *` or `unsafe-eval`.
 */

const SUPABASE_ORIGIN = "https://ojfnurxmpismeltduxvm.supabase.co";
const SUPABASE_WS = "wss://ojfnurxmpismeltduxvm.supabase.co";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' is required for the framework's hydration/streaming
  // bootstrap scripts. 'unsafe-eval' is deliberately NOT allowed.
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${SUPABASE_ORIGIN}`,
  `connect-src 'self' ${SUPABASE_ORIGIN} ${SUPABASE_WS} https://vitals.vercel-insights.com`,
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

/** Paths that must never be indexed by search engines. */
const NOINDEX_PREFIXES = ["/k7m2q-desk-x8v41", "/v9p3x-gate-7qz2", "/api/"];

/**
 * The Lovable editor renders the app inside an iframe. Denying framing there
 * would break the preview, so frame busting is only enforced off the editor
 * preview hosts (the published site always gets it).
 */
function isEditorPreviewHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("id-preview--") ||
    hostname.endsWith("-dev.lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.dev")
  );
}

export function applySecurityHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const preview = isEditorPreviewHost(url.hostname);
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("X-DNS-Prefetch-Control", "off");

  if (!preview) {
    headers.set("X-Frame-Options", "DENY");
    headers.set("Content-Security-Policy", CSP_DIRECTIVES);
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  if (NOINDEX_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
