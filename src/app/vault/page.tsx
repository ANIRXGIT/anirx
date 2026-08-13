import type { Metadata } from "next";
import { VaultIntro } from "@/components/experience/vault/VaultIntro";

export const metadata: Metadata = {
  title: "THE VAULT",
  description: "Restricted.",
  robots: { index: false, follow: false },
};

/**
 * THE VAULT — the door.
 * Real server-side authentication (password + email OTP) lands in Phase 03.
 * No fake frontend-only gate will ever stand in its place.
 */
export default function VaultPage() {
  return <VaultIntro />;
}
