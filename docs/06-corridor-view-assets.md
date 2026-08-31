# Corridor View — Use Cases & Asset Catalog

> **Why this doc exists:** the wall texture looks tapered in silhouette (thanks to `clip-path`) but the brick pattern *inside* each wall piece doesn't converge to the vanishing point — it's the same brick size top-to-bottom within a depth band, then jumps smaller at the next band. That's a limit of cropping a flat, repeating image into a trapezoid shape; it doesn't warp what's printed on it. Real Dungeon Master/EOB didn't compute this live either — they used art that was already pre-drawn with the taper baked into the pixels for each specific depth. This doc works out that same system for us: what scenes the corridor view needs to show, and the small set of reusable pieces that build every one of them.

---

## 0. Full use-case taxonomy (map-driven, not just "corridor shapes")

The first pass at this doc only worked out corridor topology (straight/dead-end/corner/T-junction). That's not the full picture of what a real dungeon map can put in front of the player — rooms, wide passages, and off-center viewing angles are all real cases a map can produce. This section works through all of them, organized by category, and is honest about which ones the current renderer already handles and which ones it can't.

**The one fact that decides everything below:** `renderCorridor()` only ever asks "is there a wall exactly 1 tile to the side of the path directly ahead of me" at each depth step. It has no concept of a wall 2+ tiles away laterally, and `RECT_SIZES` (the perspective shrink curve) doesn't encode real corridor/room width at all — it's the same fixed curve regardless of whether the space is 1 tile or 5 tiles wide. That single fact is why some cases below "just work" and others genuinely don't.

### A. Corridor topology (1-tile-wide passages) — already covered, no engine changes needed
Straight, dead-end (at any depth), left corner, right corner, T-junction (either or both sides open, forward open or blocked), 4-way crossing, S-bends/zigzags. All of these are just different yes/no patterns of the same per-depth check the renderer already does — confirmed working, this is what the first version of this doc covered.

### B. Open spaces wider than 1 tile (rooms, wide corridors) — partially works, partially a real gap
This is the category that needed the deeper look. Breaking "a room" down into what actually happens:

- **B1 — Walking dead-center toward a room's far wall, far wall within render distance.** Already works today, no code change. The renderer picks up the far wall as a forward-cap at whatever depth it's actually at — same code path as a dead end.
- **B2 — The far wall is wider than 1 tile.** Also already fine, for a reason worth calling out: the forward-cap piece is a *repeating texture*, not a fixed-size image, so it stretches to whatever width is needed with zero new assets. This is different from the side-wall taper problem — repeating textures scale for free, tapered art doesn't.
- **B3 — Room continues past render distance.** Same as an open corridor (fades to black). Already fine.
- **B4 — Standing off-center in a room, or anywhere wider than 1 tile, with a side wall more than 1 tile away.** **This is the real, genuine gap.** The renderer never checks anything beyond 1 tile to the side, so that wall simply isn't drawn — you'd see void on that side even though a wall exists a couple of tiles over. The moment you *turn to face it directly*, it renders correctly (that's just a forward-cap at whatever depth). So the precise gap is: **peripheral walls (to your side, not dead ahead) beyond 1 tile away never render.** Worth knowing: the original Dungeon Master and Eye of the Beholder had this exact same limitation — they also only ever rendered dead-ahead walls and immediately-adjacent side walls, nothing at a wider oblique angle. It's a real constraint of this whole genre's classic engines, not a shortcut unique to our placeholder build.

### C. Multi-tile-wide corridors (2-3 tiles wide, short of a full "room")
Same situation as B4 — walking off-center in a wide-but-not-huge passage has the identical peripheral-wall gap. No new case, just confirms B4 applies at smaller scale too.

### D. Doors / features on side walls vs. straight ahead
Every door/archway use case considered so far assumed you walk *straight into* it (a forward-cap). Open question for Chapter 1's actual design: will any door ever sit in a *side* wall — something you'd see peripherally as you walk past, not walk straight into? If yes, that needs new tapered art (a side-wall-with-a-door-cut-in, per depth) — a real catalog expansion. If every door in Chapter 1 is something you walk straight into, the existing `DOOR-CAP` concept already covers it with zero extra art.

### E. Free-standing obstructions (pillars/columns in an open room)
A column surrounded by floor on all sides is a genuinely different visual object from a bounding wall — it'd need its own prop-style art (viewed at a few depths/angles), not a reuse of `WALL-SIDE`/`WALL-CAP`. Flagging as a distinct future asset category, not scoping it now since it depends entirely on whether Chapter 1's room designs use them.

### F. Non-wall floor features (pits, stairs, trapdoors, item pedestals)
Not wall assets at all, but genuinely part of "what the view needs to show" on a full map. Flagging as a separate future asset category (probably tied to the puzzle/item work in MVP2-3) rather than folding it into this wall-focused doc.

### Net read
- Categories A, B1-B3, C(-when-facing-it) are **fully covered by the 4-asset plan already scoped** (`WALL-SIDE-0..3` + the existing repeating-texture cap).
- Category B4 (peripheral walls beyond 1 tile) is a **real engine gap**, not an asset gap — fixing it means widening what the renderer samples at each depth (checking more than 1 tile to each side), which is a bigger structural change, not new art.
- Categories D, E, F are **open scope questions** that depend on what Chapter 1's actual map design calls for, not on the rendering engine at all.

---

## 1. How the renderer actually works (context for the asset list)

`renderCorridor()` in `game.js` doesn't draw one scene — it walks forward depth by depth (0 = the tile you're standing on, 1 = one step ahead, 2 = two steps ahead...) and at each depth independently asks three yes/no questions:

