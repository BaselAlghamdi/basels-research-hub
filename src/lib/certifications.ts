import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Certification = Database["public"]["Tables"]["certifications"]["Row"];

/** Only http(s) links are ever rendered — blocks javascript:/data: URLs. */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function certificationStatus(item: Certification): string {
  if (item.does_not_expire || !item.expiration_date) return "No expiration";
  const expires = new Date(`${item.expiration_date}T00:00:00Z`);
  return expires.getTime() < Date.now() ? "Expired" : "Valid";
}

export const certificationsQuery = queryOptions({
  queryKey: ["certifications", "list"],
  queryFn: async (): Promise<Certification[]> => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
