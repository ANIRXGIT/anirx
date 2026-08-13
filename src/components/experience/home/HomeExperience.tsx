import { CinemaDirector } from "@/modes/CinemaDirector";
import { CineCursor } from "@/modes/CineCursor";
import { ProgressHairline } from "./ProgressHairline";
import { SceneArtifacts } from "./SceneArtifacts";
import { SceneEnd } from "./SceneEnd";
import { SceneHero } from "./SceneHero";
import { SceneWorlds } from "./SceneWorlds";

/**
 * The homepage — v5.1.
 * ACT 01 the name & the object (hero) → ACT 02 the worlds (one body,
 * seven minds) → ACT 03 the artifacts (ASTRA / HOSTELMART / ANIRX)
 * → ACT 04 end titles (ANIRX signature, the two doors).
 */
export function HomeExperience() {
  return (
    <>
      <CinemaDirector />
      <CineCursor />
      <ProgressHairline />
      <SceneHero />
      <SceneWorlds />
      <SceneArtifacts />
      <SceneEnd />
    </>
  );
}