- Is there a wall immediately to my **left**?
- Is there a wall immediately to my **right**?
- Is there a wall **straight ahead** (does the corridor end here)?

Whatever the answers are, it draws the matching pieces and moves to the next depth (unless blocked, which ends the loop). This means **every scene the game will ever show is just a different combination of the same small set of per-depth pieces** — we don't need a unique picture per scene, we need one correct picture per *piece*, reused across however many scenes call for it.

---

## 2. View use cases (corridor topology specifically)

The 4 scenarios below are Category A from Section 0 — the corridor-shape cases, all fully working today. See Section 0 for the full picture including rooms, wide passages, and where the real gaps are.

| # | Use case | Example |
|---|---|---|
| UC1 | **Open straight corridor** — walls both sides, corridor continues past render distance (fades to black) | Standard hallway |
| UC2 | **Dead end** — walls both sides, blocked straight ahead, at some depth 0–3 | Corridor stops |
| UC3 | **Corner / turn** — wall on one side continues, the other side opens up, forward is blocked (forcing a turn) | Path bends left or right |
| UC4 | **T-junction / crossroads** — openings on both sides at some depth, corridor may or may not continue ahead | Branch point |

UC1–UC4 are all just different arrangements of the same pieces — see below.

---

## 3. The reusable asset catalog

Because of how the renderer walks depth-by-depth, the only pieces that actually need new, properly-tapered art are the **side walls** (left/right) — those are the ones drawn at an angle, receding away from you, which is what needs the converging brick lines. The **ceiling/floor** trapezoids and the **forward-facing cap** (dead-end wall, viewed face-on, not at an angle) don't have this problem — a cap wall is already viewed straight-on, so a plain flat texture is correct for it as-is.

| Asset ID | What it is | Viewed at an angle (needs taper baked in)? | Status |
|---|---|---|---|
| `WALL-SIDE-0` | Side wall trapezoid, depth band 0→1 (nearest) | Yes | **Done** — `assets/tiles/wall_side_depth0.png` |
| `WALL-SIDE-1` | Side wall trapezoid, depth band 1→2 | Yes | **Done** — `wall_side_depth1.png` |
| `WALL-SIDE-2` | Side wall trapezoid, depth band 2→3 | Yes | **Done** — `wall_side_depth2.png` |
| `WALL-SIDE-3` | Side wall trapezoid, depth band 3→4 (farthest) | Yes | **Done** — `wall_side_depth3.png` |
| `WALL-CAP-0`…`WALL-CAP-3` | Forward-facing dead-end wall at depth 0–3 | No (face-on) | Already working (plain texture, no change needed) |
| `CEIL-0`…`CEIL-3` | Ceiling trapezoid at depth 0–3 | Yes, but no art yet | Still placeholder color |
| `FLOOR-0`…`FLOOR-3` | Floor trapezoid at depth 0–3 | Yes, but no art yet | Still placeholder color |
| `DOOR-CAP-0`…`DOOR-CAP-3` | Forward-facing door instead of wall | No (face-on) | Not needed until MVP3 — `door_wood_01.png` already sliced and ready |

