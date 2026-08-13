import { CinemaDirector } from "@/modes/CinemaDirector";
import { CineCursor } from "@/modes/CineCursor";
import { ProgressHairline } from "./ProgressHairline";
import { SceneArtifacts } from "./SceneArtifacts";
import { SceneHero } from "./SceneHero";
import { SceneMake } from "./SceneMake";
import { SceneSignature } from "./SceneSignature";
import { SceneVaultDoor } from "./SceneVaultDoor";
import { SceneWorlds } from "./SceneWorlds";

/**
 * The homepage — v7, final build.
 * 01 THE ARRIVAL     (hero — approved composition, untouched)
 * 02 THE WORLD       (one continuous environment across seven worlds + what I do)
 * 03 THINGS I BUILD  (artifact chapters: ASTRA / HOSTELMART / ANIRX)
 * 04 MAKE SOMETHING  (full-screen scroll contact sequence)
 * 05 THE VAULT       (full-screen door — the private world)
 * 06 ANIRX           (the final signature — closing title of the film)
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
      <SceneMake />
      <SceneVaultDoor />
      <SceneSignature />
    </>
  );
}
