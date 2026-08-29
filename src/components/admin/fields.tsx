import type { ReactNode } from "react";
import { useState } from "react";

import { fileUrl } from "@/lib/content";
import { uploadFile } from "@/lib/admin";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      {hint ? <span className="ml-2 text-[0.6875rem] text-muted-foreground">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} font-mono text-[0.8125rem] leading-relaxed`} />;
}

export function SelectInput({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...props} className={inputClass}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function FileField({
  label,
  folder,
  value,
  meta,
  accept,
  onChange,
}: {
  label: string;
  folder: string;
  value: string | null;
  meta?: string | null;
  accept?: string;
  onChange: (path: string | null, meta: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = fileUrl(value);

  async function handle(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadFile(folder, file);
      onChange(uploaded.path, uploaded.meta);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <span className="label-eyebrow">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept={accept}
          onChange={handle}
          disabled={busy}
          className="text-xs file:mr-3 file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-xs"
        />
        {busy ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
        {href ? (
          <>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              View current {meta ? `(${meta})` : ""}
            </a>
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
