import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Field, FileField, TextArea, TextInput } from "@/components/admin/fields";
import { supabase } from "@/integrations/supabase/client";
import { adminCertificationsQuery } from "@/lib/admin";
import { safeExternalUrl } from "@/lib/certifications";

export const Route = createFileRoute("/_authenticated/k7m2q-desk-x8v41/certifications/$id")({
  head: () => ({
    meta: [{ title: "Edit certification — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CertificationEditor,
});

type Draft = {
  name: string;
  issuer: string;
  description: string;
  issue_date: string;
  expiration_date: string;
  does_not_expire: boolean;
  credential_id: string;
  credential_url: string;
  certificate_image_path: string | null;
  certificate_pdf_path: string | null;
  issuer_logo_path: string | null;
  skills: string;
  featured: boolean;
  published: boolean;
  display_order: number;
};

const EMPTY: Draft = {
  name: "",
  issuer: "",
  description: "",
  issue_date: "",
  expiration_date: "",
  does_not_expire: true,
  credential_id: "",
  credential_url: "",
  certificate_image_path: null,
  certificate_pdf_path: null,
  issuer_logo_path: null,
  skills: "",
  featured: false,
  published: true,
  display_order: 0,
};

function CertificationEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: all } = useQuery({ ...adminCertificationsQuery, enabled: !isNew });
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || loaded || !all) return;
    const item = all.find((entry) => entry.id === id);
    if (!item) return;
    setDraft({
      name: item.name,
      issuer: item.issuer,
      description: item.description,
      issue_date: item.issue_date ?? "",
      expiration_date: item.expiration_date ?? "",
      does_not_expire: item.does_not_expire,
      credential_id: item.credential_id ?? "",
      credential_url: item.credential_url ?? "",
      certificate_image_path: item.certificate_image_path,
      certificate_pdf_path: item.certificate_pdf_path,
      issuer_logo_path: item.issuer_logo_path,
      skills: item.skills.join(", "),
      featured: item.featured,
      published: item.published,
      display_order: item.display_order,
    });
    setLoaded(true);
  }, [all, id, isNew, loaded]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);

    const credentialUrl = draft.credential_url.trim()
      ? safeExternalUrl(draft.credential_url)
      : null;
    if (draft.credential_url.trim() && !credentialUrl) {
      setSaving(false);
      setError("Credential URL must be a valid http(s) link.");
      return;
    }

    const payload = {
      name: draft.name.trim(),
      issuer: draft.issuer.trim(),
      description: draft.description.trim(),
      issue_date: draft.issue_date || null,
      expiration_date: draft.does_not_expire ? null : draft.expiration_date || null,
      does_not_expire: draft.does_not_expire,
      credential_id: draft.credential_id.trim() || null,
      credential_url: credentialUrl,
      certificate_image_path: draft.certificate_image_path,
      certificate_pdf_path: draft.certificate_pdf_path,
      issuer_logo_path: draft.issuer_logo_path,
      skills: draft.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      featured: draft.featured,
      published: draft.published,
      display_order: Number.isFinite(draft.display_order) ? draft.display_order : 0,
    };

    const { error: saveError } = isNew
      ? await supabase.from("certifications").insert(payload)
      : await supabase.from("certifications").update(payload).eq("id", id);

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
      <h1 className="mt-4 text-2xl">{isNew ? "New certification" : "Edit certification"}</h1>

      <div className="mt-8 space-y-6">
        <Field label="Certification name">
          <TextInput value={draft.name} onChange={(event) => set("name", event.target.value)} />
        </Field>

        <Field label="Issuing organization">
          <TextInput value={draft.issuer} onChange={(event) => set("issuer", event.target.value)} />
        </Field>

        <Field label="Short description" hint="optional">
          <TextArea
            rows={3}
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Issue date" hint="optional">
            <TextInput
              type="date"
              value={draft.issue_date}
              onChange={(event) => set("issue_date", event.target.value)}
            />
          </Field>
          <Field label="Expiration date" hint="optional">
            <TextInput
              type="date"
              disabled={draft.does_not_expire}
              value={draft.expiration_date}
              onChange={(event) => set("expiration_date", event.target.value)}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.does_not_expire}
            onChange={(event) => set("does_not_expire", event.target.checked)}
          />
          Does not expire
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Credential ID" hint="optional">
            <TextInput
              value={draft.credential_id}
              onChange={(event) => set("credential_id", event.target.value)}
            />
          </Field>
          <Field label="Credential URL" hint="optional, https link">
            <TextInput
              value={draft.credential_url}
              placeholder="https://"
              onChange={(event) => set("credential_url", event.target.value)}
            />
          </Field>
        </div>

        <FileField
          label="Certificate image"
          folder="certifications/images"
          accept=".jpg,.jpeg,.png,.webp"
          value={draft.certificate_image_path}
          onChange={(path) => set("certificate_image_path", path)}
        />

        <FileField
          label="Certificate PDF"
          folder="certifications/pdf"
          accept="application/pdf"
          value={draft.certificate_pdf_path}
          onChange={(path) => set("certificate_pdf_path", path)}
        />

        <FileField
          label="Issuer logo"
          folder="certifications/logos"
          accept=".jpg,.jpeg,.png,.webp"
          value={draft.issuer_logo_path}
          onChange={(path) => set("issuer_logo_path", path)}
        />

        <Field label="Skills / tags" hint="comma separated">
          <TextInput value={draft.skills} onChange={(event) => set("skills", event.target.value)} />
        </Field>

        <Field label="Display order" hint="lower numbers appear first">
          <TextInput
            type="number"
            value={String(draft.display_order)}
            onChange={(event) => set("display_order", Number(event.target.value))}
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
            disabled={saving || !draft.name.trim() || !draft.issuer.trim()}
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
