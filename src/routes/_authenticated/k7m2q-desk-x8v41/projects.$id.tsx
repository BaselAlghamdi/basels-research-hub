import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Field, FileField, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { supabase } from "@/integrations/supabase/client";
import { adminProjectsQuery, slugify } from "@/lib/admin";
import { PROJECT_CATEGORIES } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/k7m2q-desk-x8v41/projects/$id")({
  head: () => ({
    meta: [{ title: "Edit project — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ProjectEditor,
});

type Draft = {
  title: string;
  slug: string;
  category: string;
  project_date: string;
  summary: string;
  content_md: string;
  tools: string;
  cover_image_url: string | null;
  pdf_url: string | null;
  pdf_meta: string | null;
  excel_url: string | null;
  excel_meta: string | null;
  external_url: string;
  featured: boolean;
  published: boolean;
  gallery: string[];
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  category: PROJECT_CATEGORIES[0],
  project_date: new Date().toISOString().slice(0, 10),
  summary: "",
  content_md:
    "## Objective\n\n## Methodology\n\n## Analysis\n\n## Key Findings\n",
  tools: "",
  cover_image_url: null,
  pdf_url: null,
  pdf_meta: null,
  excel_url: null,
  excel_meta: null,
  external_url: "",
  featured: false,
  published: true,
  gallery: [],
};

function ProjectEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: all } = useQuery({ ...adminProjectsQuery, enabled: !isNew });
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || loaded || !all) return;
    const item = all.find((entry) => entry.id === id);
    if (!item) return;
    setDraft({
      title: item.title,
      slug: item.slug,
      category: item.category,
      project_date: item.project_date,
      summary: item.summary,
      content_md: item.content_md,
      tools: item.tools.join(", "),
      cover_image_url: item.cover_image_url,
      pdf_url: item.pdf_url,
      pdf_meta: item.pdf_meta,
      excel_url: item.excel_url,
      excel_meta: item.excel_meta,
      external_url: item.external_url ?? "",
      featured: item.featured,
      published: item.published,
      gallery: item.gallery,
    });
    setLoaded(true);
  }, [all, id, isNew, loaded]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim() || slugify(draft.title),
      category: draft.category,
      project_date: draft.project_date,
      summary: draft.summary.trim(),
      content_md: draft.content_md,
      tools: draft.tools
        .split(",")
        .map((tool) => tool.trim())
        .filter(Boolean),
      cover_image_url: draft.cover_image_url,
      pdf_url: draft.pdf_url,
      pdf_meta: draft.pdf_meta,
      excel_url: draft.excel_url,
      excel_meta: draft.excel_meta,
      external_url: draft.external_url.trim() || null,
      featured: draft.featured,
      published: draft.published,
      gallery: draft.gallery,
    };

    const { error: saveError } = isNew
      ? await supabase.from("projects").insert(payload)
      : await supabase.from("projects").update(payload).eq("id", id);

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    queryClient.invalidateQueries();
    navigate({ to: "/k7m2q-desk-x8v41" });
  }

  if (!loaded) {
    return <p className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <Link to="/k7m2q-desk-x8v41" className="text-xs text-muted-foreground hover:text-foreground">
        ← Back to content manager
      </Link>
      <h1 className="mt-4 text-2xl">{isNew ? "New project" : "Edit project"}</h1>

      <div className="mt-8 space-y-6">
        <Field label="Project title">
          <TextInput value={draft.title} onChange={(event) => set("title", event.target.value)} />
        </Field>

        <Field label="Slug" hint="leave blank to generate from the title">
          <TextInput
            value={draft.slug}
            placeholder={slugify(draft.title)}
            onChange={(event) => set("slug", event.target.value)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Category">
            <SelectInput
              value={draft.category}
              options={PROJECT_CATEGORIES}
              onChange={(event) => set("category", event.target.value)}
            />
          </Field>
          <Field label="Date">
            <TextInput
              type="date"
              value={draft.project_date}
              onChange={(event) => set("project_date", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Short description">
          <TextArea
            rows={3}
            value={draft.summary}
            onChange={(event) => set("summary", event.target.value)}
          />
        </Field>

        <Field label="Full description" hint="markdown — objective, methodology, analysis, findings">
          <TextArea
            rows={18}
            value={draft.content_md}
            onChange={(event) => set("content_md", event.target.value)}
          />
        </Field>

        <Field label="Tools used" hint="comma separated">
          <TextInput value={draft.tools} onChange={(event) => set("tools", event.target.value)} />
        </Field>

        <FileField
          label="Featured image"
          folder="projects/images"
          accept="image/*"
          value={draft.cover_image_url}
          onChange={(path) => set("cover_image_url", path)}
        />

        <div>
          <FileField
            label="Add gallery image"
            folder="projects/gallery"
            accept="image/*"
            value={null}
            onChange={(path) => {
              if (path) set("gallery", [...draft.gallery, path]);
            }}
          />
          {draft.gallery.length ? (
            <ul className="mt-3 space-y-1">
              {draft.gallery.map((entry, index) => (
                <li key={entry} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{entry}</span>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "gallery",
                        draft.gallery.filter((_, position) => position !== index),
                      )
                    }
                    className="text-destructive"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <FileField
          label="PDF report"
          folder="projects/pdf"
          accept="application/pdf"
          value={draft.pdf_url}
          meta={draft.pdf_meta}
          onChange={(path, meta) => {
            set("pdf_url", path);
            set("pdf_meta", meta);
          }}
        />

        <FileField
          label="Excel model"
          folder="projects/excel"
          accept=".xlsx,.xls,.csv"
          value={draft.excel_url}
          meta={draft.excel_meta}
          onChange={(path, meta) => {
            set("excel_url", path);
            set("excel_meta", meta);
          }}
        />

        <Field label="External link" hint="optional">
          <TextInput
            value={draft.external_url}
            onChange={(event) => set("external_url", event.target.value)}
          />
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => set("published", event.target.checked)}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(event) => set("featured", event.target.checked)}
            />
            Featured
          </label>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-3 border-t border-rule pt-6">
          <button
            onClick={save}
            disabled={saving || !draft.title.trim()}
            className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link to="/k7m2q-desk-x8v41" className="border border-input px-4 py-2 text-sm">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
