import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Field, FileField, SelectInput, TextArea, TextInput } from "@/components/admin/fields";
import { supabase } from "@/integrations/supabase/client";
import { adminResearchQuery, slugify } from "@/lib/admin";
import { RESEARCH_CATEGORIES, parseSources, type SourceRef } from "@/lib/content";
import { estimateReadingTime } from "@/lib/markdown";

export const Route = createFileRoute("/_authenticated/k7m2q-desk-x8v41/research/$id")({
  head: () => ({
    meta: [{ title: "Edit research — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ResearchEditor,
});

type Draft = {
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  summary: string;
  publication_date: string;
  reading_time: number | null;
  author: string;
  ticker: string;
  cover_image_url: string | null;
  content_md: string;
  tags: string;
  featured: boolean;
  published: boolean;
  pdf_url: string | null;
  pdf_meta: string | null;
  excel_url: string | null;
  excel_meta: string | null;
  external_url: string;
  sources: SourceRef[];
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  category: RESEARCH_CATEGORIES[0],
  subtitle: "",
  summary: "",
  publication_date: new Date().toISOString().slice(0, 10),
  reading_time: null,
  author: "Basel M. Alghamdi",
  ticker: "",
  cover_image_url: null,
  content_md: "",
  tags: "",
  featured: false,
  published: true,
  pdf_url: null,
  pdf_meta: null,
  excel_url: null,
  excel_meta: null,
  external_url: "",
  sources: [],
};

function ResearchEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: all } = useQuery({ ...adminResearchQuery, enabled: !isNew });
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
      subtitle: item.subtitle ?? "",
      summary: item.summary,
      publication_date: item.publication_date,
      reading_time: item.reading_time,
      author: item.author,
      ticker: item.ticker ?? "",
      cover_image_url: item.cover_image_url,
      content_md: item.content_md,
      tags: item.tags.join(", "),
      featured: item.featured,
      published: item.published,
      pdf_url: item.pdf_url,
      pdf_meta: item.pdf_meta,
      excel_url: item.excel_url,
      excel_meta: item.excel_meta,
      external_url: item.external_url ?? "",
      sources: parseSources(item.sources),
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
      slug: (draft.slug.trim() || slugify(draft.title)) as string,
      category: draft.category,
      subtitle: draft.subtitle.trim() || null,
      summary: draft.summary.trim(),
      publication_date: draft.publication_date,
      reading_time: draft.reading_time ?? estimateReadingTime(draft.content_md),
      author: draft.author.trim() || "Basel M. Alghamdi",
      ticker: draft.ticker.trim() || null,
      cover_image_url: draft.cover_image_url,
      content_md: draft.content_md,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      featured: draft.featured,
      published: draft.published,
      pdf_url: draft.pdf_url,
      pdf_meta: draft.pdf_meta,
      excel_url: draft.excel_url,
      excel_meta: draft.excel_meta,
      external_url: draft.external_url.trim() || null,
      sources: draft.sources.filter((source) => source.label || source.url),
    };

    const { error: saveError } = isNew
      ? await supabase.from("research").insert(payload)
      : await supabase.from("research").update(payload).eq("id", id);

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
      <h1 className="mt-4 text-2xl">{isNew ? "New research" : "Edit research"}</h1>

      <div className="mt-8 space-y-6">
        <Field label="Title">
          <TextInput
            value={draft.title}
            onChange={(event) => {
              const value = event.target.value;
              setDraft((current) => ({
                ...current,
                title: value,
                slug: isNew && !current.slug ? "" : current.slug,
              }));
            }}
          />
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
              options={RESEARCH_CATEGORIES}
              onChange={(event) => set("category", event.target.value)}
            />
          </Field>
          <Field label="Publication date">
            <TextInput
              type="date"
              value={draft.publication_date}
              onChange={(event) => set("publication_date", event.target.value)}
            />
          </Field>
          <Field label="Ticker / company" hint="optional">
            <TextInput value={draft.ticker} onChange={(event) => set("ticker", event.target.value)} />
          </Field>
          <Field label="Reading time (min)" hint="blank = auto">
            <TextInput
              type="number"
              min={1}
              value={draft.reading_time ?? ""}
              onChange={(event) =>
                set("reading_time", event.target.value ? Number(event.target.value) : null)
              }
            />
          </Field>
        </div>

        <Field label="Thesis summary / subtitle" hint="optional">
          <TextInput value={draft.subtitle} onChange={(event) => set("subtitle", event.target.value)} />
        </Field>

        <Field label="Short description">
          <TextArea
            rows={3}
            value={draft.summary}
            onChange={(event) => set("summary", event.target.value)}
          />
        </Field>

        <Field
          label="Article content"
          hint="markdown: # headings, **bold**, - lists, > quotes, tables, ![caption](image-url)"
        >
          <TextArea
            rows={22}
            value={draft.content_md}
            onChange={(event) => set("content_md", event.target.value)}
          />
        </Field>

        <FileField
          label="Cover image / hero chart"
          folder="research/images"
          accept="image/*"
          value={draft.cover_image_url}
          onChange={(path) => set("cover_image_url", path)}
        />

        <FileField
          label="PDF report"
          folder="research/pdf"
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
          folder="research/excel"
          accept=".xlsx,.xls,.csv"
          value={draft.excel_url}
          meta={draft.excel_meta}
          onChange={(path, meta) => {
            set("excel_url", path);
            set("excel_meta", meta);
          }}
        />

        <Field label="External source URL" hint="optional">
          <TextInput
            value={draft.external_url}
            onChange={(event) => set("external_url", event.target.value)}
          />
        </Field>

        <Field label="Tags" hint="comma separated">
          <TextInput value={draft.tags} onChange={(event) => set("tags", event.target.value)} />
        </Field>

        <div>
          <span className="label-eyebrow">Sources &amp; references</span>
          <div className="mt-2 space-y-2">
            {draft.sources.map((source, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                <input
                  value={source.label}
                  placeholder="Label"
                  onChange={(event) =>
                    set(
                      "sources",
                      draft.sources.map((entry, position) =>
                        position === index ? { ...entry, label: event.target.value } : entry,
                      ),
                    )
                  }
                  className="min-w-0 flex-1 border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  value={source.url}
                  placeholder="https://"
                  onChange={(event) =>
                    set(
                      "sources",
                      draft.sources.map((entry, position) =>
                        position === index ? { ...entry, url: event.target.value } : entry,
                      ),
                    )
                  }
                  className="min-w-0 flex-1 border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "sources",
                      draft.sources.filter((_, position) => position !== index),
                    )
                  }
                  className="border border-input px-3 text-xs text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("sources", [...draft.sources, { label: "", url: "" }])}
              className="border border-input px-3 py-1.5 text-xs"
            >
              Add source
            </button>
          </div>
        </div>

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
