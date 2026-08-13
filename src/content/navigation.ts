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
  { index: "02", label: "THE WORLD", href: "/#whos-ani", phase: 1 },
  { index: "03", label: "THINGS I BUILD", href: "/#the-things-i-make", phase: 1 },
  { index: "04", label: "WHAT I DO", href: "/#what-i-do", phase: 1 },
  { index: "05", label: "MAKE SOMETHING", href: "/#make-something", phase: 1 },
  { index: "06", label: "THE VAULT", href: "/vault", phase: 3, restricted: true },
  { index: "07", label: "ANIRX", href: "/#anirx-signature", phase: 1 },
];
