import { projects } from "@/content/projects";
import { Mark } from "@/components/ui/Mark";

/**
 * ACT 03 — THE ARTIFACTS. Things that ship, or are shipping.
 * Not cards: three typographic objects, each with its own weight.
 * Only real repository data ever renders — placeholders stay in the file.
 */

const ORDER = ["astra", "hostelmart", "anirx"] as const;

const TONES: Record<string, string> = {
  astra: "var(--tone-tech)",
  hostelmart: "var(--tone-gold)",
  anirx: "var(--accent-hi)",
};

const real = (v: string) => !v.startsWith("[ADD");

export function SceneArtifacts() {
  const artifacts = ORDER.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is (typeof projects)[number] => Boolean(p),
  );

  return (
    <section id="the-things-i-make" aria-label="The things I make" className="rule-double relative border-t border-line px-[var(--spacing-gutter)] py-20 md:py-28">
      <p className="mb-14 font-mono text-[10px] tracking-[0.4em] text-ink-faint md:mb-20">
        WHAT GETS BUILT AROUND HERE
      </p>

      <div className="flex flex-col">
        {artifacts.map((p) => (
          <article
            key={p.id}
            className="art-row group border-t border-line py-12 md:py-16"
            style={{ ["--art-tone" as string]: TONES[p.id] }}
          >
            <div className="grid gap-8 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-7">
                <div className="flex items-start gap-4">
                  <span className="mt-2 font-mono text-[10px] tracking-[0.3em] text-ink-faint">{p.index}</span>
                  <h3 className="art-title font-display text-[clamp(2.6rem,7.5vw,7rem)] font-extrabold leading-[0.95] tracking-tight">
                    {p.title}
                  </h3>
                  {p.id === "anirx" && (
                    <span className="mt-3 text-accent-hi">
                      <Mark size={26} />
                    </span>
                  )}
                </div>
                <p className="mt-4 max-w-[44ch] font-edit text-lg italic leading-snug text-ink-dim md:text-xl">
                  {p.subtitle}.
                </p>
                {real(p.description) && (
                  <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-dim">{p.description}</p>
                )}
              </div>

              <div className="flex flex-col justify-between gap-6 md:col-span-5 md:items-end md:text-right">
                <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[9px] tracking-[0.3em] text-ink-faint md:justify-end">
                  <span>{p.category}</span>
                  <span>{p.year}</span>
                  <span style={{ color: "var(--art-tone)" }}>{p.status.toUpperCase()}</span>
                </div>
                {p.technologies.filter(real).length > 0 && (
                  <ul className="flex flex-wrap gap-2 md:justify-end">
                    {p.technologies.filter(real).map((t) => (
                      <li key={t} className="border border-line px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-ink-dim">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {real(p.role) && (
                  <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">{p.role.toUpperCase()}</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
