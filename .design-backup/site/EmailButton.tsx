import { Mail } from "lucide-react";
import type { MouseEvent } from "react";
import { toast } from "sonner";

export const CONTACT_EMAIL = "baselmsalghamdi@gmail.com";

export function gmailComposeUrl(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email);
    toast.success("Email address copied", { description: email });
  } catch {
    toast.info("Email address", { description: email });
  }
}

/**
 * Opens Gmail's compose window in a new tab. If the browser blocks the popup
 * (or Gmail cannot be reached), the address is copied to the clipboard instead
 * of leaving the visitor on a blank page. The current page never navigates.
 */
export function EmailButton({
  email = CONTACT_EMAIL,
  className,
  iconClassName = "size-4",
}: {
  email?: string;
  className?: string;
  iconClassName?: string;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    let opened: Window | null = null;
    try {
      opened = window.open(gmailComposeUrl(email), "_blank", "noopener,noreferrer");
    } catch {
      opened = null;
    }
    if (!opened) void copyEmail(email);
  }

  return (
    <a
      href={gmailComposeUrl(email)}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Email"
      title={email}
      className={className}
    >
      <Mail className={iconClassName} strokeWidth={1.75} />
    </a>
  );
}
