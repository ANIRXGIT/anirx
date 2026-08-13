import Link from "next/link";
import { site, socials } from "@/content/site";

/**
 * ACT 04 — THE CHOICE. Public world, or the door.
 * One quiet editorial page. Nothing drifts, nothing repeats.
 */
export function SceneEnter() {
  return (
    <section aria-label="The choice" className="rule-double relative border-t border-line">
      <div className="grid md:grid-cols-2">
        {/* the maroon seam between the two doors */}
        <span aria-hidden className="absolute left-1/2 top-0 hidden h-full w-px bg-accent/50 md:block" />

        <div id="make-something" className="flex flex-col gap-8 px-[var(--spacing-gutter)] py-20 md:py-24">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-tight">
            MAKE SOMETHING<span className="text-accent-hi">.</span>
          </h2>
          <p className="max-w-[38ch] text-sm leading-relaxed text-ink-dim">
            If you have something interesting to build, film, launch or fix —
            I&apos;d rather hear about it than not.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="w-fit border-b border-accent pb-1 font-mono text-sm tracking-[0.2em] text-ink transition-colors hover:text-accent-hi"
          >
            {site.email}
          </a>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] tracking-[0.25em] text-ink-faint transition-colors hover:text-ink"
                >
                  {s.label.toUpperCase()} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8 border-t border-line px-[var(--spacing-gutter)] py-20 md:border-t-0 md:py-24">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-tight text-accent-hi">
            THE VAULT<span className="text-ink">.</span>
          </h2>
          <p className="max-w-[38ch] text-sm leading-relaxed text-ink-dim">
            Some things aren&apos;t for everyone. Behind this door runs ANIERA —
            the private operating system that runs the person.
          </p>
          <div>
            <Link
              href="/vault"
              className="group inline-flex items-center gap-3 border border-accent px-7 py-3.5 font-mono text-[11px] tracking-[0.3em] text-accent-hi transition-colors duration-500 hover:bg-accent hover:text-[var(--color-ink-media)]"
            >
              REQUEST ENTRY
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <p className="mt-3 font-mono text-[8px] tracking-[0.25em] text-ink-faint">ENTRY RESTRICTED</p>
          </div>
        </div>
      </div>

      {/* quiet signature */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[var(--spacing-gutter)] py-5">
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
          © {new Date().getFullYear()} ANIRUDH SHARMA — ANIRX.IN
        </p>
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">{site.statement}</p>
      </footer>
    </section>
  );
}
