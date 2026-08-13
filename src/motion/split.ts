/** Wrap characters in spans for staggered reveals.
 *  Original text stays accessible via aria-label; spans are aria-hidden.
 *  Run only when animating — static render keeps plain text. */
export function splitLetters(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const spans: HTMLElement[] = [];
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "inline-block will-change-transform";
    span.setAttribute("aria-hidden", "true");
    span.textContent = ch === " " ? "\u00A0" : ch;
    el.appendChild(span);
    spans.push(span);
  }
  return spans;
}
