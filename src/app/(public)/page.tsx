import type { Metadata } from "next";
import { HomeExperience } from "@/components/experience/home/HomeExperience";

export const metadata: Metadata = {
  title: "ANIRX — TOO CURIOUS TO STAY IN ONE LANE",
  description:
    "The personal digital universe of Anirudh Sharma — filmmaker, editor, coder, builder. Discover him the way he discovers everything: by going deeper.",
};

export default function Page() {
  return <HomeExperience />;
}
