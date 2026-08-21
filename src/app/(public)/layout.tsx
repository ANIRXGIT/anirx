import { Nav } from "@/components/chrome/Nav";

/**
 * The public world gets the chrome (nav, mode switch).
 * THE VAULT lives outside this group — chrome never crosses the door.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  );
}
