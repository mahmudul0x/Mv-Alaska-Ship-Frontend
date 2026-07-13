/** Copy text to the clipboard, reporting whether it worked.
 *
 * `navigator.clipboard` is undefined on any non-HTTPS, non-localhost origin (and
 * on older Safari), so calling it unguarded throws rather than failing softly.
 * Falls back to a hidden textarea + execCommand, and finally reports failure so
 * callers can tell the user instead of silently doing nothing.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