**Only 4 new images needed, done via Option A (Python perspective warp).** `WALL-SIDE-0` through `WALL-SIDE-3` were generated by `tools/generate_wall_side_assets.py`, which takes `wall_plain_01.png`, tiles it a few times, and warps it with Pillow's perspective transform onto each depth band's exact trapezoid shape (using the same `RECT_SIZES` geometry as `game.js`, copied into the script on purpose — see the script's docstring). The right wall doesn't need a separate warp — it's the same image mirrored horizontally, which the script also generates (`*_mirrored.png`). Tried first because it was fast and reused art we already had; the result had genuinely converging brick coursing, so there was no need to fall back to generating fresh art via the image-gen AI.

---

## 4. Wireframes — how use cases compose from the catalog

Each row below is one depth step outward from the player. "—" means nothing is drawn there (open/void).

**UC1 — Open corridor**
```
depth 0: CEIL-0  WALL-SIDE-0(L)  WALL-SIDE-0(R)  FLOOR-0
depth 1: CEIL-1  WALL-SIDE-1(L)  WALL-SIDE-1(R)  FLOOR-1
depth 2: CEIL-2  WALL-SIDE-2(L)  WALL-SIDE-2(R)  FLOOR-2
depth 3: CEIL-3  WALL-SIDE-3(L)  WALL-SIDE-3(R)  FLOOR-3
         (nothing beyond — fades to black)
```

**UC2 — Dead end at depth 2**
```
depth 0: CEIL-0  WALL-SIDE-0(L)  WALL-SIDE-0(R)  FLOOR-0
depth 1: CEIL-1  WALL-SIDE-1(L)  WALL-SIDE-1(R)  FLOOR-1
depth 2: CEIL-2  WALL-SIDE-2(L)  WALL-SIDE-2(R)  FLOOR-2  ->  WALL-CAP-2
         (loop stops here)
```

**UC3 — Corner (path turns right at depth 1: left wall continues, right opens up, forward blocked)**
```
depth 0: CEIL-0  WALL-SIDE-0(L)  WALL-SIDE-0(R)  FLOOR-0
depth 1: CEIL-1  WALL-SIDE-1(L)  —(open right)   FLOOR-1  ->  WALL-CAP-1
         (loop stops here — you'd turn right to continue)
```

**UC4 — T-junction at depth 2 (both sides open, corridor also continues ahead)**
```
depth 0: CEIL-0  WALL-SIDE-0(L)  WALL-SIDE-0(R)  FLOOR-0
depth 1: CEIL-1  WALL-SIDE-1(L)  WALL-SIDE-1(R)  FLOOR-1
depth 2: CEIL-2  —(open left)    —(open right)   FLOOR-2
depth 3: CEIL-3  WALL-SIDE-3(L)  WALL-SIDE-3(R)  FLOOR-3
```

Every one of these is the exact same code path already in `renderCorridor()` — nothing about the *logic* changes. Only the wall pieces stop being a flat repeating texture and become one correctly-tapered image per depth band.

---

## 5. How to actually produce `WALL-SIDE-0..3`

Two ways to get there, not mutually exclusive:

**Option A — Warp the art we already have (recommended to try first).** Take `wall_plain_01.png` (already sliced from Dad's sheet) and use Python/Pillow's perspective transform to pre-warp a copy of it into each depth band's exact trapezoid shape, once, offline. This produces 4 new PNGs with genuinely converging brick lines, without waiting on a new art-generation pass — same source art, just correctly shaped. Cheap to try, easy to redo if it looks off.

**Option B — Generate fresh art per slot with the image-gen AI**, prompted to already show the correct taper (e.g. "stone wall viewed at a steep angle, receding into the distance, bricks foreshortening toward the right edge"). Image generators are inconsistent at hitting an exact geometric taper on request, so this would likely need a few tries per depth band, but could look more natural than a mechanically-warped texture, especially at the nearest depth.

Recommendation: try Option A first since it's fast and reuses art we already have — if the warped result looks noticeably artificial (stretched/blurry), fall back to Option B for just the pieces that need it.
