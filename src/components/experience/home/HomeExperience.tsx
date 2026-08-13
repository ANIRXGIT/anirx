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
 * The homepage — v6, structure lock.
 * 01 THE ARRIVAL (hero — approved composition, untouched)
 * 02 THE WORLD (one continuous environment across seven worlds)
 * 03 THE THINGS I MAKE (artifact chapters: ASTRA / HOSTELMART / ANIRX)
 * 04 MAKE SOMETHING (full-screen contact end-title)
 * 05 ANIRX (the giant signature)
 * 06 THE VAULT (the full-screen door) + the small print
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
      <SceneSignature />
      <SceneVaultDoor />
    </>
  );
}
