# ANIRX — ASSET MANIFEST (v2)

The entire homepage runs on **three personal assets**. Nothing else.
They get reused through crops, masks, splits, filters and framing —
so each one must be good. Nothing is faked, nothing is stock.

When a file is in place, flip `available: false → true` in
`src/content/identity.ts`. Placeholders render until then.

---

## 01 — HERO VIDEO
**Path:** `media/hero/hero-main.mp4` (+ `hero-main.jpg` poster frame)
**Purpose:** the opening. A film scene, not an intro video.

The scene: the camera moves slowly through your workspace — editing
timeline on one screen, code on another, a camera within reach — and
finds you inside the work. Your face arrives at the end of the move.

| Property | Spec |
|---|---|
| Duration | **8–15 seconds**, one continuous shot |
| Aspect | **16:9 or wider**, 4K preferred (min 1920×1080), 24 fps |
| Movement | Slow slider / gimbal drift OR a locked frame with YOU moving through it. Constant gentle motion, never shaky |
| Beginning | Screen glow: timeline scrubbing, code, a lens — environmental detail |
| Ending | The move resolves on your face, lit, calm, mid-work |
| Lighting | Monitor glow + one practical (desk lamp). Faces forward. High contrast, high resolution |
| Environment | Your real workstation. Equipment visible is good. Brand logos hidden |
| Clothing | Plain dark. No text, no logos |
| Editing | No cuts, no music, no SFX. Natural speed. Light contrast pass only if needed |

**Must feel like:** a quiet scene from a film about someone who builds.
**Must NOT feel like:** a tech ad, a talking head, a vlog, a selfie.

---

## 02 — MAIN PORTRAIT
**Path:** `media/identity/portrait.jpg`
**Purpose:** identity, the 7 FRAMES device, WHO'S ANI later. It gets
masked, cropped, sliced and duotoned — it must survive abuse.

| Property | Spec |
|---|---|
| Aspect | **4:5 vertical**, ≥ 2400 px tall, sharp focus on the eyes |
| Lens | 50–85 mm equivalent, f/2.8–f/4 |
| Angle | Camera **slightly below eye level** — quiet authority, not selfie perspective |
| Lighting | Single soft key ~45° off-axis (rembrandt-ish falloff). Optional weak rim from behind for separation. No flat front flash |
| Background | Seamless dark grey / near-black, clean, 1–2 stops darker than your face |
| Clothing | Dark, plain, texture > pattern |
| Expression | Calm, direct into lens. A slight smirk edge is welcome — not a corporate smile |
| Framing | Head + shoulders + breathing room on all sides (we crop hard later) |
| Treatment | Minimal retouch — cleanup only. **No skin smoothing, no filters** |

**Not a resume headshot.** Think album cover of someone who builds things.

---

## 03 — SECONDARY / CANDID (optional)
**Path:** `media/identity/candid.jpg`
**Purpose:** humanity counterweight — used later in WHO'S ANI.

- Any orientation, ≥ 2000 px on the long edge.
- A real moment: sport, a walk between takes, mid-conversation, gym, street.
- Honest light. Unposed or barely posed. Motion blur welcome.
- Must be *of you*, shot recently.

---

## RULES
- Real footage/photos only. No stock people, no AI-generated personal imagery.
- Keep masters outside the repo; commit only web exports (MP4 H.264, JPG ~85).
- Placeholders stay visible until the real file lands — that is by design.
