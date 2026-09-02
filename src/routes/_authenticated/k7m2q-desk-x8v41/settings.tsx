import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Field, FileField, TextArea, TextInput } from "@/components/admin/fields";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_ABOUT,
  DEFAULT_PROFILE,
  settingsQuery,
  type AboutSettings,
  type ProfileSettings,
} from "@/lib/content";

export const Route = createFileRoute("/_authenticated/k7m2q-desk-x8v41/settings")({
  head: () => ({
    meta: [{ title: "Site settings — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: SettingsEditor,
});

function SettingsEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [about, setAbout] = useState<AboutSettings>(DEFAULT_ABOUT);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data || loaded) return;
    setProfile(data.profile);
    setAbout(data.about);
    setLoaded(true);
  }, [data, loaded]);

  async function save() {
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert([
        { key: "profile", value: profile },
        { key: "about", value: about },
      ]);
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
      <h1 className="mt-4 text-2xl">Site settings</h1>

      <div className="mt-8 space-y-6">
        <Field label="Name">
          <TextInput
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
        </Field>
        <Field label="Role / headline">
          <TextInput
            value={profile.role}
            onChange={(event) => setProfile({ ...profile, role: event.target.value })}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email">
            <TextInput
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
            />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput
              value={profile.linkedin}
              onChange={(event) => setProfile({ ...profile, linkedin: event.target.value })}
            />
          </Field>
          <Field label="Location" hint="optional">
            <TextInput
              value={profile.location}
              onChange={(event) => setProfile({ ...profile, location: event.target.value })}
            />
          </Field>
        </div>

        <FileField
          label="Resume (PDF)"
          folder="resume"
          accept="application/pdf"
          value={profile.resume_url || null}
          onChange={(path) => setProfile({ ...profile, resume_url: path ?? "" })}
        />

        <Field label="About introduction">
          <TextArea
            rows={6}
            value={about.intro}
            onChange={(event) => setAbout({ ...about, intro: event.target.value })}
          />
        </Field>

        <Field label="Skills" hint="comma separated">
          <TextInput
            value={about.skills.join(", ")}
            onChange={(event) =>
              setAbout({
                ...about,
                skills: event.target.value
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>

        <Field label="Areas of interest" hint="comma separated">
          <TextInput
            value={about.interests.join(", ")}
            onChange={(event) =>
              setAbout({
                ...about,
                interests: event.target.value
                  .split(",")
                  .map((interest) => interest.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>

        <div>
          <span className="label-eyebrow">Education</span>
          <div className="mt-2 space-y-3">
            {about.education.map((entry, index) => (
              <div key={index} className="grid gap-2 border border-border p-3 sm:grid-cols-2">
                {(["credential", "institution", "period", "detail"] as const).map((key) => (
                  <input
                    key={key}
                    value={entry[key]}
                    placeholder={key}
                    onChange={(event) =>
                      setAbout({
                        ...about,
                        education: about.education.map((row, position) =>
                          position === index ? { ...row, [key]: event.target.value } : row,
                        ),
                      })
                    }
                    className="border border-input bg-background px-3 py-2 text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAbout({
                      ...about,
                      education: about.education.filter((_, position) => position !== index),
                    })
                  }
                  className="justify-self-start text-xs text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setAbout({
                  ...about,
                  education: [
                    ...about.education,
                    { institution: "", credential: "", period: "", detail: "" },
                  ],
                })
              }
              className="border border-input px-3 py-1.5 text-xs"
            >
              Add education entry
            </button>
          </div>
        </div>

        <div>
          <span className="label-eyebrow">Certifications</span>
          <div className="mt-2 space-y-3">
            {about.certifications.map((entry, index) => (
              <div key={index} className="grid gap-2 border border-border p-3 sm:grid-cols-2">
                {(["name", "detail"] as const).map((key) => (
                  <input
                    key={key}
                    value={entry[key]}
                    placeholder={key}
                    onChange={(event) =>
                      setAbout({
                        ...about,
                        certifications: about.certifications.map((row, position) =>
                          position === index ? { ...row, [key]: event.target.value } : row,
                        ),
                      })
                    }
                    className="border border-input bg-background px-3 py-2 text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAbout({
                      ...about,
                      certifications: about.certifications.filter(
                        (_, position) => position !== index,
                      ),
                    })
                  }
                  className="justify-self-start text-xs text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setAbout({
                  ...about,
                  certifications: [...about.certifications, { name: "", detail: "" }],
                })
              }
              className="border border-input px-3 py-1.5 text-xs"
            >
              Add certification
            </button>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-3 border-t border-rule pt-6">
          <button
            onClick={save}
            disabled={saving}
            className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          <Link to="/k7m2q-desk-x8v41" className="border border-input px-4 py-2 text-sm">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
