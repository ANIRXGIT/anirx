/**
 * THE VAULT — its own room. No public chrome, no mutation —
 * only the landmark the root layout used to provide.
 */
export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
