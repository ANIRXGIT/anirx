import { CinemaDirector } from "@/modes/CinemaDirector";
import { CineCursor } from "@/modes/CineCursor";
import { ProgressHairline } from "./ProgressHairline";
import { SceneEnter } from "./SceneEnter";
import { SceneFrames } from "./SceneFrames";
import { SceneHero } from "./SceneHero";
import { SceneLanes } from "./SceneLanes";

/**
 * The homepage — v3.
 * ACT 01 identity (timed, face + name in seconds) → ACT 02 the 7 frames
 * (one cinematic object) → ACT 03 the seven lanes (doors) → ACT 04 the two doors.
 */
export function HomeExperience() {
  return (
    <>

      <CinemaDirector />
      <CineCursor />
      <ProgressHairline />
      <SceneHero />
      <SceneFrames />
      <SceneLanes />
      <SceneEnter />
    </>
  );
}
