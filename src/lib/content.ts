import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Research = Database["public"]["Tables"]["research"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];

export type SourceRef = { label: string; url: string };

export type ProfileSettings = {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  resume_url: string;
  location: string;
};

export type AboutSettings = {
  intro: string;
  education: { institution: string; credential: string; period: string; detail: string }[];
  certifications: { name: string; detail: string }[];
  skills: string[];
  interests: string[];
};

export const RESEARCH_CATEGORIES = [
  "Equity Research",
  "Investment Thesis",
  "Company Analysis",
  "Industry Research",
  "Macro",
  "Markets",
  "Educational",
] as const;

export const PROJECT_CATEGORIES = [
  "Financial Modeling",
  "Valuation",
  "Equity Research",
  "Investment Analysis",
  "Academic Projects",
] as const;

export const DEFAULT_PROFILE: ProfileSettings = {
  name: "Basel M. Alghamdi",
  role: "Finance Student @ King Abdulaziz University",
  email: "",
  linkedin: "https://www.linkedin.com/in/imbasel/",
  resume_url: "",
  location: "",
};

export const DEFAULT_ABOUT: AboutSettings = {
  intro: "",
  education: [],
  certifications: [],
  skills: [],
  interests: [],
};

/** Files live in a private store and are streamed through the site itself. */
export function fileUrl(value: string | null | undefined, download = false): string | null {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  const path = value.replace(/^\/+/, "");
  return `/api/public/files/${path}${download ? "?download=1" : ""}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00Z` : value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function parseSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is SourceRef => !!item && typeof item === "object")
    .map((item) => ({ label: String(item.label ?? ""), url: String(item.url ?? "") }))
    .filter((item) => item.label || item.url);
}

const RESEARCH_FIELDS = "*";

export const researchListQuery = queryOptions({
  queryKey: ["research", "list"],
  queryFn: async (): Promise<Research[]> => {
    const { data, error } = await supabase
      .from("research")
      .select(RESEARCH_FIELDS)
      .eq("published", true)
      .order("publication_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const researchItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["research", "item", slug],
    queryFn: async (): Promise<Research | null> => {
      const { data, error } = await supabase
        .from("research")
        .select(RESEARCH_FIELDS)
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

export const projectsListQuery = queryOptions({
  queryKey: ["projects", "list"],
  queryFn: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("project_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const projectItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projects", "item", slug],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<{ profile: ProfileSettings; about: AboutSettings }> => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const map = new Map((data ?? []).map((row) => [row.key, row.value]));
    return {
      profile: { ...DEFAULT_PROFILE, ...((map.get("profile") as object) ?? {}) },
      about: { ...DEFAULT_ABOUT, ...((map.get("about") as object) ?? {}) },
    };
  },
});
