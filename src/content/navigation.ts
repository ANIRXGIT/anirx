export interface NavItem {
  index: string;
  label: string;
  href: string;
  /** Sections built in later phases anchor to the homepage for now. */
  phase: 1 | 2 | 3;
  restricted?: boolean;
  /**
   * false = the destination does not exist yet. Rendered as an
   * intentional, non-interactive layer of the index — never a dead link.
   * Omit or true = live destination.
   */
  available?: boolean;
}

/**
 * Branded information architecture.
 * No "Home / About / Projects / Contact" here.
 */
export const navItems: NavItem[] = [
  { index: "01", label: "ENTER", href: "/", phase: 1 },
  { index: "02", label: "WHO'S ANI", href: "/#whos-ani", phase: 2, available: false },
  { index: "03", label: "THE THINGS I MAKE", href: "/#the-things-i-make", phase: 2, available: false },
  { index: "04", label: "FRAME BY FRAME", href: "/#frame-by-frame", phase: 2, available: false },
  { index: "05", label: "THE ERA", href: "/#the-era", phase: 2, available: false },
  { index: "06", label: "RIGHT NOW", href: "/#right-now", phase: 2, available: false },
  { index: "07", label: "THE VAULT", href: "/vault", phase: 3, restricted: true },
  { index: "08", label: "THE RECORD", href: "/#the-record", phase: 2, available: false },
  { index: "09", label: "MAKE SOMETHING", href: "/#make-something", phase: 2 },
];
