# Corridor View — Use Cases & Asset Catalog

> **Why this doc exists:** the wall texture looks tapered in silhouette (thanks to `clip-path`) but the brick pattern *inside* each wall piece doesn't converge to the vanishing point — it's the same brick size top-to-bottom within a depth band, then jumps smaller at the next band. That's a limit of cropping a flat, repeating image into a trapezoid shape; it doesn't warp what's printed on it. Real Dungeon Master/EOB didn't compute this live either — they used art that was already pre-drawn with the taper baked into the pixels for each specific depth. This doc works out that same system for us: what scenes the corridor view needs to show, and the small set of reusable pieces that build every one of them.

---

## 1. How the renderer actually works (context for the asset list)

`renderCorridor()` in `game.js` doesn't draw one scene — it walks forward depth by depth (0 = the tile you're standing on, 1 = one step ahead, 2 = two steps ahead...) and at each depth independently asks three yes/no questions:

- Is there a wall immediately to my **left**?
- Is there a wall immediately to my **right**?
- Is there a wall **straight ahead** (does the corridor end here)?

Whatever the answers are, it draws the matching pieces and moves to the next depth (unless blocked, which ends the loop). This means **every scene the game will ever show is just a different combination of the same small set of per-depth pieces** — we don't need a unique picture per scene, we need one correct picture per *piece*, reused across however many scenes call for it.

---

## 2. View use cases

These are the situations the corridor view needs to be able to show, in MVP1's actual grid-based dungeon (a real maze with turns, not one straight hallway):

| # | Use case | Example |
|---|---|---|
| UC1 | **Open straight corridor** — walls both sides, corridor continues past render distance (fades to black) | Standard hallway |
| UC2 | **Dead end** — walls both sides, blocked straight ahead, at some depth 0–3 | Corridor stops |
| UC3 | **Corner / turn** — wall on one side continues, the other side opens up, forward is blocked (forcing a turn) | Path bends left or right |
| UC4 | **T-junction / crossroads** — openings on both sides at some depth, corridor may or may not continue ahead | Branch point |
| UC5 | **Doorway ahead** — same as a dead end, but the cap is a door instead of a blank wall | *(MVP3, not needed yet)* |
| UC6 | **Standing in a wide/open room** (more than one tile wide) | *(flagged below — current engine can't really do this yet)* |

**UC6 note:** the renderer only ever checks "is the *one* tile beside me a wall or not" — it has no idea whether an opening is a 1-tile side passage or the edge of a huge room. Right now both just render as blackness on that side. Making a genuinely wide room look right (seeing a distant far wall across an open room) is a bigger rendering problem than this engine currently solves — flagging it now so it's a known gap, not something to solve today. If Chapter 1's map design leans on big rooms rather than corridors, this needs its own follow-up.

UC1–UC4 are all just different arrangements of the same pieces — see below.

---

## 3. The reusable asset catalog

Because of how the renderer walks depth-by-depth, the only pieces that actually need new, properly-tapered art are the **side walls** (left/right) — those are the ones drawn at an angle, receding away from you, which is what needs the converging brick lines. The **ceiling/floor** trapezoids and the **forward-facing cap** (dead-end wall, viewed face-on, not at an angle) don't have this problem — a cap wall is already viewed straight-on, so a plain flat texture is correct for it as-is.

| Asset ID | What it is | Viewed at an angle (needs taper baked in)? | Status |
|---|---|---|---|
| `WALL-SIDE-0` | Side wall trapezoid, depth band 0→1 (nearest) | Yes | **Needed** |
| `WALL-SIDE-1` | Side wall trapezoid, depth band 1→2 | Yes | **Needed** |
| `WALL-SIDE-2` | Side wall trapezoid, depth band 2→3 | Yes | **Needed** |
| `WALL-SIDE-3` | Side wall trapezoid, depth band 3→4 (farthest) | Yes | **Needed** |
| `WALL-CAP-0`…`WALL-CAP-3` | Forward-facing dead-end wall at depth 0–3 | No (face-on) | Already working (plain texture, no change needed) |
| `CEIL-0`…`CEIL-3` | Ceiling trapezoid at depth 0–3 | Yes, but no art yet | Still placeholder color |
| `FLOOR-0`…`FLOOR-3` | Floor trapezoid at depth 0–3 | Yes, but no art yet | Still placeholder color |
| `DOOR-CAP-0`…`DOOR-CAP-3` | Forward-facing door instead of wall | No (face-on) | Not needed until MVP3 — `door_wood_01.png` already sliced and ready |

**The big one: only 4 new images needed.** `WALL-SIDE-0` through `WALL-SIDE-3` are the only genuinely new assets required to fix what you spotted. Left and right don't need separate images — the right wall is just the left wall's image mirrored horizontally (a CSS flip, not a new file). So 4 source images cover all 8 left/right slots across all 4 depths.

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
